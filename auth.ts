
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"

declare module "next-auth" {
  interface User {
    bggUserName: string;
  }

  interface Session {
    user: User;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    GitHub,
    Resend({from: "no-reply@bgg.yawnie.dev"}),
  ],
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth
    },
    session({ session, user }) {
      session.user.bggUserName = user.bggUserName
      return session
    },
  }
})
