import Link from "next/link";
import { Logo } from "@/components/common";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-200/80 bg-neutral-50/50 text-neutral-600 mt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 cursor-pointer" aria-label="PDFella Home">
              <Logo size="sm" />
            </Link>
            <p className="text-[11px] text-neutral-500 leading-relaxed max-w-xs">
              Fast, free, and 100% private PDF utilities. Your files stay on your device and are never uploaded to any server.
            </p>
            <div className="pt-1 text-[11px] text-neutral-400">
              &copy; {currentYear} PDFella &bull; 100% Private &bull; Zero Server Uploads
            </div>
          </div>

          {/* PDF Utilities (2 compact columns) */}
          <div className="md:col-span-5 flex flex-col space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">
              PDF Utilities
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-600">
              <Link href="/" className="hover:text-brand-primary transition-colors py-0.5">
                Merge PDF
              </Link>
              <Link href="/compress" className="hover:text-brand-primary transition-colors py-0.5">
                Compress PDF
              </Link>
              <Link href="/split" className="hover:text-brand-primary transition-colors py-0.5">
                Split PDF
              </Link>
              <Link href="/organize" className="hover:text-brand-primary transition-colors py-0.5">
                Organize PDF
              </Link>
              <Link href="/remove" className="hover:text-brand-primary transition-colors py-0.5">
                Remove Pages
              </Link>
              <Link href="/sign" className="hover:text-brand-primary transition-colors py-0.5">
                Sign PDF
              </Link>
              <Link href="/pdf-to-image" className="hover:text-brand-primary transition-colors py-0.5">
                PDF to Image
              </Link>
              <Link href="/image-to-pdf" className="hover:text-brand-primary transition-colors py-0.5">
                Image to PDF
              </Link>
              <Link href="/watermark" className="hover:text-brand-primary transition-colors py-0.5">
                Watermark PDF
              </Link>
              <Link href="/page-numbers" className="hover:text-brand-primary transition-colors py-0.5">
                Page Numbers
              </Link>
            </div>
          </div>

          {/* Resources & Developer */}
          <div className="md:col-span-3 flex flex-col space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">
              Resources
            </span>
            <ul className="flex flex-col space-y-1 text-xs text-neutral-600">
              <li>
                <Link href="/how-to-use" className="hover:text-brand-primary transition-colors py-0.5 inline-block">
                  How to Use
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-primary transition-colors py-0.5 inline-block">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-primary transition-colors py-0.5 inline-block">
                  About PDFella
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-primary transition-colors py-0.5 inline-block">
                  Privacy Policy
                </Link>
              </li>
            </ul>
            <div className="pt-2 text-[11px] text-neutral-400">
              By{" "}
              <a
                href="https://tharidulakmal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-brand-primary underline font-medium"
              >
                Tharidu Lakmal
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
