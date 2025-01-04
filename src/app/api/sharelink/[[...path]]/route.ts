import { NextResponse } from "next/server";
import path from "path";
import { db } from "@/../data/index";
import { eqLow, filesTable } from "@/../data/schema";
import { and, eq } from "drizzle-orm";
import { v7 as randomUUIDv7 } from 'uuid';
import { root } from "@/lib/api";


export const GET = async (req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<NextResponse> => {
    const rawPathStr = (await params).path?.map((value) => decodeURIComponent(value).split('/')).flat() || [];
    const pathStr = path.join(root, ...rawPathStr);

    if (!pathStr.startsWith(root)) return NextResponse.json({ error: 'Path is not in root.' }, { status: 403 });

    const fileName = rawPathStr.pop()!;
    const filePath = rawPathStr.join('/') == '' ? '/' : rawPathStr.join('/');
    const file = await db.select().from(filesTable).where(
        and(
            eqLow(filesTable.name, fileName),
            eqLow(filesTable.path, filePath),
            eq(filesTable.directory, 0),
        )
    ).get();

    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });
    if (file.code) return NextResponse.json({
        name: file.name,
        hash: file.hash,
        code: file.code,
    }, { status: 200 });

    const code = randomUUIDv7();

    await db.update(filesTable).set({ code: code }).where(
        and(
            eqLow(filesTable.name, fileName),
            eqLow(filesTable.path, filePath),
            eq(filesTable.directory, 0),
        )
    ).execute();

    return NextResponse.json({
        name: file.name,
        hash: file.hash,
        code: code,
    }, { status: 200 });
};