import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PDFella — Fast, Free & 100% Private PDF Utilities",
    short_name: "PDFella",
    description:
      "Merge, split, remove pages, organize, and compress PDF files 100% locally in your browser. Zero server uploads, total document privacy.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#800020",
    icons: [
      {
        src: "/logo.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "/logo.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "maskable",
      },
    ],
  };
}
