import NextAuth from "next-auth"
import type { Provider } from "next-auth/providers"

import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"
import config from '@/../config';

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
    ['Discord', Discord],
    ['GitHub', GitHub],
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

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers,
    pages: {
        signIn: "/login",
        signOut: '/logout',
    },
    callbacks: {
        signIn(auth) {
            console.log(auth?.user?.name);
            if (auth?.user?.email && !config.login.whitelist.includes(auth.user.email)) return false;

            return !!auth
        },
    },
})