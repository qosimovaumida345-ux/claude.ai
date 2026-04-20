import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // hech narsa yozish shart emas
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => {
        return !!token // token bo‘lsa ruxsat
      },
    },
  }
)

export const config = {
  matcher: ['/chat/:path*', '/settings/:path*', '/artifacts/:path*']
}