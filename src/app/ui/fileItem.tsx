'use client';

import { useState } from 'react'
import { File, Folder, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { FileElement } from '@/app/api/dashboard/[[...path]]/route'
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import Image from 'next/image';


export default function FileItem({
    name,
    size,
    uploadedAt,
    directory,
    pathParts,
    onDelete,
    author,
}: Omit<FileElement, 'path'> & {
    pathParts: string[],
    onDelete: () => void
}) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true)

        const res = await fetch(`/api/dashboard/${pathParts.map(path => encodeURIComponent(path)).join('/')}/${encodeURIComponent(name)}`, {
            method: 'DELETE',
        });

        if (res.status == 200) {
            toast({
                title: `Deleted "${name}" successfully.`,
            })
            return onDelete();
        }

        const json = await res.json();
        toast({
            title: `Could not delete "${name}".`,
            description: `${json?.error || 'No error message'}`,
            variant: 'destructive',
        })
        setIsDeleting(false);
    }

    return (
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 hover:bg-gray-750 transition-colors duration-150 ease-in-out">
            <Link href={`${directory ? '/dashboard' : '/api/dashboard'}${pathParts.length == 0 ? '' : '/'}${pathParts.map(path => encodeURIComponent(path)).join('/')}/${encodeURIComponent(name)}`} target={directory ? '_self' : '_blank'} className="flex-1">
                <div className="flex items-center space-x-4 cursor-pointer">
                    <div className="bg-blue-900 p-2 rounded-lg">
                        {directory ? <Folder className="w-6 h-6 text-blue-400" /> : <File className="w-6 h-6 text-blue-400" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-100">{name}</h3>
                        <div className="flex space-x-4 text-xs text-gray-400">
                            {size && <span>{size}</span>}
                            {uploadedAt && <span>{new Date(uploadedAt).toLocaleString()}</span>}
                        </div>
                    </div>
                </div>
            </Link>
            {author && (
                <HoverCard>
                    <HoverCardContent className="w-fit bg-gray-900 border-gray-600 text-gray-100">
                        <div className="flex justify-between space-x-4">
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold">{author.name}</h4>
                            </div>
                        </div>
                    </HoverCardContent>
                    <HoverCardTrigger asChild>
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden cursor-pointer">
                            <Image
                                unoptimized
                                src={author.avatar}
                                alt="User avatar"
                                className="w-full h-full object-cover"
                                width={64}
                                height={64}
                            />
                        </div>
                    </HoverCardTrigger>
                </HoverCard>
            )}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors duration-150 ease-in-out"
                        disabled={isDeleting}
                    >
                        {isDeleting ?
                            'Deleting...' :
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </>
                        }
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 border border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-100">Are you sure you want to delete this {directory ? 'folder' : 'file'}?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete &quot;{name}&quot;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-gray-100 hover:bg-gray-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

