'use client';

import { providerMap } from '@/lib/providers';
import { Button } from '@/components/ui/button'
import { SiDiscord, SiGithub, SiGitlab, SiGoogle, SiOsu, SiReddit, SiSlack, SiTwitch } from '@icons-pack/react-simple-icons'
import { signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { motion } from "motion/react"
import { signIn as passkeySignIn } from "next-auth/webauthn"
import { KeyRound } from 'lucide-react';
import { signInSchema } from '@/lib/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from '@/hooks/use-toast';
import { parseError } from '@/lib/error';

export default function LoginForm() {
    const { toast } = useToast();

    function showError(error: string) {
        toast({
            title: 'Login Error',
            description: parseError(error).message,
            variant: 'destructive',
        })
    }

    const credentialForm = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    return (
        <div className={providerMap.some(p => p.id == 'credentials') ? "grid lg:grid-cols-2 gap-8" : ''}>
            <div className="space-y-3">
                {providerMap.some(p => p.id == 'credentials') && (
                    <>
                        <Form {...credentialForm}>
                            <form onSubmit={credentialForm.handleSubmit(async (data: z.infer<typeof signInSchema>) => {
                                const res = await signIn('credentials', {
                                    email: data.email,
                                    password: data.password,
                                    redirect: false,
                                });

                                if (res?.error) showError(res?.code || res.error)
                                else redirect(`${location.origin}/dashboard`)
                            })} className="space-y-4">
                                <FormField
                                    control={credentialForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-100">Email address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    id='credentials-email'
                                                    placeholder="mail@example.com"
                                                    className="border-gray-700 bg-gray-800 text-gray-100"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={credentialForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-100">Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    id='credentials-password'
                                                    type='password'
                                                    placeholder="••••••••"
                                                    className="border-gray-700 bg-gray-800 text-gray-100"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-600 hover:text-gray-50"
                                >
                                    Sign in with Email
                                </Button>
                            </form>
                        </Form>
                    </>
                )}

                {providerMap.some(p => p.id == 'passkey') && (
                    <form
                        className="space-y-4"
                        action={async () => {
                            const res = await passkeySignIn('passkey', {
                                redirect: false,
                            });

                            if (res?.error) showError(res?.code || res.error)
                            else redirect(`${location.origin}/dashboard`)
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
                )}
            </div>

            <div className="relative">
                {providerMap.some(p => p.id == 'credentials') ? <div className="hidden lg:block absolute -left-4 top-0 bottom-0 w-px bg-gray-700" /> : ''}
                {(providerMap.some(p => p.id == 'passkey') || (providerMap.some(p => p.id == 'passkey'))) && (
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-gray-800 px-3 text-gray-500">OR</span>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {Object.values(providerMap)
                        .filter(p => p.id != 'passkey' && p.id != 'credentials')
                        .map((provider, i) => (
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
                                        const res = await signIn(provider.id, {
                                            redirect: false,
                                        });

                                        if (res?.error) showError(res?.code || res.error)
                                        else redirect(`${location.origin}/dashboard`)
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
        </div>
    )
}
