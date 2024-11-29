import UserAvatar from './userAvatar';
import { signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Session } from 'next-auth';
import { LogOut } from 'lucide-react';


export default function userDropdown({ session }: { session: Session }) {
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full overflow-hidden">
                <UserAvatar src={session.user?.image} size={48} />
                <span className="sr-only">User menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem disabled>
                <UserAvatar src={session.user?.image} className="mr-2" size={24} />
                <span>{session.user?.name}</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
                <span>{session.user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span className='cursor-pointer' onClick={() => signOut({ redirectTo: '/' })}>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
}