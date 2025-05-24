// auth.config.ts
// @ts-ignore
import { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const authConfig = {
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                // Check against environment variables for admin
                if (credentials.email === process.env.ADMIN_EMAIL &&
                    credentials.password === process.env.ADMIN_PASSWORD) {
                    return {
                        id: '1',
                        email: credentials.email,
                        name: 'Admin',
                        role: 'admin'
                    }
                }

                // Check against environment variables for content manager
                if (credentials.email === process.env.CONTENT_MANAGER_EMAIL &&
                    credentials.password === process.env.CONTENT_MANAGER_PASSWORD) {
                    return {
                        id: '2',
                        email: credentials.email,
                        name: 'Content Manager',
                        role: 'content_manager'
                    }
                }

                return null
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    callbacks: {
        //@ts-ignore
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            const isOnAdmin = nextUrl.pathname.startsWith('/admin')

            if (isOnDashboard || isOnAdmin) {
                if (isLoggedIn) {
                    // Check admin-only routes
                    if (isOnAdmin && auth.user.role !== 'admin') {
                        return Response.redirect(new URL('/dashboard', nextUrl))
                    }
                    return true
                }
                return false // Redirect unauthenticated users to login page
            }

            return true
        },
        //@ts-ignore
        jwt({ token, user }) {
            if (user) {
                token.role = user.role
            }
            return token
        },
        //@ts-ignore
        session({ session, token }) {
            if (token) {
                session.user.id = token.sub!
                session.user.role = token.role as string
            }
            return session
        }
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig