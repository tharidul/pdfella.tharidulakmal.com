import type { Metadata } from "next";
import { Sidebar, Header } from "@/components/layout";
import { SplitPdfView } from "@/components/features";

export const metadata: Metadata = {
  title: "Split PDF - Extract Pages & Ranges | PDF-X",
  description: "Extract specific pages or custom page ranges from your PDF document. 100% private and client-side.",
};

export default function SplitPage() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <SplitPdfView />
        </div>
      </div>
    </div>
  );
}
