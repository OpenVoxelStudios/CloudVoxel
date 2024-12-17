'use client';

import { useState, useEffect } from 'react';
import type { FileElement } from '@/app/api/dashboard/[[...path]]/route';
import FileItem from '@/app/ui/fileItem';
import FileItemSkeleton from '@/app/ui/fileItemSkeleton';

export default function FileList() {
    const [files, setFiles] = useState<null | FileElement[]>(null)
    const [isLoading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        fetch('/api/dashboard/')
            .then((res) => res.json())
            .then((data) => {
                setFiles(data)
                setLoading(false)
            })
    }, [])

    return (
        <>
            <h2 className="text-xl font-semibold text-white mb-4">Stored Files</h2>
            <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                {(isLoading || !files) ? (
                    <>
                        <FileItemSkeleton />
                        <FileItemSkeleton />
                        <FileItemSkeleton />
                        <FileItemSkeleton />
                        <FileItemSkeleton />
                    </>
                ) : (
                    files.map((file, index) => (
                        <FileItem
                            key={'file-' + index}
                            name={file.name}
                            size={file.size}
                            createdDate={file.createdDate}
                            directory={file.directory}
                        />
                    ))
                )}
            </div>
        </>
    )
}