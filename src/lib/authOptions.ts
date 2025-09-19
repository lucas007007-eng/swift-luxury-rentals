import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: { username: { label: 'Username', type: 'text' }, email: { label: 'Email', type: 'text' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        const username = String(credentials?.username || '')
        const emailInput = String(credentials?.email || '')
        const password = String(credentials?.password || '')

        // 1) Allow hardcoded admin login via username/password
        if (username === 'adminboss' && password === 'Admin420!@') {
          return {
            id: 'adminboss',
            name: 'Admin',
            email: 'admin@swiftluxury.local',
          }
        }

        // 2) Fallback to email/password using Prisma user table
        const email = emailInput.toLowerCase()
        if (!email) return null
        const user = await prisma.user.findUnique({
          where: { email }
        })
        if (!user || !user.password) return null
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null
        return { id: user.id, name: user.name || '', email: user.email }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })] : [])
  ],
  pages: { signIn: '/login' }
}


