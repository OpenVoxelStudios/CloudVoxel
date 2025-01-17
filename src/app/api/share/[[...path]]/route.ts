import { createReadStream, statSync } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import mime from 'mime';
import { db } from "@/../data/index";
import { eqLow, filesTable } from "@/../data/schema";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/auth";
import { getRootAndPermission } from "@/lib/api";
import { root as ROOT } from "@/lib/root";
import { getPartition } from "@/lib/partition";

export const GET = auth(async (req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<NextResponse> => {
    const fileHash = req.nextUrl.searchParams.get('hash');
    const fileCode = req.nextUrl.searchParams.get('code');
    if (!fileHash) return NextResponse.json({ error: 'No hash parameter provided in the URL.' }, { status: 400 });
    if (!fileCode) return NextResponse.json({ error: 'No code parameter provided in the URL.' }, { status: 400 });

    const root = await getRootAndPermission(req, ROOT);
    if (!root) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const rawPathStr = (await params).path?.map((value) => decodeURIComponent(value).split('/')).flat() || [];
    const pathStr = path.join(root, ...rawPathStr);

    if (!pathStr.startsWith(root)) return NextResponse.json({ error: 'Path is not in root.' }, { status: 403 });
    const fileName = rawPathStr.pop()!;
    const filePath = rawPathStr.join('/') == '' ? '/' : rawPathStr.join('/');
    const partition = getPartition(req);

    const file = await db.select().from(filesTable).where(
        and(
            eqLow(filesTable.name, fileName),
            eqLow(filesTable.path, filePath),
            (partition && typeof ROOT !== 'string') ? eqLow(filesTable.partition, partition!) : isNull(filesTable.partition),
            eq(filesTable.hash, fileHash),
            eq(filesTable.code, fileCode),
            eq(filesTable.directory, 0),
        )
    ).get();

    if (!file) return NextResponse.json({ error: 'File not found or wrong code/hash.' }, { status: 404 });

    const stats = statSync(pathStr);
    const readStream = createReadStream(pathStr);
    const response = new NextResponse(readStream as unknown as ReadableStream, {
        status: 200,
        headers: {
            'Content-Type': (req.nextUrl.searchParams.get('download') == 'true' ? false : mime.getType(pathStr)) || 'application/octet-stream',
            'Content-Length': stats.size.toString(),
            'ETag': `"${fileHash}"`,
            'X-Content-SHA256': fileHash,
        }
    });
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=10');
    return response;
});