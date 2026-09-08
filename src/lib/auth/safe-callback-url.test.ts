import assert from "node:assert/strict";
import test from "node:test";
import { getSafeAdminCallbackUrl } from "./safe-callback-url";

const fallback = "/admin/dashboard";

const unsafeCallbacks: Array<[string, string | null | undefined]> = [
  ["null", null],
  ["undefined", undefined],
  ["empty", ""],
  ["absolute HTTPS", "https://evil.example/admin"],
  ["absolute HTTP", "http://evil.example/admin"],
  ["trusted-looking absolute URL", "https://trusted-looking.example/@evil/admin"],
  ["scheme without slashes (HTTPS)", "https:evil.example"],
  ["scheme without slashes (HTTP)", "http:evil.example"],
  ["protocol-relative", "//evil.example/admin"],
  ["triple slash", "///evil.example/admin"],
  ["non-admin local path", "/contact"],
  ["JavaScript scheme", "javascript:alert(1)"],
  ["mixed-case JavaScript scheme", "JaVaScRiPt:alert(1)"],
  ["data scheme", "data:text/html,<script>alert(1)</script>"],
  ["mixed-case data scheme", "DaTa:text/html,test"],
  ["VBScript scheme", "vbscript:msgbox(1)"],
  ["not a URL", "not-a-url"],
  ["single leading backslash", String.raw`\evil.example`],
  ["UNC-style leading backslashes", String.raw`\\evil.example`],
  ["slash-backslash authority", String.raw`/\evil.example`],
  ["backslash-slash authority", String.raw`\/evil.example`],
  ["backslash inside admin path", String.raw`/admin\portfolio`],
  ["slash-backslash inside admin path", String.raw`/admin/\evil.example`],
  ["administrator prefix", "/administrator"],
  ["adminx prefix", "/adminx"],
  ["admin-hyphen prefix", "/admin-x"],
  ["admin-dot prefix", "/admin.evil"],
  ["admin-at prefix", "/admin@evil.example"],
  ["admin-colon prefix", "/admin:evil"],
  ["dot-segment root escape", "/admin/.."],
  ["dot-segment slash escape", "/admin/../"],
  ["dot-segment contact escape", "/admin/../contact"],
  ["mixed dot-segment escape", "/admin/./../contact"],
  ["encoded protocol-relative input", "%2F%2Fevil.example"],
  ["encoded second slash", "/%2Fevil.example"],
  ["encoded admin separator", "/admin%2Fevil"],
  ["encoded traversal", "/admin/%2e%2e/contact"],
  ["mixed encoded traversal", "/admin/%2E./contact"],
  ["leading whitespace", " /admin"],
  ["trailing whitespace", "/admin "],
  ["embedded TAB", "/admin\t/portfolio"],
  ["embedded LF", "/admin\n/portfolio"],
  ["embedded CR", "/admin\r/portfolio"],
  ["embedded NUL", "/admin\0/portfolio"],
  ["Unicode division slash", "/admin∕portfolio"],
  ["Unicode fraction slash", "/admin⁄portfolio"],
  ["full-width admin prefix", "/ａｄｍｉｎ"],
  ["non-ASCII prefix substitution", "/аdmin"],
  ["Windows drive path", String.raw`C:\Windows\system32`],
  ["file URL", "file:///etc/passwd"],
  ["UNC share", String.raw`\\server\share`],
];

for (const [name, value] of unsafeCallbacks) {
  test(`rejects unsafe callback (${name})`, () => {
    assert.equal(getSafeAdminCallbackUrl(value), fallback, JSON.stringify(value));
  });
}

const safeCallbacks = [
  "/admin",
  "/admin/",
  "/admin/dashboard",
  "/admin/dashboard/",
  "/admin/portfolio/123?mode=edit#details",
  "/admin?tab=portfolio",
  "/admin/portfolio?status=draft",
  "/admin#overview",
  "/admin/portfolio#drafts",
  "/admin/portfolio?next=https%3A%2F%2Fevil.example",
] as const;

for (const value of safeCallbacks) {
  test(`accepts local admin callback (${value})`, () => {
    assert.equal(getSafeAdminCallbackUrl(value), value);
  });
}

for (const [encoded, expected] of [
  ["callbackUrl=%2F%2Fevil.example", fallback],
  ["callbackUrl=%2Fadmin%2Fportfolio%3Fstatus%3Ddraft", "/admin/portfolio?status=draft"],
] as const) {
  test(`handles URLSearchParams-decoded callback (${encoded})`, () => {
    const decoded = new URLSearchParams(encoded).get("callbackUrl");
    assert.equal(getSafeAdminCallbackUrl(decoded), expected);
  });
}
