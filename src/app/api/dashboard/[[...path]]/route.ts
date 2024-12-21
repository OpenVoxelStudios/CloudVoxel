import { createReadStream, createWriteStream, existsSync, rmdirSync, rmSync, Stats, statSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path, { basename, parse } from "path";
import mime from 'mime';
import { db } from "@/../data/index";
import { filesTable } from "@/../data/schema";
import { and, eq } from "drizzle-orm";
import { Formidable } from "formidable";
import { auth } from "@/auth";
import { NextApiRequest } from "next";
const root = path.join(process.cwd(), 'storage');

export interface FileElement {
    name: string;
    path: string;
    size: string | null;
    uploadedAt: number | null;
    author: string | null;
    directory: number;
}

export interface FetchError {
    error: string;
}

export const config = {
    api: {
        bodyParser: false
    }
}

function isFileElement(pathStr: string): FetchError | false | Stats {
    if (existsSync(pathStr) === false) return { error: 'Path does not exist' };
    const stats = statSync(pathStr);
    if (stats.isDirectory()) return false;

    return stats;
}

async function lsDir(pathStr: string): Promise<FileElement[]> {
    const results = await db.select().from(filesTable).where(eq(filesTable.path, pathStr == '' ? '/' : pathStr));
    return results as FileElement[];
}



export const GET = async (req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<NextResponse> => {
    const rawPathStr = (await params).path?.map(pathPart => decodeURIComponent(pathPart)) || [];
    const pathStr = path.join(root, ...rawPathStr);

    if (!pathStr.startsWith(root)) return NextResponse.json({ error: 'Path is not in root.' }, { status: 403 });

    const isFile = isFileElement(pathStr);

    if (isFile && 'error' in isFile) return NextResponse.json(isFile, { status: 404 });


    if (!isFile) {
        const response = NextResponse.json(await lsDir(rawPathStr.join('/')), { status: 200 });
        response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=10');
        return response;
    } else {
        const readStream = createReadStream(pathStr);
        const response = new NextResponse(readStream as unknown as ReadableStream, {
            status: 200,
            headers: {
                'Content-Type': mime.getType(pathStr) || 'application/octet-stream',
                'Content-Length': isFile.size.toString(),
            }
        });
        response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=10');
        return response;
    }
};

export const POST = async (req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<NextResponse> => {
    // TODO: CHECK LOGIN

    const rawPathStr = (await params).path?.map(pathPart => decodeURIComponent(pathPart)) || [];
    const pathStr = path.join(root, ...rawPathStr);

    if (!pathStr.startsWith(root)) return NextResponse.json({ error: 'Path is not in root.' }, { status: 403 });

    try {
        const formData = await req.formData();
        const files = formData.getAll('files').filter(file => file instanceof File);

        if (files.length === 0) return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
        if (files.length > 1) return NextResponse.json({ error: 'Only one file can be uploaded at a time.' }, { status: 400 })
        const file = files[0];

        if (!(file instanceof File)) return NextResponse.json({ error: 'Invalid file.' }, { status: 400 });

        const fileName = file.name;
        const fullPath = path.join(pathStr, fileName);

        if (existsSync(fullPath)) return NextResponse.json({ error: 'File already exists.' }, { status: 400 });

        const fileStream = file.stream();
        const writeStream = createWriteStream(fullPath);
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
            new ReadableStream({
                start() {
                    return new Response(fileStream).body!.pipeTo(new WritableStream({
                        write(chunk) {
                            writeStream.write(chunk);
                        },
                        close() {
                            writeStream.end();
                        }
                    }));
                }
            });
        });

        // Add file entry to database
        /*await db.insert(filesTable).values({
            name: fileName,
            path: rawPathStr.join('/') || '/',
            size: file.size.toString(),
            uploadedAt: Date.now(),
            author: 'user', // Replace with actual user info
            directory: 0
        }).execute();*/

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<NextResponse> => {
    const rawPathStr = (await params).path?.map(pathPart => decodeURIComponent(pathPart)) || [];
    const pathStr = path.join(root, ...rawPathStr);

    if (!pathStr.startsWith(root)) return NextResponse.json({ error: 'Path is not in root.' }, { status: 403 });
    if (existsSync(pathStr) === false) return NextResponse.json({ error: 'Path does not exist!' }, { status: 404 });

    const fileStats = (await db.select().from(filesTable).where(and(eq(filesTable.path, parse(rawPathStr.join('/') == '' ? '/' : rawPathStr.join('/')).dir), eq(filesTable.name, basename(pathStr)))).limit(1))[0];
    if (!fileStats) return NextResponse.json({ error: 'File not found in database (this really should not happen... WHAT??).' }, { status: 404 });

    if (fileStats.directory) {
        const subFiles = await lsDir(rawPathStr.join('/'));

        if (subFiles.length > 0) return NextResponse.json({ error: 'Cannot delete non-empty directories.' }, { status: 400 });
        else {
            rmdirSync(pathStr);
            await db.delete(filesTable).where(and(eq(filesTable.path, fileStats.path), eq(filesTable.name, fileStats.name))).execute();
            return NextResponse.json({ success: true }, { status: 200 });
        }
    }
    else {
        try {
            const fileName = rawPathStr.pop()!;
            const filePath = path.join(...rawPathStr) == '' ? '/' : path.join(...rawPathStr);

            console.log('DELETE', pathStr);
            await db.delete(filesTable).where(and(eq(filesTable.path, filePath), eq(filesTable.name, fileName))).execute();
            rmSync(pathStr);

            const response = NextResponse.json({ success: true }, { status: 200 });
            response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=10');
            return response;
        } catch (error) {
            return NextResponse.json({ error: String(error) }, { status: 500 });
        }
    }
}