import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"

import { accountsTable, authenticatorsTable, eqLow, sessionsTable, usersTable } from "@/../data/schema";
import { db } from '@/../data/index'
import { providers } from "./lib/providers";
import config from "../config";

/*
(config.login?.credentials ? [Credentials({
    credentials: {
        username: {},
        password: {},
    },
    authorize: async (credentials) => {
        console.log(credentials)
        const parsedCredentials = signInSchema.safeParse(credentials);
        
        if (parsedCredentials.success) {
            const { username, password } = parsedCredentials.data;

            console.log(username, password);
        }

        return { name: 'yes', email: 'yes@yes.yes', id: 'idk' };
        return null;
    },
})] : [] as Provider[]).concat((
 */

export const { handlers, signIn, signOut, auth: nextAuth } = NextAuth({
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
    },
    callbacks: {
        async signIn(auth) {
            console.log('Loggin try in user', auth?.user?.name);

            const user = auth.user.email ? await db.select().from(usersTable).where(eqLow(usersTable.email, auth.user.email)).get() : undefined;

            if (!auth.user.email || !user) return false;

            if (auth.user.image) await db.update(usersTable).set({
                image: auth.user.image,
            }).where(eqLow(usersTable.email, auth.user.email)).execute();

            return true;
        },
        async session({ session }) {
            const hasPasskey = await db.select().from(authenticatorsTable).where(eqLow(authenticatorsTable.userId, session.userId)).get();

            const newSession = {
                ...session,
                hasPasskey: !!hasPasskey,
            } as Session;

            return newSession;
        }
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