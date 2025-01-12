import type { Provider } from "next-auth/providers"
import config from '@/../config';
import clientconfig from "@/../clientconfig";

import Credentials from "next-auth/providers/credentials"
import Passkey from "next-auth/providers/passkey"

import Discord from "next-auth/providers/discord"
import GitHub from "next-auth/providers/github"
import GitLab from "next-auth/providers/gitlab"
import Google from "next-auth/providers/google"
import Osu from "next-auth/providers/osu"
import Slack from "next-auth/providers/slack"
import Twitch from "next-auth/providers/twitch"
import Reddit from "next-auth/providers/reddit"
import { signInSchema } from "./zod";
import { CredentialsSignin, User } from "next-auth";
import { eqLow, usersTable } from "../../data/schema";
import { verifyPassword } from "./crypto";
import rateLimit from "./ratelimit";
import { RateLimitedError } from "./error";

const ProviderConfig = { redirectProxyUrl: `${clientconfig.websiteURL}/api/auth`, allowDangerousEmailAccountLinking: true };

const parseIp = (req: Request) => req.headers.get('x-forwarded-for') || '::1';

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
    ['credentials', Credentials({
        credentials: {
            email: {},
            password: {},
        },
        authorize: async (credentials, req) => {
            const { email, password } = await signInSchema.parseAsync(credentials);
            const { db } = await import('@/../data/index');

            const isLimited = await rateLimit(db, parseIp(req), 'login', 5, 60);
            if (isLimited) throw new RateLimitedError();


            const user = await db.select().from(usersTable).where(eqLow(usersTable.email, email)).get();
            if (!user || !user.password || !user.salt) throw new CredentialsSignin();

            const isValid = await verifyPassword(password, user.password, user.salt);
            if (!isValid) throw new CredentialsSignin();

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                emailVerified: user.emailVerified,
            } as User;
        },
    }),]
] as [string, Provider][]).filter(provider => (provider[0] == 'passkey' && config.enableExperimentalPasskeys) || (provider[0] == 'credentials' && config.credentialLogin) || (config.providers.map(p => p.toLowerCase()) as unknown as string[]).includes(provider[0].toLowerCase())).map(provider => provider[1]);

export const providerMap = providers
    .map((provider) => {
        if (typeof provider === "function") {
            const providerData = provider()
            return { id: providerData.id, name: providerData.name }
        } else {
            return { id: provider.id, name: provider.name }
        }
    })