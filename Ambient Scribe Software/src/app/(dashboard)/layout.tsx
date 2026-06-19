import { SidebarShell } from "@/components/layout/sidebar-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SidebarShell>{children}</SidebarShell>;
}
