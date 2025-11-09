import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import Credentials from "next-auth/providers/credentials";
import { getUserFromDb } from "./actions/user";
import { comparePassword } from "./utils";
import {
  UserNotFoundException,
  WrongPasswordException,
  AccountLockedException,
} from "@/lib/exceptions/authentication-exception";
import { Role } from "@prisma/client";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials, request) => {
        let user = null;

        user = await getUserFromDb(credentials.username as string);

        if (!user) {
          throw new UserNotFoundException();
        }

        if (!user.isActive) {
          throw new AccountLockedException();
        }

        const compareResult = await comparePassword(
          credentials.password as string,
          user.password,
        );
        if (!compareResult) {
          throw new WrongPasswordException();
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          isAdmin: user.role === "ADMIN",
          isUser: user.role === "DEFAULT_USER",
          isPremiumUser: user.role === "PREMIUM_USER",
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email || "";
        session.user.name = token.name || "";
        session.user.role = token.role as Role;
        session.user.isAdmin = token.role === "ADMIN";
        session.user.isUser = token.role === "DEFAULT_USER";
        session.user.isPremiumUser = token.role === "PREMIUM_USER";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 5 * 60,
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  cookies: {
    sessionToken: {
      name: `schedule-session`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  experimental: { enableWebAuthn: true },
});

export class Auth {}
