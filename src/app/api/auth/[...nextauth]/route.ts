import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const db = createServiceClient()
        const { data: user } = await db
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single()
        if (!user || !user.password_hash) return null
        const valid = await bcrypt.compare(credentials.password, user.password_hash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, image: user.avatar }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        const db = createServiceClient()
        const { data: existing } = await db
          .from('users')
          .select('id')
          .eq('email', user.email!)
          .single()
        if (!existing) {
          await db.from('users').insert({
            email: user.email,
            name: user.name,
            avatar: user.image,
            provider: account.provider
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const db = createServiceClient()
        const { data } = await db
          .from('users')
          .select('id, plan')
          .eq('email', token.email!)
          .single()
        if (data) {
          token.userId = data.id
          token.plan = data.plan
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string
        session.user.plan = token.plan as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: { strategy: 'jwt' }
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true

}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
