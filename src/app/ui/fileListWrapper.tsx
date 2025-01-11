'use client';

import FileListHeader from "./fileListHeader";
import FileUploadArea from "./fileUploadArea";
import FileItemSkeleton from './fileItemSkeleton';
import type { FetchError, FileElement } from "../api/dashboard/[[...path]]/route";
import FileList from "./fileList";
import getFiles from "@/lib/getFiles";

export const sortOptions = ['name', 'date', 'size', 'type', 'uploader'] as const;
import { useCallback, useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";

export default function FileListWrapper({ pathParts, initialFiles }: { pathParts: string[], initialFiles: FileElement[] | FetchError | null }) {
    const memoizedPathParts = useMemo(() => pathParts, [pathParts]);

    const [partitions, setPartitions] = useState<{ name: string; displayName: string }[] | undefined>(undefined);
    const [files, setFiles] = useState(initialFiles);
    const [isLoading, setIsLoading] = useState(false);
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

    const fetchFiles = useCallback(debounce(async () => {
        setIsLoading(true);
        try {
            const fetchedFiles = await getFiles(`/api/dashboard/${memoizedPathParts.map(encodeURIComponent).join('/')}`, partition);
            setFiles(fetchedFiles);
        } catch (error) {
            console.error('Error fetching files:', error);
            setFiles(null);
        } finally {
            setIsLoading(false);
        }
    }, 300), [memoizedPathParts, partition]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles, partition]);

    const debouncedSetSortBy = useMemo(() => debounce((value: typeof sortOptions[number]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferences.sortBy', value);
        }
    }, 300), []);

    useEffect(() => {
        debouncedSetSortBy(sortBy);
    }, [sortBy, debouncedSetSortBy]);

    const debouncedSetSortOrder = useMemo(() => debounce((value: boolean) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferences.sortOrder', value ? 'true' : 'false');
        }
    }, 300), []);

    useEffect(() => {
        debouncedSetSortOrder(sortOrder);
    }, [sortOrder, debouncedSetSortOrder]);

    const debouncedSetPartition = useMemo(() => debounce((value: string | undefined) => {
        if (typeof window !== 'undefined' && value) {
            localStorage.setItem('preferences.partition', value);
        }
    }, 300), []);

    useEffect(() => {
        debouncedSetPartition(partition);
    }, [partition, debouncedSetPartition]);

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

    useEffect(() => {
        if (partitions && !partitions.some(p => p.name === partition)) {
            setPartition(partitions[0]?.name);
        }
    }, [partitions, partition]);

    return (
        <>
            <FileListHeader
                pathParts={memoizedPathParts}
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
                    server={`/api/dashboard/${memoizedPathParts.map(path => encodeURIComponent(path)).join('/')}`}
                    fetchFiles={fetchFiles}
                    partition={partition}
                />
                {isLoading ? (
                    <>
                        <FileItemSkeleton />
                        <FileItemSkeleton />
                    </>
                ) : (
                    <FileList
                        files={files}
                        pathParts={memoizedPathParts}
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