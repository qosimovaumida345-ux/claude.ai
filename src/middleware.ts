import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login", // Agar maxsus login sahifangiz bo'lsa
  },
})

export const config = {
  matcher: ['/chat/:path*', '/settings/:path*', '/artifacts/:path*']
}
