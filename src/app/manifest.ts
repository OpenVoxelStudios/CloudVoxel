import type { MetadataRoute } from "next";
import clientconfig from "../../clientconfig";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: clientconfig.websiteName,
    short_name: clientconfig.websiteName,
    description: clientconfig.websiteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    orientation: "any",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
