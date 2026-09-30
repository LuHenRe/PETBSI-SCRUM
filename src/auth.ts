import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/db";
import { createTransport } from "nodemailer";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(getDb()),
  providers: [
    Google,
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async (params) => {
        const { identifier, url, provider } = params;
        
        if (process.env.NODE_ENV === "development") {
          console.log(`\n======================================================`);
          console.log(`🔮 MAGIC LINK PARA [${identifier}]:`);
          console.log(`🔗 CLIQUE AQUI: ${url}`);
          console.log(`======================================================\n`);
          return;
        }

        const transport = createTransport(provider.server);
        const result = await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: "Seu link de acesso ao PETBSI Scrum",
          text: `Clique no link para acessar: ${url}`,
          html: `<p>Clique no link abaixo para acessar sua conta:</p><p><a href="${url}">Entrar no PETBSI Scrum</a></p>`
        });
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) não enviados para: ${failed.join(", ")}`);
        }
      }
    }),
    Credentials({
      id: "preview",
      name: "Preview",
      credentials: {},
      async authorize() {
        return {
          id: "preview-user-id",
          name: "Admin Preview",
          email: "preview@petbsi.com",
        };
      }
    }),
  ],
  session: { strategy: "jwt", maxAge: 14 * 24 * 60 * 60 }, // 14 days
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login?verifyRequest=1",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
