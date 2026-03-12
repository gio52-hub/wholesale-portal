import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getClientByEmail } from "./airtable";

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase());

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email.toLowerCase();

        // Check if admin
        if (adminEmails.includes(email)) {
          return {
            id: "admin",
            email: email,
            name: "Admin",
            role: "admin",
          };
        }

        // Check if client exists in Airtable
        const client = await getClientByEmail(email);
        if (client) {
          return {
            id: client.id,
            email: client.contactEmail,
            name: client.clientName,
            role: "client",
            clientId: client.id,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.clientId = user.clientId || user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.clientId = token.clientId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
