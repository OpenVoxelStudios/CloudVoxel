'use client';

import { motion, AnimatePresence } from "motion/react";
import FileItem from '@/app/ui/fileItem';
import { unformatBytes } from '@/lib/functions';
import { sortOptions } from './fileListWrapper';
import { FetchError, FileElement } from '../api/dashboard/[[...path]]/route';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Suspense, useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function FileList({ pathParts, sortBy, sortOrder, files, fetchFiles }: { pathParts: string[], sortBy: typeof sortOptions[number], sortOrder: boolean, files: FileElement[] | FetchError, fetchFiles: () => Promise<void> }) {
    const { toast } = useToast();
    const [shareTo, setShareTo] = useState<{ to: string; url: string | undefined | Promise<string | undefined> } | null>(null);

    return (
        <>
            <Dialog defaultOpen={false} open={shareTo !== null} onOpenChange={(open) => !open && setShareTo(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share link</DialogTitle>
                        <DialogDescription>
                            Anyone who has this link will be able to view this.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Link
                            </Label>
                            <Suspense fallback={
                                <Input id="link" defaultValue="Loading..." readOnly />
                            }>
                                {shareTo?.url instanceof Promise ? (
                                    shareTo.url.then(url => (
                                        setShareTo({ to: shareTo.to, url: url }),
                                        <Input
                                            id="link"
                                            defaultValue={url || 'Something went wrong!'}
                                            readOnly
                                        />
                                    ))
                                ) : (
                                    <Input
                                        id="link"
                                        defaultValue={shareTo?.url || 'Something went wrong!'}
                                        readOnly
                                    />
                                )}
                            </Suspense>
                        </div>
                        <Button type="submit" size="sm" className="px-3" onClick={async () => {
                            const url = await shareTo?.url;
                            if (!url) return;
                            try {
                                await navigator.clipboard.writeText(url);
                                toast({ title: `Copied link to clipboard.` })
                            } catch (err) {
                                toast({
                                    title: `Failed to copy link to clipboard.`,
                                    description: String(err) || 'No error message',
                                    variant: 'destructive',
                                })
                            }
                        }}>
                            <span className="sr-only">Copy</span>
                            <Copy />
                        </Button>
                    </div>
                    <DialogFooter className="sm:justify-end">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {(
                'error' in files ? (
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
                                            setShareTo={setShareTo}
                                            folders={files.filter(f => f.directory == 1 && f.name != file.name).map(f => f.name).sort((a, b) => a.localeCompare(b))}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )
            )
            }
        </>
    )
}