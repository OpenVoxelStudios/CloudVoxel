'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SiGithub } from '@icons-pack/react-simple-icons'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Logic also
        console.log('Email login:', email, password)
    }

    const handleGithubLogin = () => {
        // TODO: logic
        console.log('GitHub login initiated')
    }

    return (
        <div className="lg:flex lg:space-x-8">
            <div className="lg:flex-1 space-y-6">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Login with Email
                    </Button>
                </form>
            </div>

            <div className="mt-6 lg:mt-0 lg:flex-1">
                <div className="relative">
                    <Separator className="my-4 lg:hidden" />
                    <div className="lg:absolute lg:inset-0 flex items-center justify-center">
                        <span className="bg-background px-2 text-muted-foreground text-sm lg:text-base">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <Button variant="outline" className="w-full" onClick={handleGithubLogin}>
                        <SiGithub className="mr-2 h-4 w-4" />
                        GitHub
                    </Button>
                </div>
            </div>
        </div>
    )
}
