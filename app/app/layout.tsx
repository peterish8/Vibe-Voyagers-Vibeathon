"use client";

import TopBar from "@/components/app/TopBar";
import LeftSidebar from "@/components/app/LeftSidebar";
import ChatPanel from "@/components/app/ChatPanel";
import { ChatPanelProvider, useChatPanel } from "@/lib/contexts/ChatPanelContext";

function AppLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collapsed } = useChatPanel();

  return (
    <div className="min-h-screen">
      <TopBar />
      <LeftSidebar />
      <main 
        className={`mt-16 min-h-[calc(100vh-4rem)] transition-all duration-300 ease-out
          ml-[240px] 
          ${collapsed ? 'mr-[60px]' : 'mr-[380px]'}
          max-lg:ml-[60px] 
          max-lg:mr-0 
          max-md:ml-0 
          max-md:mr-0`}
      >
        {children}
      </main>
      <ChatPanel />
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatPanelProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </ChatPanelProvider>
  );
}

