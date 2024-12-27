'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from "motion/react";
import type { FetchError, FileElement } from '@/app/api/dashboard/[[...path]]/route';
import FileItem from '@/app/ui/fileItem';
import FileItemSkeleton from '@/app/ui/fileItemSkeleton';
import FileUploadArea from './fileUploadArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronUp } from 'lucide-react';
import { unformatBytes } from '@/lib/functions';
import { useToast } from '@/hooks/use-toast';

const sortOptions = ['name', 'date', 'size', 'type', 'uploader'] as const;
export default function FileList({ pathParts }: { pathParts: string[] }) {
    const { toast } = useToast();
    const [files, setFiles] = useState<null | FileElement[] | FetchError>(null)
    const [isLoading, setLoading] = useState<boolean>(true)

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

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newDirectoryName, setNewDirectoryName] = useState("")

    const fetchFiles = useCallback(async () => {
        setLoading(true);

        const res = await fetch(`/api/dashboard/${pathParts.map(path => encodeURIComponent(path)).join('/')}`, {
            cache: 'no-cache',
        })

        const json = await res.json();

        if (res.status == 200) {
            setFiles(json)
            setLoading(false)
        }
        else {
            toast({
                title: `Could not delete "${name}".`,
                description: `${json?.error || 'No error message'}`,
                variant: 'destructive',
            })
        }
    }, [pathParts]);

    useEffect(() => {
        fetchFiles();
    }, [pathParts, fetchFiles]);

    const handleAddDirectory = async (name: string) => {
        const res = await fetch(`/api/dashboard/${pathParts.map(path => encodeURIComponent(path)).join('/')}/${encodeURIComponent(name)}?folder=true`, {
            method: 'POST',
            cache: 'no-cache',
        });

        if (res.status == 200) {
            toast({
                title: `Success!`,
                description: `The folder "${name}" has been created successfully.`,
            });

            setIsDialogOpen(false);
            setNewDirectoryName("");
            return fetchFiles();
        }

        const json = await res.json();

        toast({
            title: `Could not create "${name}".`,
            description: `${json?.error || 'No error message'}`,
            variant: 'destructive',
        })
    }

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

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Your Files</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Select defaultValue="name" onValueChange={(value: string) => setSortBy(value as (typeof sortOptions)[number])}>
                            <SelectTrigger className="w-[180px] bg-gray-800 text-white border-gray-700 focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                {sortOptions.map(option =>
                                    <SelectItem key={option} value={option} className="text-white focus:bg-gray-700 focus:text-white">{option.charAt(0).toUpperCase() + option.slice(1)}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSortOrder(!sortOrder)}
                            className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:text-gray-100 transition-all duration-200 ease-in-out"
                        >
                            <div className={`transform transition-transform duration-200${sortOrder ? ' rotate-180' : ''}`}>
                                <ChevronUp className="h-4 w-4" />
                            </div>
                        </Button>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:text-gray-100 transition-colors"
                            >
                                Add Directory
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
                            <DialogHeader>
                                <DialogTitle>Create New Directory</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Enter a name for the new directory.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={newDirectoryName}
                                        onChange={(e) => setNewDirectoryName(e.target.value)}
                                        className="col-span-3 bg-gray-700 border-gray-600 text-white"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={() => handleAddDirectory(newDirectoryName)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Create Directory
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                <FileUploadArea server={`/api/dashboard/${pathParts.map(path => encodeURIComponent(path)).join('/')}`} fetchFiles={fetchFiles} />

                {isLoading && (
                    <>
                        <FileItemSkeleton />
                        <FileItemSkeleton />
                        <FileItemSkeleton />
                    </>
                )}
                {(!isLoading && files) && (
                    files && 'error' in files ? (
                        <div className="flex items-center justify-center p-4 bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
                            <h3 className="text-sm font-bold text-gray-100">{files.error}</h3>
                        </div>
                    ) : files.length == 0 ? (
                        <div className="flex items-center justify-center p-4 bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
                            <h3 className="text-sm font-bold text-gray-100">Nothing in this folder!</h3>
                        </div>
                    ) :
                        (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${sortBy}-${sortOrder}`}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative"
                                >
                                    {files.sort((a, b) => {
                                        const sorting =
                                            sortBy == 'name' ? a.name.localeCompare(b.name)
                                                : sortBy == 'date' ? (a.uploadedAt || 0) - (b.uploadedAt || 0)
                                                    : sortBy == 'size' ? unformatBytes(a.size) - unformatBytes(b.size)
                                                        : sortBy == 'type' ? a.directory ? -1 : 1
                                                            : sortBy == 'uploader' ? (a.author?.name || '').localeCompare(b.author?.name || '')
                                                                : 0;

                                        return sortOrder ? sorting : -sorting;
                                    }).map((file, index) => (
                                        <motion.div
                                            key={file.name}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                transition: {
                                                    duration: 0.2,
                                                    delay: index * 0.05
                                                }
                                            }}
                                            exit={{ opacity: 0, y: -20 }}
                                        >
                                            <FileItem
                                                pathParts={pathParts}
                                                name={file.name}
                                                size={file.size}
                                                uploadedAt={file.uploadedAt}
                                                directory={file.directory}
                                                author={file.author}
                                                onDelete={fetchFiles}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        )
                )}
            </div>
        </>
    )
}