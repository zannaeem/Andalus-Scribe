"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={cn(
          "flex-1 min-h-screen overflow-auto transition-[margin] duration-300",
          collapsed ? "ml-[52px]" : "ml-[240px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}
