import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { edgeAuthConfig } from "./edge-config";
import { authorizeAdminCredentials } from "./credentials";
import { applyAdminJwt, projectAdminSession } from "./callbacks";
import {
  clearAdminLoginFailures,
  getAdminLoginRateLimitKey,
  isAdminLoginRateLimited,
  recordAdminLoginFailure,
} from "./login-rate-limit";

export const authConfig: NextAuthConfig = {
  ...edgeAuthConfig,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw, request) => {
        const rateLimitKey = getAdminLoginRateLimitKey(request, raw);
        if (isAdminLoginRateLimited(rateLimitKey)) return null;

        const admin = await authorizeAdminCredentials(raw, {
          findByEmail: async (email) => {
            const users = await db
              .select({
                id: schema.adminUsers.id,
                email: schema.adminUsers.email,
                name: schema.adminUsers.name,
                passwordHash: schema.adminUsers.passwordHash,
                sessionVersion: schema.adminUsers.sessionVersion,
                isActive: schema.adminUsers.isActive,
              })
              .from(schema.adminUsers)
              .where(eq(schema.adminUsers.email, email))
              .limit(1);
            return users[0] ?? null;
          },
          verifyPassword: bcrypt.compare,
        });

        if (!admin) {
          recordAdminLoginFailure(rateLimitKey);
          return null;
        }

        clearAdminLoginFailures(rateLimitKey);
        return admin;
      },
    }),
  ],
  callbacks: {
    authorized: async ({ auth, request }) => {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin") &&
        !request.nextUrl.pathname.startsWith("/admin/login");
      if (isAdminRoute) return !!auth?.user;
      return true;
    },
    jwt: async ({ token, user }) => {
      return applyAdminJwt(token, user);
    },
    session: async ({ session, token }) => {
      return projectAdminSession(session, token);
    },
  },
};
