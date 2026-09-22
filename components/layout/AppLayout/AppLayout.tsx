"use client";

import { MobileNavProvider } from "../MobileNavContext";
import { Sidebar } from "../Sidebar";
import { Header } from "../Header";
import { Footer } from "../Footer";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function AppLayout({ children, showFooter = true }: AppLayoutProps) {
  return (
    <MobileNavProvider>
      <div className="flex min-h-screen w-full bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <div className="flex-1 overflow-y-auto flex flex-col justify-between">
            <div className="flex-1 flex flex-col">{children}</div>
            {showFooter && <Footer />}
          </div>
        </div>
      </div>
    </MobileNavProvider>
  );
}
