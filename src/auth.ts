import NextAuth, { Session } from "next-auth"
import type { Provider } from "next-auth/providers"

import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"
import config from '@/../config';
import clientconfig from "../clientconfig";

import { eqLow, usersTable } from "@/../data/schema";

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

const providers: Provider[] = ([
    ['Discord', Discord({ redirectProxyUrl: `${clientconfig.websiteURL}/api/auth` })],
    ['GitHub', GitHub({ redirectProxyUrl: `${clientconfig.websiteURL}/api/auth` })],
] as [string, Provider][]).filter(provider => (config.providers as unknown as string[]).includes(provider[0])).map(provider => provider[1]);

export const providerMap = providers
    .map((provider) => {
        if (typeof provider === "function") {
            const providerData = provider()
            return { id: providerData.id, name: providerData.name }
        } else {
            return { id: provider.id, name: provider.name }
        }
    })
    .filter((provider) => provider.id !== "credentials")

export const { handlers, signIn, signOut, auth: nextAuth } = NextAuth({
    trustHost: true,
    providers,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn(auth) {
            const { db } = await import("@/../data/index");
            console.log('Loggin try in user', auth?.user?.name);

            const user = auth.user.email ? await db.select().from(usersTable).where(eqLow(usersTable.email, auth.user.email)).get() : undefined;

            if (!auth.user.email || !user) return false;

            if (auth.user.image) await db.update(usersTable).set({
                avatar: auth.user.image,
            }).where(eqLow(usersTable.email, auth.user.email)).execute();

            return true;
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