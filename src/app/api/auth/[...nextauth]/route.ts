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
          id: user.id,
          email: user.email,
          // bu ustunlar bo'lmasa ham undefined bo'lib qoladi, xato emas
          name: (user as any).name ?? null,
          image: (user as any).avatar ?? null
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google' || account?.provider === 'github') {
          if (!user.email) return false

          const db = createServiceClient()

          const { data: existing } = await db
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single()

          // users yo'q bo'lsa, faqat email bilan insert (name/avatar/plan kabi ustunlardan qat'iy nazar)
          if (!existing) {
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
      // Credentials login: authorize dan user.id keladi
      if (user && (user as any).id) {
        token.userId = (user as any).id
      }

      const email = token.email ?? user?.email

      // OAuth bo'lsa yoki token.userId yo'q bo'lsa: email -> users.id
      if (!token.userId && email) {
        try {
          const db = createServiceClient()
          const { data } = await db
            .from('users')
            .select('id')
            .eq('email', email)
            .single()

          if (data?.id) token.userId = data.id
        } catch (e) {
          console.error('jwt userId lookup error:', e)
        }
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

  // nextauth type/xavfsizlik uchun (Render’da ishlayapti)
  ...({ trustHost: true } as object)
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }