import Link from "next/link";

export default function Home() {
  return (
    <div className="items-center justify-items-center font-[family-name:var(--font-geist-sans)] text-white">
      <Link href="/login">You came here too early! No main page yet :)</Link>
    </div>
  );
}
