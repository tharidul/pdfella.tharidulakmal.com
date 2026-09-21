import { SunIcon } from "@/components/common/icons";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full h-16 flex items-center justify-end px-8 gap-6 border-b border-neutral-100 bg-white">
      <nav className="flex items-center gap-6">
        <Link
          href="#img-x"
          className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          IMG-X
        </Link>
        <Link
          href="#vinci-ai"
          className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          Vinci AI
        </Link>
        <Link
          href="#about"
          className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          About
        </Link>
      </nav>

      <button
        type="button"
        aria-label="Toggle theme"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
      >
        <SunIcon className="w-5 h-5" />
      </button>
    </header>
  );
}
