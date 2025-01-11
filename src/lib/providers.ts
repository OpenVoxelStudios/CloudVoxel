import type { Provider } from "next-auth/providers"
import config from '@/../config';
import clientconfig from "@/../clientconfig";

import Passkey from "next-auth/providers/passkey"

import Discord from "next-auth/providers/discord"
import GitHub from "next-auth/providers/github"
import GitLab from "next-auth/providers/gitlab"
import Google from "next-auth/providers/google"
import Osu from "next-auth/providers/osu"
import Slack from "next-auth/providers/slack"
import Twitch from "next-auth/providers/twitch"
import Reddit from "next-auth/providers/reddit"

const ProviderConfig = { redirectProxyUrl: `${clientconfig.websiteURL}/api/auth`, allowDangerousEmailAccountLinking: true };

export const providers: Provider[] = ([
    ['Discord', Discord(ProviderConfig)],
    ['GitHub', GitHub(ProviderConfig)],
    ['GitLab', GitLab(ProviderConfig)],
    ['Google', Google(ProviderConfig)],
    ['Osu!', Osu(ProviderConfig)],
    ['Slack', Slack(ProviderConfig)],
    ['Twitch', Twitch(ProviderConfig)],
    ['Reddit', Reddit(ProviderConfig)],
    ['passkey', Passkey({})],
] as [string, Provider][]).filter(provider => (provider[0] == 'passkey' && config.enableExperimentalPasskeys) || (config.providers.map(p => p.toLowerCase()) as unknown as string[]).includes(provider[0].toLowerCase())).map(provider => provider[1]);

export const providerMap = providers
    .map((provider) => {
        if (typeof provider === "function") {
            const providerData = provider()
            return { id: providerData.id, name: providerData.name }
        } else {
            return { id: provider.id, name: provider.name }
        }
    })