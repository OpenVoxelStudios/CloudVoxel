import FileListWrapper from "@/app/ui/fileListWrapper";
import Header from "@/app/ui/header";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const path = (await params).path?.map(decodeURIComponent) || [];

  return (
    <>
      <Header pathParts={path} />
      <main className="container mx-auto p-4">
        <FileListWrapper pathParts={path} initialFiles={null} />
      </main>
    </>
  );
}
