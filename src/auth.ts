import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"

import { accountsTable, authenticatorsTable, eqLow, sessionsTable, usersTable } from "@/../data/schema";
import { db } from '@/../data/index'
import { providers } from "./lib/providers";
import config from "../config";

export const { handlers, signIn, signOut, auth: nextAuth } = NextAuth({
    session: {
        strategy: "jwt"
    },
    adapter: DrizzleAdapter(db, {
        usersTable: usersTable,
        accountsTable: accountsTable,
        sessionsTable: sessionsTable,
        authenticatorsTable: authenticatorsTable,
    }),
    experimental: { enableWebAuthn: config.enableExperimentalPasskeys },
    trustHost: true,
    providers: providers,
    pages: {
        signIn: "/login",
        error: "/error",
    },
    callbacks: {
        async signIn(auth) {
            console.log('Logging try user', auth?.user?.name);

            const user = auth.user.email ? await db.select().from(usersTable).where(eqLow(usersTable.email, auth.user.email)).get() : undefined;

            if (!auth.user.email || !user) return false;

            if (auth.user.image) await db.update(usersTable).set({
                image: auth.user.image,
            }).where(eqLow(usersTable.email, auth.user.email)).execute();

            auth.user.id = user.id;
            return true;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
            }

            if (!config.enableExperimentalPasskeys) return session;
            const hasPasskey = await db.select().from(authenticatorsTable).where(eqLow(authenticatorsTable.userId, session.user.id)).get();

            return {
                ...session,
                hasPasskey: !!hasPasskey,
            } as Session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
    },
})

type RouteParams = {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
    searchParams?: { [key: string]: string | string[] | undefined };
};

export const auth = nextAuth as unknown as {
    (handler: (
        req: NextRequest,
        context: RouteParams
    ) => Promise<Response> | Response
    ): (req: NextRequest, context: RouteParams) => Promise<Response>;

    (handler: (
        req: NextRequest
    ) => Promise<Response | undefined> | Response | undefined
    ): (req: NextRequest & { auth: Session | null }) => void;

    (): Promise<Session>;
}