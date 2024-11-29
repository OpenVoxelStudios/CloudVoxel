'use client';

import { Cloud, ChevronRight } from 'lucide-react'
import Link from 'next/link';
import { Session } from 'next-auth';
import { Suspense } from 'react';
import UserDropdown from './userDropdown';

export default function Header({ pathParts, session }: { pathParts: string[], session: Session }) {
    return (
        <header className="bg-gray-900 text-white p-4 shadow-lg">
            <div className="container mx-auto px-2 sm:px-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center overflow-hidden">
                        <Cloud className="flex-shrink-0 w-8 h-8 mr-3 text-blue-400" />
                        <div className="overflow-hidden">
                            <Link href="/dashboard">
                                <h1 className="text-2xl font-bold truncate">CloudVoxel</h1>
                            </Link>
                            <Suspense>
                                <div className="flex items-center text-xs text-gray-400 overflow-x-auto scrollbar-hide max-w-[50vw] sm:max-w-[60vw] md:max-w-[85vw]">
                                    {pathParts.map((part, index) => (
                                        <Link href={'/dashboard/' + pathParts.slice(0, index + 1).join('/')} key={index} className="flex items-center min-w-fit">
                                            {index > 0 && <ChevronRight className="w-3 h-3 mx-1 flex-shrink-0" />}
                                            <span className="truncate">{part}</span>
                                        </Link>
                                    ))}
                                </div>
                            </Suspense>
                        </div>
                    </div>
                    <UserDropdown session={session} />
                </div>
            </div>
        </header>
    )
}
