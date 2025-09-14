import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

function loadUsers() {
  const dataPath = path.join(process.cwd(), 'src', 'data', 'users.json')
  if (!fs.existsSync(dataPath)) return [] as any[]
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf-8') || '[]') } catch { return [] }
}

const handler = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: { email: { label: 'Email', type: 'text' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        const email = String(credentials?.email || '')
        const password = String(credentials?.password || '')
        const users = loadUsers()
        const u = users.find((x:any)=> x.email?.toLowerCase() === email.toLowerCase())
        if (!u) return null
        const ok = await bcrypt.compare(password, String(u.password || ''))
        if (!ok) return null
        return { id: u.id, name: u.name || '', email: u.email }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })] : [])
  ],
  pages: {
    signIn: '/login'
  }
})

export { handler as GET, handler as POST }


