import NextAuth, { Session } from "next-auth"
import type { Provider } from "next-auth/providers"

import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"
import config from '@/../config';
import clientconfig from "../clientconfig";


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
] as [string, Provider][]).filter(provider => (config.login.providers as unknown as string[]).includes(provider[0])).map(provider => provider[1]);

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
        signOut: '/logout',
    },
    callbacks: {
        signIn(auth) {
            console.log('Logged in user', auth?.user?.name);
            if (auth?.user?.email && !Object.values(config.login.users).map(a => a.email).includes(auth.user.email)) return false;

            return !!auth
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
    ) => Response | undefined
    ): (req: NextRequest & { auth: Session | null }) => void;

    (): Promise<Session>;
}