import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PDF-X — Fast, Free & 100% Private PDF Utilities",
    short_name: "PDF-X",
    description:
      "Merge, split, remove pages, organize, and compress PDF files 100% locally in your browser. Zero server uploads, total document privacy.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#800020",
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
