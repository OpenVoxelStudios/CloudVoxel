import type { Metadata } from "next";
import clientconfig from "@/../clientconfig";
import _RootLayout from "../dashboard/layout";

export const metadata: Metadata = {
  title: `Error - ${clientconfig.websiteName}`,
  description: clientconfig.websiteDescription,
  appleWebApp: {
    title: clientconfig.websiteName,
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <_RootLayout>{children}</_RootLayout>;
}
