'use client'

import { signOut } from 'next-auth/react';
import { LogOut, ChevronDown } from 'lucide-react';
import { Session } from 'next-auth';
import UserAvatar from './userAvatar';
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function UserDropdown({ session }: { session: Session }) {
    return (
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
    )
}