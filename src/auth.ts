import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { verifiedGoogleIdentity } from "./server/authorization/google-identity";
import { allowGoogleLogin, userIdForGoogleSubject } from "./server/authorization/membership";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return false;
      const identity = verifiedGoogleIdentity(profile);
      return identity ? allowGoogleLogin(identity.email, identity.subject) : false;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google") {
        const identity = verifiedGoogleIdentity(profile);
        const id = identity && await userIdForGoogleSubject(identity.subject);
        if (!id) throw new Error("Conta não autorizada");
        token.sub = id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
