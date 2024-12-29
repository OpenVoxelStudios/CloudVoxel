'use client';

import { providerMap } from '@/auth';
import { Button } from '@/components/ui/button'
// import { Separator } from '@/components/ui/separator'
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons'
import { AuthError } from 'next-auth';
import { signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function LoginForm() {
    return (
        <div className="lg:flex lg:space-x-8">
            {/*config.login.credentials && <div className="lg:flex-1 space-y-6">
                <form className="space-y-4" action={(formData: FormData) => {
                    signIn("credentials", formData)
                }}>
                    <div className="space-y-2">
                        <Label htmlFor="credentials-username">Username</Label>
                        <Input
                            id="credentials-username"
                            type="username"
                            name="username"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="credentials-password">Password</Label>
                        <Input
                            id="credentials-password"
                            type="password"
                            name='password'
                            required
                        />
                    </div>
                    <Button className="w-full">
                        Login with Credentials
                    </Button>
                </form>
            </div>*/}

            <div className="mt-6 lg:mt-0 lg:flex-1">
                {/* <div className="relative">
                    <Separator className="my-4 lg:hidden" />
                    <div className="lg:absolute lg:inset-0 flex items-center justify-center">
                        <span className="bg-background px-2 text-muted-foreground text-sm lg:text-base">
                            Or continue with
                        </span>
                    </div>
                </div> */}

                {Object.values(providerMap).map((provider, i) => (
                    <form className={`${i == 0 ? 'mt-6' : ''} space-y-4 my-3`} key={`provider-${i}`} action={async () => {
                        try {
                            await signIn(provider.id, {
                                redirectTo: `${location.origin}/dashboard`,
                            })
                        } catch (error) {
                            if (error instanceof AuthError) return redirect(`${location.origin}/login?error=${error.type}`)
                            throw error
                        }
                    }}>
                        <Button type='submit' variant="outline" className="w-full">
                            {(() => {
                                const icons = {
                                    github: <SiGithub className="mr-2 h-4 w-4" />,
                                    discord: <SiDiscord className="mr-2 h-4 w-4" />
                                };
                                return icons[provider.id.toLowerCase() as keyof typeof icons] || null;
                            })()}
                            {provider.name}
                        </Button>
                    </form>
                ))}
            </div>
        </div>
    )
}
