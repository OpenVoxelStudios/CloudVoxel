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


export default function FileItem({
    name,
    size,
    uploadedAt,
    directory,
    pathParts,
    onDelete
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

        if (res.status == 200) return onDelete();

        const json = await res.json();
        toast({
            title: `Could not delete "${name}"`,
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
                        <AlertDialogTitle className="text-gray-100">Are you sure you want to delete this file?</AlertDialogTitle>
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

