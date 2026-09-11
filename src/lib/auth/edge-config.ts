import type { NextAuthConfig } from "next-auth";

// Edge-safe config used by the admin route proxy. Providers stay out of this
// layer because credential verification requires the Node runtime and database access.
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
