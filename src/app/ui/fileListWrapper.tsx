'use client';

import FileListHeader from "./fileListHeader";
import FileUploadArea from "./fileUploadArea";
import type { FetchError, FileElement } from "../api/dashboard/[[...path]]/route";
import FileList from "./fileList";
import getFiles from "@/lib/getFiles";

export const sortOptions = ['name', 'date', 'size', 'type', 'uploader'] as const;
import { useCallback, useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import { useToast } from "@/hooks/use-toast";

export default function FileListWrapper({ pathParts, initialFiles }: { pathParts: string[], initialFiles: FileElement[] | FetchError | null }) {
    const { toast } = useToast();
    const memoizedPathParts = useMemo(() => pathParts, [pathParts]);

    const [partitions, setPartitions] = useState<{ name: string; displayName: string }[] | undefined>(undefined);
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

    const debouncedFetch = useCallback(
        async () => {
            try {
                const fetchedFiles = await getFiles(
                    `/api/dashboard/${memoizedPathParts.map(encodeURIComponent).join('/')}`,
                    partition
                );
                setFiles(fetchedFiles);
            } catch (error) {
                toast({
                    title: `Could not fetch files.`,
                    description: `${error || 'No error message'}`,
                    variant: 'destructive',
                });
                setFiles(null);
            }
        },
        [memoizedPathParts, partition, setFiles, toast]
    );

    const fetchFiles = useMemo(
        () => debounce(debouncedFetch, 300),
        [debouncedFetch]
    );

    useEffect(() => {
        return () => {
            fetchFiles.cancel();
        };
    }, [fetchFiles]);

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
                toast({
                    title: `Could not fetch partitions.`,
                    description: `${err || 'No error message'}`,
                    variant: 'destructive',
                });
                setPartitions(undefined);
            });
    }, [toast]);

    useEffect(() => {
        if (partitions && !partitions.some(p => p.name === partition)) {
            setPartition(partitions[0]?.name);
        }
    }, [partitions, partition]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles, partition]);

    const memoizedFileUploadArea = useMemo(() => (
        <FileUploadArea
            server={`/api/dashboard/${memoizedPathParts.map(encodeURIComponent).join('/')}`}
            fetchFiles={fetchFiles}
            partition={partition}
        />
    ), [memoizedPathParts, fetchFiles, partition]);

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
                {memoizedFileUploadArea}
                <FileList
                    files={files}
                    pathParts={memoizedPathParts}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    fetchFiles={fetchFiles}
                    partition={partition}
                />
            </div>
        </>
    )
}