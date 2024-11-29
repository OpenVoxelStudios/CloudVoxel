import { auth } from '@/auth';
import LoginForm from '@/components/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation';

export default async function LoginPage() {
    const session = await auth();
    if (session?.user) return redirect('/dashboard');

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 dark">
            <Card className="w-full max-w-md lg:max-w-4xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Login to Your Account</CardTitle>
                    <CardDescription className="text-center">
                        Choose your preferred login method
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    )
}
