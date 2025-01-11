'use client';

import { providerMap } from '@/lib/providers';
import { Button } from '@/components/ui/button'
import { SiDiscord, SiGithub, SiGitlab, SiGoogle, SiOsu, SiReddit, SiSlack, SiTwitch } from '@icons-pack/react-simple-icons'
import { AuthError } from 'next-auth';
import { signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { motion } from "motion/react"
import { signIn as passkeySignIn } from "next-auth/webauthn"
import { KeyRound } from 'lucide-react';

export default function LoginForm() {
    return (
        <div className="lg:flex lg:space-x-8">
            <div className="mt-6 lg:mt-0 lg:flex-1">
                {providerMap.some(p => p.id == 'passkey') && (
                    <>
                        <form
                            className={`my-3 space-y-4`}
                            action={async () => {
                                try {
                                    passkeySignIn("passkey", {
                                        redirectTo: `${location.origin}/dashboard`,
                                    })
                                } catch (error) {
                                    if (error instanceof AuthError)
                                        return redirect(`${location.origin}/login?error=${error.type}`)
                                    throw error
                                }
                            }}
                        >
                            <Button
                                type='submit'
                                variant="outline"
                                className="w-full border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-600 hover:text-gray-50"
                            >
                                <KeyRound className="mr-2 h-4 w-4" />
                                Sign in with Passkey
                            </Button>
                        </form>

                        <hr className="my-6 border-gray-700" />
                    </>
                )}

                {Object.values(providerMap).filter(p => p.id != 'passkey' && p.id != 'credentials').map((provider, i) => (
                    <motion.div
                        key={`provider-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 0.2,
                                delay: i * 0.1
                            }
                        }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <form
                            className={`my-3 space-y-4`}
                            action={async () => {
                                try {
                                    await signIn(provider.id, {
                                        redirectTo: `${location.origin}/dashboard`,
                                    })
                                } catch (error) {
                                    if (error instanceof AuthError)
                                        return redirect(`${location.origin}/login?error=${error.type}`)
                                    throw error
                                }
                            }}
                        >
                            <Button
                                type='submit'
                                variant="outline"
                                className="w-full border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-600 hover:text-gray-50"
                            >
                                {(() => {
                                    const icons = {
                                        discord: <SiDiscord className="mr-2 h-4 w-4" />,
                                        github: <SiGithub className="mr-2 h-4 w-4" />,
                                        gitlab: <SiGitlab className="mr-2 h-4 w-4" />,
                                        google: <SiGoogle className="mr-2 h-4 w-4" />,
                                        osu: <SiOsu className="mr-2 h-4 w-4" />,
                                        slack: <SiSlack className="mr-2 h-4 w-4" />,
                                        twitch: <SiTwitch className="mr-2 h-4 w-4" />,
                                        reddit: <SiReddit className="mr-2 h-4 w-4" />,
                                    };
                                    return icons[provider.id.toLowerCase() as keyof typeof icons] || null;
                                })()}
                                {provider.name}
                            </Button>
                        </form>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
