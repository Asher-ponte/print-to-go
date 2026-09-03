import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isGoogleAuthConfigured, isStaffEmail } from "@/lib/staff";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: isGoogleAuthConfigured()
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : [],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, profile }) {
      const email = profile?.email ?? token.email;
      if (email) {
        token.email = email;
        token.name = profile?.name ?? token.name;
        token.picture = typeof profile?.picture === "string" ? profile.picture : token.picture;
        token.role = isStaffEmail(email) ? "admin" : "customer";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
        if (typeof token.picture === "string") session.user.image = token.picture;
        session.user.role = token.role === "admin" ? "admin" : "customer";
      }
      return session;
    },
  },
});
