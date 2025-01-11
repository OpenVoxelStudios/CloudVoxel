import type { Provider } from "next-auth/providers"
import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"
import Passkey from "next-auth/providers/passkey"
import config from '@/../config';
import clientconfig from "@/../clientconfig";

export const providers: Provider[] = ([
    ['Discord', Discord({ redirectProxyUrl: `${clientconfig.websiteURL}/api/auth`, allowDangerousEmailAccountLinking: true })],
    ['GitHub', GitHub({ redirectProxyUrl: `${clientconfig.websiteURL}/api/auth`, allowDangerousEmailAccountLinking: true })],
    ['Passkey', Passkey({})]
] as [string, Provider][]).filter(provider => (provider[0] == 'Passkey' && config.enableExperimentalPasskeys) || (config.providers as unknown as string[]).includes(provider[0])).map(provider => provider[1]);

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