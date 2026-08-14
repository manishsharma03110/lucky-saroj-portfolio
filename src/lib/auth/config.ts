import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/validations/auth";
import { edgeAuthConfig } from "./edge-config";

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
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const users = await db
          .select()
          .from(schema.adminUsers)
          .where(eq(schema.adminUsers.email, email.toLowerCase().trim()));
        const user = users[0];

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
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
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
