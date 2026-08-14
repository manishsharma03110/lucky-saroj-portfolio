import NextAuth from "next-auth";
import { edgeAuthConfig } from "@/lib/auth/edge-config";

const { auth } = NextAuth(edgeAuthConfig);

export default auth;

export const config = {
  matcher: ["/admin/:path*"],
};
