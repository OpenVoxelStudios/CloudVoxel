import { auth } from '@/auth'
import LoginForm from '@/components/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import clientconfig from '../../../clientconfig'

export default async function LoginPage() {
    const session = await auth()
    if (session?.user) return redirect(`${clientconfig.websiteURL}/dashboard`);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md border-gray-700 bg-gray-800 lg:max-w-4xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-center text-2xl font-bold tracking-tight text-gray-100">
                        Login to Your Account
                    </CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        Choose your preferred login method
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    )
}
