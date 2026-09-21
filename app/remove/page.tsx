import type { Metadata } from "next";
import { Sidebar, Header } from "@/components/layout";
import { RemovePagesView } from "@/components/features";

export const metadata: Metadata = {
  title: "Remove Pages - Delete Unwanted PDF Pages | PDF-X",
  description: "Delete unwanted or sensitive pages from your PDF file. 100% private and processed locally in your browser.",
};

export default function RemovePage() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <RemovePagesView />
        </div>
      </div>
    </div>
  );
}
