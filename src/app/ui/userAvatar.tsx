import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export default function UserAvatar({ src, name }: { src?: string | null, name: string }) {
    if (!src) return <User className="rounded-full" />

    const rgx = /(\p{L}{1})\p{L}+/gu;
    const initials = [...name.matchAll(rgx)];

    return <Avatar>
        <AvatarImage src={src} alt={`${name}'s avatar`} />
        <AvatarFallback>{((initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')).toUpperCase()}</AvatarFallback>
    </Avatar>
};