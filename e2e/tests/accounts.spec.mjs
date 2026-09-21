import { test, expect } from "playwright/test";
import pg from "pg";
import bcrypt from "bcryptjs";

async function signIn(page, email, password) {
  await page.goto("/admin/login");
  await page.getByLabel("Email or Username").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/(?!login)/);
}
test("account lifecycle, password invalidation, role restrictions and audit", async ({ page, browser }, info) => {
  await signIn(page,process.env.E2E_ADMIN_EMAIL,process.env.E2E_ADMIN_PASSWORD);
  await page.goto("/admin/users");
  const own = page.locator("article").filter({ hasText: process.env.E2E_ADMIN_EMAIL });
  await expect(own.getByRole("button", { name: "Delete account" })).toBeDisabled();
  const email = `editor-${info.project.name}-${Date.now()}@example.test`;
  const password = "Disposable-editor-password-123";
  const replacement = "Changed-editor-password-456";
  await page.getByLabel("Name", { exact: true }).fill("Disposable editor");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Initial password").fill(password);
  await page.getByLabel("Role", { exact: true }).selectOption("EDITOR");
  await page.getByRole("button", { name: "Add administrator" }).click();
  const account = page.locator("article").filter({ hasText: email });
  await expect(account).toBeVisible();
  const context = await browser.newContext();
  const editor = await context.newPage();
  // Absolute origin is needed for a separately-created context.
  await editor.goto(new URL("/admin/login",page.url()).href);
  await editor.getByLabel("Email or Username").fill(email);
  await editor.getByLabel("Password", { exact: true }).fill(password);
  await editor.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(editor).toHaveURL(/\/admin\/(?!login)/);
  await editor.goto(new URL("/admin/account",page.url()).href);
  await editor.getByLabel("Current password").fill("wrong-password");
  await editor.getByLabel("New password", { exact: true }).fill(replacement);
  await editor.getByLabel("Confirm new password").fill(replacement);
  await editor.getByRole("button", { name: "Change password" }).click();
  await expect(editor.getByRole("alert").filter({ hasText: "Password change rejected." })).toBeVisible();
  await expect(editor.getByRole("button", { name: "Change password" })).toBeEnabled();
  await editor.getByLabel("Current password").fill(password);
  // Refill all fields to exercise a complete retry.
  await editor.getByLabel("New password", { exact: true }).fill(replacement);
  await editor.getByLabel("Confirm new password").fill(replacement);
  await editor.getByRole("button", { name: "Change password" }).click();
  await expect(editor).toHaveURL(/passwordChanged=1/);
  await editor.goto(new URL("/admin/account",page.url()).href);
  await expect(editor).toHaveURL(/\/admin\/login/);
  await editor.getByLabel("Email or Username").fill(email);
  await editor.getByLabel("Password", { exact: true }).fill(password);
  await editor.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(editor.getByRole("alert").filter({ hasText: "Invalid" })).toBeVisible();
  await editor.getByLabel("Email or Username").fill(email);
  await editor.getByLabel("Password", { exact: true }).fill(replacement);
  await editor.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(editor).toHaveURL(/\/admin\/(?!login)/);
  await editor.goto(new URL("/admin/users",page.url()).href);
  await expect(editor.getByRole("heading", { name: "Administrators", exact: true })).not.toBeVisible();
  await page.reload();
  await expect(account).not.toContainText("Not recorded");
  await account.getByLabel("Assign role").selectOption("ADMIN");
  await account.getByRole("button", { name: "Save role" }).click();
  await expect(account.getByRole("status")).toBeVisible();
  await editor.goto(new URL("/admin/account",page.url()).href);
  await expect(editor).toHaveURL(/\/admin\/login/);
  const db = new pg.Client({connectionString:process.env.DATABASE_URL});
  await db.connect();
  try {
    const user=(await db.query("SELECT password_hash,session_version,last_login_at FROM admin_users WHERE email=$1",[email])).rows[0];
    expect(user.password_hash).not.toBe(replacement);
    expect(await bcrypt.compare(replacement,user.password_hash)).toBe(true);
    expect(user.session_version).toBeGreaterThanOrEqual(3);
    expect(user.last_login_at).toBeTruthy();
  } finally { await db.end(); }
  await account.getByRole("checkbox", { name: "Confirm deletion" }).check();
  await account.getByRole("button", { name: "Delete account" }).click();
  await expect(account).toHaveCount(0);
  await page.goto("/admin/security");
  await expect(page.getByText("Deleted administrator account", { exact: true }).first()).toBeVisible();
  await context.close();
});
