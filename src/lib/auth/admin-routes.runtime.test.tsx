import assert from "node:assert/strict";
import { before, mock, test } from "node:test";

let currentAdmin: { id: string; email: string; name: string } | null = null;
let redirectTarget: string | null = null;

class RedirectSignal extends Error {}

mock.module("@/lib/auth/admin", {
  namedExports: { getCurrentAdmin: async () => currentAdmin },
});
mock.module("@/lib/auth/authorization", {
  namedExports: { getAuthorizationContext: async () => ({ admin: currentAdmin, role: "SUPER_ADMIN", permissions: new Set(["dashboard.view"]) }) },
});
mock.module("next/navigation", {
  namedExports: {
    redirect: (target: string) => {
      redirectTarget = target;
      throw new RedirectSignal(target);
    },
  },
});
mock.module("@/components/admin/AdminSessionProvider", {
  namedExports: { AdminSessionProvider: ({ children }: { children: unknown }) => children },
});
mock.module("@/components/admin/AdminSidebar", {
  namedExports: { AdminSidebar: () => null },
});

let AdminIndexPage: typeof import("@/app/admin/page")["default"];
let AdminLayout: typeof import("@/app/admin/(protected)/layout")["default"];
before(async () => {
  ({ default: AdminIndexPage } = await import("@/app/admin/page"));
  ({ default: AdminLayout } = await import("@/app/admin/(protected)/layout"));
});
const validAdmin = { id: "11111111-1111-4111-8111-111111111111", email: "admin@example.invalid", name: "Admin" };

test("admin entry redirects invalid session to login", async () => {
  currentAdmin = null;
  redirectTarget = null;
  await assert.rejects(AdminIndexPage, RedirectSignal);
  assert.equal(redirectTarget, "/admin/login");
});

test("admin entry redirects trusted administrator to dashboard", async () => {
  currentAdmin = validAdmin;
  redirectTarget = null;
  await assert.rejects(AdminIndexPage, RedirectSignal);
  assert.equal(redirectTarget, "/admin/dashboard");
});

for (const state of ["missing", "stale", "deleted", "inactive"] as const) {
  test(`protected layout redirects ${state} authorization to login`, async () => {
    currentAdmin = null;
    redirectTarget = null;
    await assert.rejects(() => AdminLayout({ children: state }), RedirectSignal);
    assert.equal(redirectTarget, "/admin/login");
  });
}

test("protected layout renders only after trusted administrator is returned", async () => {
  currentAdmin = validAdmin;
  redirectTarget = null;
  const result = await AdminLayout({ children: "protected" });
  assert.equal(result.props.children.props.children[1].props.children, "protected");
  assert.equal(redirectTarget, null);
});
