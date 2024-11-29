import Header from "@/app/ui/header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Dashboard({
    params,
}: {
    params: Promise<{ path?: string[] }>
}) {
    const path = (await params).path || [];
    const session = await auth();
    if (!session) return redirect('/login');

    return <>
        <Header pathParts={path} session={session} />
        <main className="container mx-auto p-4">
            <div>
                Hello {session?.user?.name}!
            </div>
        </main>
    </>
}