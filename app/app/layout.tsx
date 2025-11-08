"use client";

import TopBar from "@/components/app/TopBar";
import LeftSidebar from "@/components/app/LeftSidebar";
import ChatPanel from "@/components/app/ChatPanel";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <LeftSidebar />
      <main className="ml-[240px] mr-[380px] mt-16 min-h-[calc(100vh-4rem)] max-lg:ml-[60px] max-lg:mr-0 max-md:ml-0 max-md:mr-0">
        {children}
      </main>
      <ChatPanel />
    </div>
  );
}

