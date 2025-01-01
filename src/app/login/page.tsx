import LoginForm from '@/components/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
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
