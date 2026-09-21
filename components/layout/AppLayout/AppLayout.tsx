"use client";

import { MobileNavProvider } from "../MobileNavContext";
import { Sidebar } from "../Sidebar";
import { Header } from "../Header";
import type { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <MobileNavProvider>
      <div className="flex min-h-screen w-full bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </MobileNavProvider>
  );
}
