import type { Metadata } from "next";
import { Sidebar, Header } from "@/components/layout";
import { CompressPdfView } from "@/components/features";

export const metadata: Metadata = {
  title: "Compress PDF - Reduce File Size | PDF-X",
  description: "Reduce PDF file size while preserving visual quality. 100% private, client-side compression.",
};

export default function CompressPage() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <CompressPdfView />
        </div>
      </div>
    </div>
  );
}
