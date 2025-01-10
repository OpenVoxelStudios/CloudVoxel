'use client';

import { useCallback, useEffect, useState } from "react";
import FileListHeader from "./fileListHeader";
import FileUploadArea from "./fileUploadArea";
import FileItemSkeleton from './fileItemSkeleton';
import type { FetchError, FileElement } from "../api/dashboard/[[...path]]/route";
import FileList from "./fileList";
import getFiles from "@/lib/getFiles";

export const sortOptions = ['name', 'date', 'size', 'type', 'uploader'] as const;
export default function FileListWrapper({ pathParts, initialFiles }: { pathParts: string[], initialFiles: FileElement[] | FetchError | null }) {
    const [partitions, setPartitions] = useState<{ name: string; displayName: string }[] | undefined>(undefined);

    useEffect(() => {
        fetch('/api/partitions', { cache: 'no-cache' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch partitions');
                return res.json();
            })
            .then(data => setPartitions(data == 'undefined' ? undefined : data))
            .catch(err => {
                console.error('Error fetching partitions:', err);
                setPartitions(undefined);
            });
    }, []);

    const [files, setFiles] = useState(initialFiles);
    const [sortOrder, setSortOrder] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('preferences.sortOrder') ? localStorage.getItem('preferences.sortOrder') === 'true' : true;
        }
        return true;
    });
    const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('preferences.sortBy');
            return stored && sortOptions.includes(stored as (typeof sortOptions)[number]) ? stored as (typeof sortOptions)[number] : "name";
        }
        return "name";
    });
    const [partition, setPartition] = useState<string | undefined>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('preferences.partition');
            return stored ? stored : (partitions?.[0]?.name || undefined);
        }
        return undefined;
    });

    const fetchFiles = useCallback(async () => {
        setFiles(await getFiles(`/api/dashboard/${pathParts.map(encodeURIComponent).join('/')}`, partition));
    }, [pathParts, partition]);

    useEffect(() => {
        setFiles(null);
        fetchFiles();
    }, [fetchFiles, partition]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferences.sortBy', sortBy);
        }
    }, [sortBy]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferences.sortOrder', sortOrder ? 'true' : 'false');
        }
    }, [sortOrder]);

    useEffect(() => {
        if (typeof window !== 'undefined' && partition) {
            localStorage.setItem('preferences.partition', partition);
        }
    }, [partition]);

    useEffect(() => {
        if (partitions && !partitions.some(p => p.name === partition)) {
            setPartition(partitions[0]?.name);
        }
    }, [partitions])

    return (
        <>
            <FileListHeader
                pathParts={pathParts}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                sortBy={sortBy}
                setSortBy={setSortBy}
                fetchFiles={fetchFiles}
                partitions={partitions}
                partition={partition}
                setPartition={setPartition}
            />
            <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                <FileUploadArea
                    server={`/api/dashboard/${pathParts.map(path => encodeURIComponent(path)).join('/')}`}
                    fetchFiles={fetchFiles}
                    partition={partition}
                />
                {!files ? (
                    <>
                        <FileItemSkeleton />
                        <FileItemSkeleton />
                    </>
                ) : (
                    <FileList
                        files={files}
                        pathParts={pathParts}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        fetchFiles={fetchFiles}
                        partition={partition}
                    />
                )}
            </div>
        </>
    )
}