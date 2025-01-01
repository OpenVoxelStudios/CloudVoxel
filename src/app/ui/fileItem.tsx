'use client';

import { Dispatch, SetStateAction, useState } from 'react'
import { Download, Edit, File, Folder, FolderInput, FolderOutput, Globe, Share2, Trash2, Users } from 'lucide-react'
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
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu';


export default function FileItem({
    name,
    size,
    uploadedAt,
    directory,
    pathParts,
    onDelete,
    author,
    folders,
    setShareTo,
    setRenameTo,
    onMove
}: Omit<FileElement, 'path'> & {
    pathParts: string[],
    folders: string[],
    setShareTo: Dispatch<SetStateAction<{
        to: string;
        url: string | undefined | Promise<string | undefined>;
    } | null>>,
    setRenameTo: Dispatch<SetStateAction<{ from: string; to: string; } | null>>,
    onDelete: () => Promise<void>,
    onMove: (name: string, folder: string) => Promise<void>,
}) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true)

        const res = await fetch(`/api/dashboard/${pathParts.map(encodeURIComponent).join('/')}/${encodeURIComponent(name)}`, {
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
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 hover:bg-gray-750 transition-colors duration-150 ease-in-out">
                    <Link href={`${directory ? '/dashboard' : '/api/dashboard'}${pathParts.length == 0 ? '' : '/'}${pathParts.map(encodeURIComponent).join('/')}/${encodeURIComponent(name)}`} target={directory ? '_self' : '_blank'} className="flex-1">
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
                                <div className="mr-2 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden cursor-pointer">
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
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64 bg-gray-900 border-gray-700">
                <ContextMenuItem className="text-white hover:bg-gray-900 focus:bg-gray-900 hover:text-white focus:text-white data-[highlighted]:bg-gray-900">
                    {directory ? <Folder className="mr-2 h-4 w-4" /> : <File className="mr-2 h-4 w-4" />}
                    <span>{name}</span>
                </ContextMenuItem>
                <ContextMenuSeparator className="bg-gray-700" />

                {!directory &&
                    <Link href={`/api/dashboard/${pathParts.map(encodeURIComponent).join('/')}/${encodeURIComponent(name)}`} target="_blank">
                        <ContextMenuItem className="text-white hover:bg-gray-800 focus:bg-gray-800 hover:text-white focus:text-white data-[highlighted]:bg-gray-800 cursor-pointer">
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                        </ContextMenuItem>
                    </Link>
                }

                <ContextMenuItem onClick={() => {
                    setRenameTo({ from: name, to: name });
                }} className="text-white hover:bg-gray-800 focus:bg-gray-800 hover:text-white focus:text-white data-[highlighted]:bg-gray-800 cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Rename</span>
                </ContextMenuItem>

                {(folders.length > 0 || pathParts.length > 0) &&
                    <ContextMenuSub>
                        <ContextMenuSubTrigger className="text-white hover:bg-gray-800 focus:bg-gray-800 hover:text-white focus:text-white data-[highlighted]:bg-gray-800 data-[state=open]:bg-gray-800 data-[highlighted]:text-white data-[state=open]:text-white">
                            <FolderInput className="mr-2 h-4 w-4" />
                            <span>Move to</span>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-64 bg-gray-900 border-gray-700">
                            {pathParts.length > 0 &&
                                <ContextMenuItem key={`move-from-${name}-back`} onClick={() => onMove(name, '../')} className="text-white hover:bg-gray-800 focus:bg-gray-800 hover:text-white focus:text-white data-[highlighted]:bg-gray-800">
                                    <FolderOutput className="mr-2 h-4 w-4" />
                                    Back
                                </ContextMenuItem>
                            }
                            {folders.map(folder =>
                                <ContextMenuItem key={`move-from-${name}-to-${folder}`} onClick={() => onMove(name, folder)} className="text-white hover:bg-gray-800 focus:bg-gray-800 hover:text-white focus:text-white data-[highlighted]:bg-gray-800">
                                    {folder}
                                </ContextMenuItem>
                            )}
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                }

                {!directory &&
                    <ContextMenuSub>
                        <ContextMenuSubTrigger className="text-white hover:bg-gray-800 focus:bg-gray-800 hover:text-white focus:text-white data-[highlighted]:bg-gray-800 data-[state=open]:bg-gray-800 data-[highlighted]:text-white data-[state=open]:text-white">
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share</span>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-64 bg-gray-900 border-gray-700">
                            <ContextMenuItem onClick={async () => {
                                setShareTo({
                                    to: 'Everyone', url: new Promise(async resolve => {
                                        const res = await fetch(`/api/sharelink/${pathParts.map(encodeURIComponent).join('/')}/${encodeURIComponent(name)}`);
                                        const json = await res.json();

                                        if (res.status == 200) {
                                            resolve(`${location.origin}/api/share/${pathParts.concat(name).map(encodeURIComponent).join('/')}?hash=${json.hash}&code=${json.code}`);
                                        }
                                        else {
                                            toast({
                                                title: `Could generate a share link.`,
                                                description: `${json?.error || 'No error message'}`,
                                                variant: 'destructive',
                                            })
                                            resolve(undefined)
                                        }
                                    })
                                })
                            }} className="text-white hover:bg-gray-800 focus:bg-gray-800 hover:text-white focus:text-white data-[highlighted]:bg-gray-800 cursor-pointer">
                                <Globe className="mr-2 h-4 w-4" />
                                <span>Everyone</span>
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => setShareTo({ to: 'Logged-in users', url: `${location.origin}/api/dashboard/${pathParts.concat(name).map(encodeURIComponent).join('/')}` })} className="text-white hover:bg-gray-800 focus:bg-gray-800 hover:text-white focus:text-white data-[highlighted]:bg-gray-800 cursor-pointer">
                                <Users className="mr-2 h-4 w-4" />
                                <span>Logged-in Users</span>
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                }
            </ContextMenuContent>
        </ContextMenu>
    )
}

