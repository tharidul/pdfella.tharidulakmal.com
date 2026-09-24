import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#800020",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pdfella.tharidulakmal.com"),
  title: {
    default: "PDFella: Free, Fast & 100% Private PDF Tools",
    template: "%s | PDFella",
  },
  description:
    "Your files never leave your device. Merge, split, remove pages, organize, and compress PDF documents with zero server uploads, complete privacy, and unlimited free access.",
  applicationName: "PDFella",
  authors: [{ name: "Tharidu Lakmal", url: "https://tharidulakmal.com" }],
  creator: "Tharidu Lakmal",
  publisher: "Tharidu Lakmal",
  keywords: [
    "sign pdf online free",
    "fill and sign pdf",
    "electronic signature online",
    "draw signature online",
    "transparent signature generator",
    "merge pdf",
    "combine pdf files",
    "split pdf",
    "extract pdf pages",
    "remove pdf pages",
    "delete pdf pages",
    "organize pdf",
    "reorder pdf pages",
    "rotate pdf",
    "compress pdf",
    "reduce pdf size",
    "pdf to jpg",
    "jpg to pdf",
    "watermark pdf",
    "add page numbers to pdf",
    "private pdf editor",
    "no upload pdf tools",
    "no upload pdf merger",
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfella.tharidulakmal.com",
    siteName: "PDFella",
    title: "PDFella: Free & 100% Private PDF Tools",
    description:
      "Your files never leave your device. Merge, split, remove pages, organize, and compress PDF documents with zero server uploads, complete privacy, and no file limits.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1734,
        height: 907,
        alt: "PDFella: Free, Fast & 100% Private PDF Tools (No File Uploads)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFella: Free & 100% Private PDF Tools",
    description:
      "Your files never leave your device. Merge, split, remove pages, organize, and compress PDF documents with zero server uploads.",
    creator: "@tharidulakmal",
    images: [
      {
        url: "/og-image.jpg",
        width: 1734,
        height: 907,
        alt: "PDFella: Free, Fast & 100% Private PDF Tools (No File Uploads)",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.webp", type: "image/webp" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/logo.webp", sizes: "180x180", type: "image/webp" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
