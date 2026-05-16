import { AppSidebar } from "@/components/shell/app-sidebar";
import { ChatKitPanel } from "@/components/shell/chatkit-panel";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <AppSidebar />
      <main className="min-w-0 flex-1">{children}</main>
      <ChatKitPanel />
    </div>
  );
}
