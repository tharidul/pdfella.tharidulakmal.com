interface PdfToolLayoutProps {
  hasFile: boolean;
  heading: string;
  subheading: string;
  children: React.ReactNode;
}

export function PdfToolLayout({
  hasFile,
  heading,
  subheading,
  children,
}: PdfToolLayoutProps) {
  return (
    <main
      className={
        hasFile
          ? "w-full max-w-6xl mx-auto px-4 py-6 flex flex-col"
          : "w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col"
      }
    >
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          {heading}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          {subheading}
        </p>
      </div>

      {children}
    </main>
  );
}
