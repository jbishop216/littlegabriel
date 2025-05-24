import { NextAuthOptions, User as NextAuthUser, Account, Profile, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
// Use the adapter as a type only with credentials provider
// import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Ensure NEXTAUTH_SECRET is defined
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is not defined. Critical for JWT signing and encryption.");
}

// Force NEXTAUTH_URL for local development if not set or different
let nextAuthUrl = process.env.NEXTAUTH_URL;
if (process.env.NODE_ENV === "development" && (!nextAuthUrl || nextAuthUrl !== "http://localhost:3000")) {
  nextAuthUrl = "http://localhost:3000";
  process.env.NEXTAUTH_URL = nextAuthUrl; // Also set it in process.env for consistency if other parts read it
}


export const authOptions: NextAuthOptions = {
  // We're using JWT for credentials provider, so we don't need the adapter
  // adapter: PrismaAdapter(prisma),
  secret: (() => {
    const secretValue = process.env.NEXTAUTH_SECRET;
    if (!secretValue) {
      const errorMessage = "FATAL: NEXTAUTH_SECRET is not defined in environment variables! Authentication will not work. Please set it in your .env file.";
      throw new Error(errorMessage);
    }
    return secretValue;
  })(),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {        
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password");
        }

        try {
          // Convert email to lowercase for case-insensitive search in SQLite
          // This is a workaround since SQLite doesn't support mode: 'insensitive' like PostgreSQL
          const emailLowerCase = credentials.email.toLowerCase();
          
          const user = await prisma.user.findFirst({
            where: {
              // Simple equals comparison with lowercase email
              email: {
                equals: emailLowerCase,
              }
            },
          });

          if (!user) {
            throw new Error("No user found with this email");
          }
          
          if (!user.password) {
            throw new Error("User has no password set");
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            throw new Error("Invalid password");
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          throw error; // Rethrow to provide better error messages to the client
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser, session, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Make sure role is part of the user object from authorize
        token.email = user.email; // Add email if not already there
        token.name = user.name;   // Add name if not already there
      }
      return token;
    },
    async session({ session, token, user }) {
      // user parameter here is the user object from the database if using database sessions,
      // but with JWT strategy, we rely on the token.
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // Ensure role is string
        // session.user.email = token.email as string; // Already part of default session user
        // session.user.name = token.name as string; // Already part of default session user
      }
      return session;
    },
  },

};