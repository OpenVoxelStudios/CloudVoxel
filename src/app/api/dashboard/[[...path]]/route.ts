import { createReadStream, createWriteStream, existsSync, mkdirSync, renameSync, rmSync, Stats, statSync } from "fs";
import { NextRequest as RealNextRequest, NextResponse } from "next/server";
import path, { basename, parse } from "path";
import mime from 'mime';
import { db } from "@/../data/index";
import { eqLow, filesTable, ilike, usersTable } from "@/../data/schema";
import { and, or, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { formatBytes, sanitizedFilename, unformatBytes } from "@/lib/functions";
import CONFIG from '@/../config';
import clientconfig from "@/../clientconfig";
import { createHash } from "crypto";
import { root } from "@/lib/api";

export interface FileElement {
    name: string;
    path: string;
    size: string | null;
    uploadedAt: number | null;
    author: {
        avatar: string;
        name: string;
    } | null;
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
    const results = await db.select().from(filesTable).where(eqLow(filesTable.path, pathStr == '' ? '/' : pathStr));
    return await Promise.all(results.map(async result => {
        const user = Object.values(CONFIG.login.users).filter(user => user.email == result.author)[0];

        const avatar = await db.select({
            avatar: usersTable.avatar,
        }).from(usersTable).where(eqLow(usersTable.email, user.email)).get();

        return {
            ...result,
            author: result.author ? {
                name: user.displayName,
                avatar: avatar?.avatar || clientconfig.websiteLogo,
            } : null
        };
    })) as FileElement[];
}

async function handleFileUpload(req: NextRequest, pathStr: string, rawPathStr: string[]): Promise<NextResponse> {
    const formData = await req.formData();
    const files = formData.getAll('files').filter(file => file instanceof File);

    if (files.length === 0) return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
    if (files.length > 1) return NextResponse.json({ error: 'Only one file can be uploaded at a time.' }, { status: 400 });
    const file = files[0];

    if (!(file instanceof File)) return NextResponse.json({ error: 'Invalid file.' }, { status: 400 });

    const fileName = sanitizedFilename(file.name);
    const fullPath = path.join(pathStr, fileName);

    if (existsSync(fullPath)) return NextResponse.json({ error: 'File already exists.' }, { status: 400 });
    if (file.size > unformatBytes(clientconfig.maxFileSize)) return NextResponse.json({ error: `File exceeds the ${clientconfig.maxFileSize} limit.` }, { status: 400 });

    const fileStream = file.stream();
    const writeStream = createWriteStream(fullPath);
    const hashSum = createHash('sha256');

    await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);

        new ReadableStream({
            start() {
                return new Response(fileStream).body!.pipeTo(new WritableStream({
                    write(chunk) {
                        writeStream.write(chunk);
                        hashSum.update(chunk);
                    },
                    close() {
                        writeStream.end();
                    }
                }));
            }
        });
    });

    const hash = hashSum.digest('hex');

    await db.insert(filesTable).values({
        name: fileName,
        path: rawPathStr.join('/') == '' ? '/' : rawPathStr.join('/'),
        directory: 0,
        size: formatBytes(file.size),
        uploadedAt: Date.now(),
        author: req.auth!.user!.email,
        hash: hash,
    }).execute();

    return NextResponse.json(path.join(rawPathStr.map(encodeURIComponent).join('/'), encodeURIComponent(fileName)), { status: 200 });
}

async function handleFileDeletion(pathStr: string, rawPathStr: string[]): Promise<NextResponse> {
    const fileName = basename(pathStr);
    const filePath = parse(rawPathStr.join('/')).dir == '' ? '/' : parse(rawPathStr.join('/')).dir;
    const fileStats = (await db.select().from(filesTable).where(and(eqLow(filesTable.path, filePath), eqLow(filesTable.name, fileName))).limit(1))[0];
    if (!fileStats) return NextResponse.json({ error: 'File not found in database (this really should not happen... WHAT??).' }, { status: 404 });

    if (fileStats.directory) {
        const subFiles = await lsDir(rawPathStr.join('/'));

        if (subFiles.length > 0) return NextResponse.json({ error: 'Cannot delete non-empty directories.' }, { status: 400 });
        else {
            rmSync(pathStr, { force: true, recursive: true });
            await db.delete(filesTable).where(and(eqLow(filesTable.path, filePath), eqLow(filesTable.name, fileName))).execute();
            return NextResponse.json({ success: true }, { status: 200 });
        }
    } else {
        try {
            await db.delete(filesTable).where(and(eqLow(filesTable.path, filePath), eqLow(filesTable.name, fileName))).execute();
            rmSync(pathStr);

            const response = NextResponse.json({ success: true }, { status: 200 });
            response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=10');
            return response;
        } catch (error) {
            return NextResponse.json({ error: String(error) }, { status: 500 });
        }
    }
}

export const GET = auth(async (req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<NextResponse> => {
    if (req.auth?.user?.email && req.auth?.user?.image && req.nextUrl.pathname == '/api/dashboard') {
        await db.insert(usersTable).values({
            email: req.auth.user.email,
            avatar: req.auth.user.image,
        }).onConflictDoUpdate({
            target: usersTable.email,
            set: { avatar: req.auth.user.image },
        });
    };

    const rawPathStr = (await params).path?.map(decodeURIComponent) || [];
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
});

export const POST = auth(async (req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<NextResponse> => {
    if (!req.auth || !req.auth.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const rawPathStr = (await params).path?.map(pathPart => decodeURIComponent(pathPart).replaceAll('/', '')) || [];
    const pathStr = path.join(root, ...rawPathStr);

    if (!pathStr.startsWith(root)) return NextResponse.json({ error: 'Path is not in root.' }, { status: 403 });

    if (req.nextUrl.searchParams.get('folder')) {
        if (existsSync(pathStr)) return NextResponse.json({ error: 'Path already exists.' }, { status: 400 });
        mkdirSync(pathStr, { recursive: true });

        await db.insert(filesTable).values({
            name: rawPathStr.pop()!,
            path: rawPathStr.join('/') == '' ? '/' : rawPathStr.join('/'),
            directory: 1,
            author: req.auth!.user!.email,
        }).execute();

        return NextResponse.json({ success: true }, { status: 200 });
    }
    else return handleFileUpload(req, pathStr, rawPathStr);
});

export const DELETE = async (req: RealNextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<NextResponse> => {
    const rawPathStr = (await params).path?.map(decodeURIComponent) || [];
    const pathStr = path.join(root, ...rawPathStr);

    if (!pathStr.startsWith(root)) return NextResponse.json({ error: 'Path is not in root.' }, { status: 403 });
    if (existsSync(pathStr) === false) return NextResponse.json({ error: 'Path does not exist!' }, { status: 404 });

    return handleFileDeletion(pathStr, rawPathStr);
};

export const PATCH = async (req: RealNextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<NextResponse> => {
    try {
        const body = await req.json();

        const renameParam = sanitizedFilename(body?.rename || '');
        const UNSAFE_moveParam = body?.move || '';

        if (!renameParam && !UNSAFE_moveParam) return NextResponse.json({ error: 'No operation specified. Either move either rename should be defined in the search params.' }, { status: 400 });
        if (renameParam && UNSAFE_moveParam) return NextResponse.json({ error: 'Both move and rename operations are not allowed at the same time.' }, { status: 400 });

        const rawPathStr = (await params).path?.map(decodeURIComponent) || [];
        const pathStr = path.join(root, ...rawPathStr);

        if (!pathStr.startsWith(root)) return NextResponse.json({ error: 'Path is not in root.' }, { status: 403 });
        if (existsSync(pathStr) === false) return NextResponse.json({ error: 'Path does not exist!' }, { status: 404 });

        const fileName = basename(pathStr);
        const filePath = parse(rawPathStr.join('/')).dir == '' ? '/' : parse(rawPathStr.join('/')).dir

        if (renameParam) {
            const renameExists = (await db.select().from(filesTable).where(and(eqLow(filesTable.path, filePath), eqLow(filesTable.name, renameParam))).limit(1))[0];
            if (renameExists) return NextResponse.json({ error: 'A file with this name already exists.' }, { status: 400 });
            if (existsSync(path.join(root, ...rawPathStr.slice(0, -1), renameParam))) return NextResponse.json({ error: 'File exists on the storage system. Please contact the server administrator if you believe this is a bug.' }, { status: 400 });

            // Rename the file itself
            await db.update(filesTable).set({ name: renameParam }).where(and(eqLow(filesTable.path, filePath), eqLow(filesTable.name, fileName))).execute();

            // Rename all possible subfiles
            const getFullPath = (base: string, name: string) =>
                base === '/' ? name : `${base}/${name}`;

            const oldPath = getFullPath(filePath, fileName);
            const newPath = getFullPath(filePath, renameParam);

            await db.update(filesTable)
                .set({
                    path: sql`REPLACE(${filesTable.path}, ${oldPath}, ${newPath})`
                })
                .where(
                    or(
                        eqLow(filesTable.path, oldPath),
                        ilike(filesTable.path, `${oldPath}/%`)
                    )
                )
                .execute();

            // Actually rename
            renameSync(pathStr, path.join(root, ...rawPathStr.slice(0, -1), renameParam));

            return NextResponse.json({ success: true }, { status: 200 });
        }

        else if (UNSAFE_moveParam) {
            const moveParam = sanitizedFilename(UNSAFE_moveParam);
            const destination = rawPathStr.slice(0, -1);
            if (UNSAFE_moveParam != '../') destination.push(moveParam);
            else destination.pop();

            const newPath = destination.join('/') == '' ? '/' : destination.join('/');
            const moveExists = (await db.select().from(filesTable).where(and(eqLow(filesTable.path, newPath), eqLow(filesTable.name, fileName))).limit(1))[0];
            if (moveExists) return NextResponse.json({ error: 'A file with this name exists in the destination folder.' }, { status: 400 });

            // Edit path in the database
            let oldPath = rawPathStr.slice(0, -1).join('/');
            if (oldPath == '') oldPath = '/';


            // The file itself
            await db.update(filesTable)
                .set({
                    path: sql`REPLACE(${filesTable.path}, ${oldPath}, ${newPath})`
                })
                .where(and(
                    eqLow(filesTable.path, oldPath),
                    eqLow(filesTable.name, fileName),
                ))
                .execute();

            // All possible subfiles
            const old = `${oldPath == '/' ? '' : oldPath + '/'}${fileName}`;
            const secondNewPath = destination.concat(fileName).join('/') == '' ? '/' : destination.concat(fileName).join('/');
            console.log(old, secondNewPath);
            await db.update(filesTable)
                .set({
                    path: sql`REPLACE(${filesTable.path}, ${old}, ${secondNewPath})`
                })
                .where(or(
                    ilike(filesTable.path, `${old}/%`),
                    eqLow(filesTable.path, old)
                ))
                .execute();



            // Actually move
            renameSync(pathStr, path.join(root, ...destination, fileName));

            return NextResponse.json({ success: true }, { status: 200 });
        }

        else {
            return NextResponse.json({ error: 'Not implemented.' }, { status: 501 });
        }
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Something went wrong server side.' }, { status: 500 });
    }
};