import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserAvatar({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) {
  const rgx = /(\p{L}{1})\p{L}+/gu;
  const initials = [...name.matchAll(rgx)];

  return (
    <Avatar>
      <AvatarImage src={src || undefined} alt={`${name}'s avatar`} />
      <AvatarFallback>
        {(
          (initials.shift()?.[1] || "") + (initials.pop()?.[1] || "")
        ).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
