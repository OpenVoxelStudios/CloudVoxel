'use client'

import { signOut } from 'next-auth/react';
import { LogOut, ChevronDown, KeyRound } from 'lucide-react';
import UserAvatar from './userAvatar';
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signIn as passkeySignIn } from "next-auth/webauthn";
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function UserDropdown({ session }: { session: Session }) {
    const { toast } = useToast();
    const [hasPasskey, setHasPasskey] = useState(session.hasPasskey);
    const [deletePasskeyDialog, setDeletePasskeyDialog] = useState(false);

    return (
        <>
            <AlertDialog open={deletePasskeyDialog} onOpenChange={setDeletePasskeyDialog}>
                <AlertDialogContent className="bg-gray-800 border border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-100">Are you sure you want to delete your Passkey?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This will delete your Passkey. You can still create a new one later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-gray-100 hover:bg-gray-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700"
                            onClick={async () => {
                                const res = await fetch("/api/user/passkey", {
                                    method: "DELETE",
                                })

                                const json = await res.json();

                                if (res.status == 200) {
                                    toast({
                                        title: `Successfully removed passkey.`,
                                    });

                                    setHasPasskey(false);
                                }
                                else {
                                    toast({
                                        title: `Could generate a share link.`,
                                        description: `${json?.error || 'No error message'}`,
                                        variant: 'destructive',
                                    });
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-12 px-2 flex items-center gap-2 hover:bg-gray-800 transition-colors nofocus"
                    >
                        <UserAvatar src={session.user?.image} size={32} className="rounded-full" />
                        <span className="font-medium text-sm hidden md:inline-block text-secondary-foreground">
                            {session.user?.name}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">User menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 bg-background border border-border shadow-lg rounded-lg">
                    <div className="flex flex-col space-y-1 p-2 mb-2 bg-accent/10 rounded-md">
                        <div className="flex items-center gap-2">
                            <UserAvatar src={session.user?.image} size={40} className="rounded-full" />
                            <div className="flex flex-col">
                                <span className="font-medium text-secondary-foreground">{session.user?.name}</span>
                                <span className="text-xs text-muted-foreground">{session.user?.email}</span>
                            </div>
                        </div>
                    </div>

                    {hasPasskey ? (
                        <DropdownMenuItem
                            className="cursor-pointer text-secondary-foreground hover:bg-red-600/10 hover:text-red-600 focus:bg-red-600/10 focus:text-red-600 transition-colors rounded-md"
                            onClick={() => setDeletePasskeyDialog(true)}
                        >
                            <KeyRound className="mr-2 h-4 w-4" />
                            <span>Remove Passkey</span>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            className="cursor-pointer text-secondary-foreground transition-colors rounded-md"
                            onClick={() => passkeySignIn("passkey", { action: "register" }).then(() => setHasPasskey(true))}
                        >
                            <KeyRound className="mr-2 h-4 w-4" />
                            <span>Register new Passkey</span>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                        className="cursor-pointer text-secondary-foreground hover:bg-red-600/10 hover:text-red-600 focus:bg-red-600/10 focus:text-red-600 transition-colors rounded-md"
                        onClick={() => signOut({ redirectTo: location.origin })}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}