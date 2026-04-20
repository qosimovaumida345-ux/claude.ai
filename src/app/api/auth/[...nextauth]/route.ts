import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
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

        return {
          // next-auth token uchun id/other maydonlar keladi,
          // lekin biz token.userId ni baribir email orqali DB dan topamiz.
          id: user.id,
          email: user.email,
          name: (user as any).name ?? null,
          image: (user as any).avatar ?? null
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        // OAuth (Google/GitHub) bo'lsa users row yo'qmi tekshiramiz
        if (account?.provider === 'google' || account?.provider === 'github') {
          if (!user?.email) return false

          const db = createServiceClient()

          const { data: existing } = await db
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single()

          if (!existing) {
            // faqat email insert qilamiz (name/avatar/plan ixtiyoriy)
            await db.from('users').insert({
              email: user.email,
            })
          }
        }

        return true
      } catch (e) {
        console.error('signIn error:', e)
        return false
      }
    },

    async jwt({ token, user }) {
      // email — har so'rovda bor bo'lishi kerak (sizda /api/auth/session 200 da email ko'rinayapti)
      const email = token.email ?? user?.email

      if (!email) return token

      // HAR DOIM DB'dan users.id (UUID) ni email bo'yicha olamiz.
      // Bu provider.id (228171679 kabi son) tushib qolishining oldini oladi.
      const db = createServiceClient()
      const { data } = await db
        .from('users')
        .select('id, plan')
        .eq('email', email)
        .single()

      if (data?.id) {
        token.userId = data.id
        token.plan = data.plan
      }

      return token
    },

    async session({ session, token }) {
      session.user = session.user ?? ({} as any)

      session.user.id = token.userId as string | undefined
      session.user.plan = token.plan as string | undefined

      return session
    }
  },

  pages: {
    signIn: '/login',
    error: '/login'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },

  secret: process.env.NEXTAUTH_SECRET,

  ...({ trustHost: true } as object)
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }