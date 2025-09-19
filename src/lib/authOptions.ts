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
      credentials: { email: { label: 'Email', type: 'text' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        const email = String(credentials?.email || '')
        const password = String(credentials?.password || '')
        
        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() }
        })
        
        if (!user) {
          console.log('User not found:', email)
          return null
        }
        
        // Check password
        if (!user.password) {
          console.log('No password hash for user:', email)
          return null
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
          console.log('Password mismatch for:', email)
          return null
        }
        
        console.log('Login successful for:', user.email)
        return { 
          id: user.id, 
          name: user.name || '', 
          email: user.email 
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })] : [])
  ],
  pages: { signIn: '/login' }
}


