import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'

import prisma from '@/src/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email adresa ili lozinka nisu ispravni.')
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        })

        if (!user) {
          throw new Error('Email adresa ili lozinka nisu ispravni.')
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordCorrect) {
          throw new Error('Email adresa ili lozinka nisu ispravni.')
        }

        return {
          id: user.id,
          email: user.email,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email
      }
      return token
    },
    async session({ token, session }) {
      if (session.user) {
        session.user.email = token.email as string
      }
      return session
    },
  },
})
