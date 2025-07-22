import { NextAuthOptions, User as NextAuthUser, Account, Profile as NextAuthProfile, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
// Use the adapter for both credentials and OAuth providers
// We'll use a custom adapter approach to avoid type compatibility issues
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";

// Ensure NEXTAUTH_SECRET is defined
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is not defined. Critical for JWT signing and encryption.");
}

// Handle NEXTAUTH_URL for different environments
// This is critical to prevent 'Invalid URL' errors
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// During build time, use a safe dummy URL to prevent 'Invalid URL' errors
if (isBuildTime) {
  console.log('Build-time detected, using safe dummy NEXTAUTH_URL');
  process.env.NEXTAUTH_URL = "https://example.com";
} else {
  // For development, only set NEXTAUTH_URL if not already defined
  if (process.env.NODE_ENV === "development" && !process.env.NEXTAUTH_URL) {
    // Use PORT environment variable or default to 3000
    const port = process.env.PORT || '3000';
    process.env.NEXTAUTH_URL = `http://localhost:${port}`;
    console.log('Set development NEXTAUTH_URL to:', process.env.NEXTAUTH_URL);
  } else if (!process.env.NEXTAUTH_URL) {
    // Fallback for production if somehow not set
    console.warn('NEXTAUTH_URL not set in production, using fallback');
    if (process.env.VERCEL_URL) {
      // Use VERCEL_URL with https protocol
      process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
      console.log('Set production NEXTAUTH_URL from VERCEL_URL:', process.env.NEXTAUTH_URL);
    } else {
      // Final fallback
      process.env.NEXTAUTH_URL = "https://littlegabriel.vercel.app";
      console.log('Set hardcoded production NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    }
  }
}

// Verify that NEXTAUTH_URL is now set
if (!process.env.NEXTAUTH_URL) {
  throw new Error("NEXTAUTH_URL is still not defined after fallbacks. This is critical for NextAuth.");
}


export const authOptions: NextAuthOptions = {
  // We're using a custom approach instead of the adapter to avoid type compatibility issues
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Configure cookie settings specifically for Vercel deployment
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Don't set domain in production - let the browser handle it
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Ensure session is always available immediately after sign-in
  useSecureCookies: process.env.NODE_ENV === 'production',
  // Reduce JWT maxAge to ensure faster session refresh
  jwt: {
    maxAge: 60 * 60, // 1 hour in seconds
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      // Google provider configuration ends here
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user", // Default role for new users
        };
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: {
        appleId: process.env.APPLE_CLIENT_ID || '',
        teamId: process.env.APPLE_TEAM_ID || '',
        privateKey: process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        keyId: process.env.APPLE_KEY_ID || '',
      } as any, // Type assertion for Apple's unique client secret format
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: null, // Apple doesn't provide profile images
          role: "user", // Default role for new users
        };
      },
    }),
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

          // Check password match using bcrypt
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
    // Always redirect to chat page after successful sign-in
    async redirect({ url, baseUrl }) {
      // After successful sign-in, go directly to chat page
      return `${baseUrl}/chat`;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // For OAuth providers (Google, Apple), check if user exists and link accounts
      if ((account?.provider === 'google' || account?.provider === 'apple') && profile) {
        // Cast profile to any to access Google-specific fields
        const googleProfile = profile as any;
        try {
          // Check if user exists with this email (case insensitive)
          if (!googleProfile.email) return false;
          const emailLowerCase = googleProfile.email.toLowerCase();
          
          // Log the authentication attempt for debugging
          console.log(`${account.provider} auth attempt for email: ${emailLowerCase}`);
          
          const existingUser = await prisma.user.findFirst({
            where: {
              email: {
                equals: emailLowerCase,
              }
            },
            include: {
              accounts: true
            }
          });
          
          if (existingUser) {
            console.log(`Existing user found for ${account.provider} sign-in:`, existingUser.email);
            
            // Check if this OAuth account is already linked to the user
            const linkedAccount = existingUser.accounts.find(
              (acc) => acc.provider === account.provider && acc.providerAccountId === googleProfile.sub
            );
            
            if (!linkedAccount) {
              // Link the OAuth account to the existing user
              console.log(`Linking ${account.provider} account to existing user`);
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: 'oauth',
                  provider: account.provider,
                  providerAccountId: googleProfile.sub,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                }
              });
            }
            
            // Allow sign-in with existing account
            return true;
          } else {
            // Create a new user if one doesn't exist
            console.log(`Creating new user from ${account.provider} sign-in`);
            const newUser = await prisma.user.create({
              data: {
                name: googleProfile.name || `${account.provider} User`,
                email: emailLowerCase,
                role: 'user', // Default role
              },
            });
            console.log(`Created new user from ${account.provider} sign-in:`, newUser.email);
            return true;
          }
        } catch (error) {
          console.error(`Error in ${account.provider} sign-in:`, error);
          return false;
        }
      }
      
      // For credentials provider, always allow sign-in to proceed
      return true;
    },
    async jwt({ token, user, account, profile, isNewUser, session, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Make sure role is part of the user object from authorize
        token.email = user.email; // Add email if not already there
        token.name = user.name;   // Add name if not already there
        
        // If this is a Google sign-in, add the picture to the token
        if (account?.provider === 'google' && (profile as any)?.picture) {
          token.picture = (profile as any).picture;
        }
        // Apple doesn't provide profile pictures, so we don't add one for Apple sign-in
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