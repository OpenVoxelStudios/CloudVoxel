import type { Metadata } from "next";
import clientconfig from "@/../clientconfig";

export const metadata: Metadata = {
  title: `API Documentation - ${clientconfig.websiteName}`,
  description: clientconfig.websiteDescription,
  appleWebApp: {
    title: clientconfig.websiteName,
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
