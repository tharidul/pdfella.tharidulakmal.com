import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-200 bg-neutral-50/70 text-neutral-600 mt-12 sm:mt-16 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Privacy Statement */}
          <div className="flex flex-col space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/logo-2.webp"
                alt="PDF-X"
                width={130}
                height={38}
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Fast, free, and 100% private client-side PDF utility suite. Your files are processed locally in your browser and are never uploaded to any server.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              100% Client-Side Privacy
            </div>
          </div>

          {/* PDF Tools Navigation */}
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              PDF Utilities
            </span>
            <ul className="flex flex-col space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-neutral-600 hover:text-[#800020] transition-colors"
                >
                  Merge PDFs
                </Link>
              </li>
              <li>
                <Link
                  href="/split"
                  className="text-neutral-600 hover:text-[#800020] transition-colors"
                >
                  Split PDF
                </Link>
              </li>
              <li>
                <Link
                  href="/remove"
                  className="text-neutral-600 hover:text-[#800020] transition-colors"
                >
                  Remove Pages
                </Link>
              </li>
              <li>
                <Link
                  href="/organize"
                  className="text-neutral-600 hover:text-[#800020] transition-colors"
                >
                  Organize & Rotate
                </Link>
              </li>
              <li>
                <Link
                  href="/compress"
                  className="text-neutral-600 hover:text-[#800020] transition-colors"
                >
                  Compress PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem Tools */}
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Ecosystem
            </span>
            <ul className="flex flex-col space-y-2 text-sm">
              <li>
                <a
                  href="https://imgx.tharidulakmal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-[#800020] transition-colors inline-flex items-center gap-1"
                >
                  IMG-X
                  <span className="text-xs text-neutral-400">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://vinci.tharidulakmal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-[#800020] transition-colors inline-flex items-center gap-1"
                >
                  Vinci AI
                  <span className="text-xs text-neutral-400">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://tharidulakmal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-[#800020] transition-colors inline-flex items-center gap-1"
                >
                  Tharidu Lakmal
                  <span className="text-xs text-neutral-400">↗</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Guarantee */}
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Security Guarantee
            </span>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Unlike traditional cloud-based PDF tools, PDF-X executes WebAssembly and PDF engines strictly within your device&apos;s memory. No tracking cookies, no server logs, and no subscriptions.
            </p>
            <span className="text-xs font-medium text-neutral-700">
              ✓ Works Offline &bull; No Uploads
            </span>
          </div>
        </div>

        {/* Subfooter */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4 text-center sm:text-left">
          <p>
            &copy; {currentYear} PDF-X. Crafted by{" "}
            <a
              href="https://tharidulakmal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-[#800020] underline font-medium"
            >
              Tharidu Lakmal
            </a>
            .
          </p>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-neutral-400">100% Client-Side Engine</span>
            <span>&bull;</span>
            <span className="text-neutral-400">Zero Server Storage</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
