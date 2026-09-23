import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://pdfella.tharidulakmal.com/sitemap.xml",
    host: "https://pdfella.tharidulakmal.com",
  };
}
