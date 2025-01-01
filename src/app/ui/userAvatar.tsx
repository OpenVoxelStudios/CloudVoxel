import { User } from "lucide-react";
import Image from "next/image";

export default function UserAvatar({ src, className, size }: { src?: string | null, className?: string, size?: number }) {
    if (!src) return <User className={className || "h-5 w-5"} />
    return <Image unoptimized src={src} alt="The user avatar" className={className || ""} width={size || 32} height={size || 32} />
};