import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"
import { sendVerificationRequest } from "./lib/authSendRequest"

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
    Resend({
      // server: process.env.EMAIL_SERVER, // Ensure this includes necessary details like API key
      apiKey: process.env.AUTH_RESEND_KEY,
      from: 'no-reply@bgg.yawnie.dev',
      sendVerificationRequest, // Use your custom function
    }),
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
    redirect: async ({ url, baseUrl }) => {
      return url.startsWith(baseUrl) ? `${baseUrl}/dashboard` : baseUrl
    }
  },
  pages: {
    signIn: '/signin',
  }
})
