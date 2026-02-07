import NextAuth from "next-auth";
import { authEdgeConfig } from "@/lib/auth/config.edge";

const { auth } = NextAuth(authEdgeConfig);

export default auth;

export const config = {
  matcher: [
    // Protect admin routes (except admin login)
    "/admin/((?!login).*)",
  ],
};
