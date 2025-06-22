
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // Redirect errors to sign-in page
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Authorize: Missing email or password");
            return null;
          }

          const existingUser = await db.admin.findUnique({
            where: {
              email: credentials.email,
            },
          });
          if (!existingUser) {
            console.log("Authorize: No user found with email:", credentials.email);
            return null;
          }

          const passwordMatch = await compare(credentials.password, existingUser.password);
          if (!passwordMatch) {
            console.log("Authorize: Password does not match for user:", credentials.email);
            return null;
          }

          console.log("Authorize: Success for user:", credentials.email);
          return {
            id: String(existingUser.id),
            email: existingUser.email,
            name: existingUser.name ?? "",
            fullname: existingUser.name ?? "", // Add fullname property as required by User type
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error in authorize";
          console.error("Authorize: Error:", errorMessage);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.fullname = user.name; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = String(token.id);
        session.user.fullname = String(token.fullname);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect after sign-in
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (url.includes('/sign-in') || url === baseUrl) {
        // Default redirect, will be overridden by client-side logic
        return `${baseUrl}/`;
      }
      return url;
    },
  },
};