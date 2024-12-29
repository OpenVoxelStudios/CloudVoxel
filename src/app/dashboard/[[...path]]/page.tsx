import FileListWrapper from "@/app/ui/fileListWrapper";
import Header from "@/app/ui/header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import clientconfig from "../../../../clientconfig";

export default async function Dashboard({
    params,
}: {
    params: Promise<{ path?: string[] }>
}) {
    const session = await auth();
    if (!session) return redirect(`${clientconfig.websiteURL}/login`);
    const path = (await params).path?.map(decodeURIComponent) || [];

    return <>
        <Header pathParts={path} session={session} />
        <main className="container mx-auto p-4">
            <FileListWrapper pathParts={path} initialFiles={null} />
        </main>
    </>
}