import { createReadStream, existsSync, readdirSync, Stats, statSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import mime from 'mime';
const root = path.join(process.cwd(), 'storage');

export interface FileElement {
    name: string;
    directory: boolean;
    size?: string;
    createdDate: number;
}

export interface FetchError {
    error: string;
}

function isFileElement(pathStr: string): FetchError | false | Stats {
    if (existsSync(pathStr) === false) return { error: 'Path does not exist' };
    let stats = statSync(pathStr);
    if (stats.isDirectory()) return false;

    return stats;
}

function lsDir(pathStr: string): FileElement[] | FetchError {
    return readdirSync(pathStr, { withFileTypes: true }).map((dirent) => {
        let details = statSync(path.join(dirent.parentPath, dirent.name));

        return {
            name: dirent.name,
            directory: dirent.isDirectory(),
            size: dirent.isDirectory() ? undefined : `${details.size}B`, // TODO: Proper size formatting
            createdDate: details.birthtime.getTime(),
        } satisfies FileElement;
    });
}



export const GET = async (req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<NextResponse> => {
    const pathStr = path.join(root, ...(await params).path?.map(pathPart => decodeURIComponent(pathPart)) || []);
    const isFile = isFileElement(pathStr);

    if (isFile && 'error' in isFile) return NextResponse.json(isFile, { status: 404 });


    if (!isFile) return NextResponse.json(lsDir(pathStr), { status: 200 });
    else {
        const readStream = createReadStream(pathStr);
        return new NextResponse(readStream as unknown as ReadableStream, {
            status: 200,
            headers: {
                'Content-Type': mime.getType(pathStr) || 'application/octet-stream',
                'Content-Length': isFile.size.toString(),
            }
        });
    }
};