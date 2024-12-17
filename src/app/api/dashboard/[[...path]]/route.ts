import { NextRequest, NextResponse } from "next/server";

export interface FileElement {
    name: string;
    directory: boolean;
    size?: string;
    createdDate: number;
}

export const GET = async (req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<NextResponse> => {
    const path = (await params).path || [];
    console.log('API', path);

    return NextResponse.json([
        {
            name: 'test dir',
            directory: true,
            createdDate: 0,
        },
        {
            name: 'dir 2',
            directory: true,
            createdDate: 0,
        },
        {
            name: 'file 1.txt',
            directory: false,
            createdDate: 100000,
            size: '1.2 KB',
        },
    ] satisfies FileElement[], { status: 200 });
};