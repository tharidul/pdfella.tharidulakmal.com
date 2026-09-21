import { Sidebar, Header } from "@/components/layout";
import { MergePdfView } from "@/components/features";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <MergePdfView />
        </div>
      </div>
    </div>
  );
}
