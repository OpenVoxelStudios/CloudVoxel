'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FetchError, FileElement } from '@/app/api/dashboard/[[...path]]/route';
import FileItem from '@/app/ui/fileItem';
import FileItemSkeleton from '@/app/ui/fileItemSkeleton';
import FileUploadArea from './fileUploadArea';

export default function FileList({ pathParts }: { pathParts: string[] }) {
    const [files, setFiles] = useState<null | FileElement[] | FetchError>(null)
    const [isLoading, setLoading] = useState<boolean>(true)

    const fetchFiles = useCallback(() => {
        setLoading(true);
        fetch(`/api/dashboard/${pathParts.map(path => encodeURIComponent(path)).join('/')}`, {
            cache: 'no-cache',
        })
            .then((res) => res.json())
            .then((data) => {
                setFiles(data)
                setLoading(false)
            });
    }, [pathParts]);

    useEffect(() => {
        fetchFiles();
    }, [pathParts, fetchFiles]);


    return (
        <>
            <h2 className="text-xl font-semibold text-white mb-4">Stored Files</h2>
            <div className="bg-gray-800 rounded-lg shadow overflow-hidden">

                <FileUploadArea server={`/api/dashboard/${pathParts.map(path => encodeURIComponent(path)).join('/')}`} />

                {(isLoading || !files) ? (
                    <>
                        <FileItemSkeleton />
                        <FileItemSkeleton />
                        <FileItemSkeleton />
                    </>
                ) : files && 'error' in files ? (
                    <div className="flex items-center justify-center p-4 bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
                        <h3 className="text-sm font-bold text-gray-100">{files.error}</h3>
                    </div>
                ) : files.length == 0 ? (
                    <div className="flex items-center justify-center p-4 bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
                        <h3 className="text-sm font-bold text-gray-100">Nothing in this folder!</h3>
                    </div>
                ) :
                    (
                        files
                            // TODO: Proper sorting settings
                            .sort((a) => a.directory ? -1 : 1)
                            .map((file, index) => (
                                <FileItem
                                    pathParts={pathParts}
                                    key={'file-' + index}
                                    name={file.name}
                                    size={file.size}
                                    uploadedAt={file.uploadedAt}
                                    directory={file.directory}
                                    author={file.author}
                                    onDelete={fetchFiles}
                                />
                            ))
                    )}
            </div>
        </>
    )
}