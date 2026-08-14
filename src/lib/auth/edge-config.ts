import type { NextAuthConfig } from "next-auth";

// Edge-safe config used by middleware — no providers here, since the
// Credentials provider needs the (Node-only) better-sqlite3 DB client and
// Next.js middleware runs on the Edge runtime.
export const edgeAuthConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    authorized: ({ auth, request }) => {
      const isAdminRoute =
        request.nextUrl.pathname.startsWith("/admin") &&
        !request.nextUrl.pathname.startsWith("/admin/login");
      if (isAdminRoute) return !!auth?.user;
      return true;
    },
  },
};
