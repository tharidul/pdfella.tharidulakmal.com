import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-200 bg-neutral-50/70 text-neutral-600 mt-12 sm:mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 cursor-pointer">
              <Image
                src="/logo-2.webp"
                alt="PDF-X"
                width={120}
                height={34}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Fast, free, and private client-side PDF utilities. Documents are processed locally in your browser and never uploaded to any server.
            </p>
          </div>

          {/* PDF Tools */}
          <div className="flex flex-col space-y-2.5">
            <span className="text-xs font-semibold text-neutral-900">
              PDF Utilities
            </span>
            <ul className="flex flex-col space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/" className="hover:text-brand-primary transition-colors cursor-pointer">
                  Merge PDFs
                </Link>
              </li>
              <li>
                <Link href="/split" className="hover:text-brand-primary transition-colors cursor-pointer">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/remove" className="hover:text-brand-primary transition-colors cursor-pointer">
                  Remove Pages
                </Link>
              </li>
              <li>
                <Link href="/organize" className="hover:text-brand-primary transition-colors cursor-pointer">
                  Organize & Rotate
                </Link>
              </li>
              <li>
                <Link href="/compress" className="hover:text-brand-primary transition-colors cursor-pointer">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link href="/image-to-pdf" className="hover:text-brand-primary transition-colors cursor-pointer">
                  Images to PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-to-image" className="hover:text-brand-primary transition-colors cursor-pointer">
                  PDF to Images
                </Link>
              </li>
              <li>
                <Link href="/page-numbers" className="hover:text-brand-primary transition-colors cursor-pointer">
                  Page Numbers
                </Link>
              </li>
              <li>
                <Link href="/watermark" className="hover:text-brand-primary transition-colors cursor-pointer">
                  Watermark PDF
                </Link>
              </li>
              <li>
                <Link href="/sign" className="hover:text-brand-primary transition-colors cursor-pointer">
                  Sign PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col space-y-2.5">
            <span className="text-xs font-semibold text-neutral-900">
              Resources
            </span>
            <ul className="flex flex-col space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/how-to-use" className="hover:text-brand-primary transition-colors cursor-pointer">
                  How to Use
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-primary transition-colors cursor-pointer">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-primary transition-colors cursor-pointer">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-primary transition-colors cursor-pointer">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer */}
          <div className="flex flex-col space-y-2.5">
            <span className="text-xs font-semibold text-neutral-900">
              Developer
            </span>
            <ul className="flex flex-col space-y-2 text-sm text-neutral-600">
              <li>
                <a
                  href="https://tharidulakmal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-primary transition-colors cursor-pointer"
                >
                  Tharidu Lakmal
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Subfooter */}
        <div className="mt-8 pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>
            &copy; {currentYear} PDF-X. By{" "}
            <a
              href="https://tharidulakmal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-700 hover:text-brand-primary underline font-medium cursor-pointer"
            >
              Tharidu Lakmal
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
