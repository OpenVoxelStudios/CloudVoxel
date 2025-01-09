import { FetchError, FileElement } from "@/app/api/dashboard/[[...path]]/route";

export default async function getFiles(url: string, partition: string | undefined): Promise<FileElement[] | FetchError> {
    try {
        const res = await fetch(url, {
            cache: 'no-cache',
            headers: {
                "Partition": partition || "",
            }
        });

        const json = await res.json();
        if (res.status !== 200) {
            return { error: json?.error || 'No error message' };
        }
        return json;
    } catch (error) {
        console.error(error);
        return { error: 'Failed to fetch files' };
    }
}