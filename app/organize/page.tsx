import type { Metadata } from "next";
import { Sidebar, Header } from "@/components/layout";
import { OrganizePdfView } from "@/components/features";

export const metadata: Metadata = {
  title: "Organize PDF - Reorder, Rotate & Manage Pages | PDF-X",
  description: "Reorder pages, rotate orientations, and manage PDF pages securely in your browser.",
};

export default function OrganizePage() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <OrganizePdfView />
        </div>
      </div>
    </div>
  );
}
