import { ChevronRight } from "lucide-react";
import Link from "next/link";
import UserDropdown from "./userDropdown";
import clientconfig from "../../../clientconfig";
import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Header({ pathParts }: { pathParts: string[] }) {
  const session = await auth();
  if (!session) return redirect(`${clientconfig.websiteURL}/login`);

  return (
    <header className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center overflow-hidden">
            <Image
              src={clientconfig.websiteLogo}
              alt={clientconfig.websiteName}
              width={32}
              height={32}
              className="flex-shrink-0 w-8 h-8 mr-3"
            />
            <div className="overflow-hidden">
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold truncate">
                  {clientconfig.websiteName}
                </h1>
              </Link>
              <div className="flex items-center text-xs text-gray-400 overflow-x-auto scrollbar-hide max-w-[50vw] sm:max-w-[60vw] md:max-w-[85vw]">
                {pathParts.map((part, index) => (
                  <Link
                    href={
                      "/dashboard/" + pathParts.slice(0, index + 1).join("/")
                    }
                    key={index}
                    className="flex items-center min-w-fit"
                  >
                    {index > 0 && (
                      <ChevronRight className="w-3 h-3 mx-1 flex-shrink-0" />
                    )}
                    <span className="truncate">{part}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <UserDropdown session={session} />
        </div>
      </div>
    </header>
  );
}
