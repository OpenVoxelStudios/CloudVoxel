import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";
import clientconfig from "@/../clientconfig";

const geistSans = Geist({
  weight: ['100', '900'],
  style: ['normal'],
  subsets: ['latin'],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  weight: ['100', '900'],
  style: ['normal'],
  subsets: ['latin'],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: clientconfig.websiteName,
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 dark`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
