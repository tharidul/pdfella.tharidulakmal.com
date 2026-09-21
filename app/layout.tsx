import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF-X - Combine multiple PDFs into one | Free. Fast. 100% Private.",
  description: "Merge multiple PDF files into a single document directly in your browser. 100% private and client-side processing.",
  icons: {
    icon: "/logo.webp",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-neutral-900">{children}</body>
    </html>
  );
}
