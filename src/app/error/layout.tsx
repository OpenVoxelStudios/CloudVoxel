import type { Metadata } from "next";
import clientconfig from "@/../clientconfig";
import _RootLayout from '../dashboard/layout';

export const metadata: Metadata = {
    title: `Error - ${clientconfig.websiteName}`,
    description: clientconfig.websiteDescription,
    icons: {
        other: { url: '/images/icon.png' },
        icon: '/images/favicon.ico',
        apple: '/images/apple-icon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <_RootLayout>
            {children}
        </_RootLayout>
    );
}
