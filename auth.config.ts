import type { NextAuthConfig } from 'next-auth'

// Edge-safe config — no bcrypt, no prisma. Used by middleware only.
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}
