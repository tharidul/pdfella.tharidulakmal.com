import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://pdfx.tharidulakmal.com/sitemap.xml",
    host: "https://pdfx.tharidulakmal.com",
  };
}
