import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
    adapter: PrismaAdapter(prisma),
    providers: [
        // Додайте провайдери тут після налаштування
        // GoogleProvider({
        //   clientId: process.env.GOOGLE_CLIENT_ID!,
        //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        // }),
    ],
    callbacks: {
        session: async ({ session, user }) => {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: 'database',
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
