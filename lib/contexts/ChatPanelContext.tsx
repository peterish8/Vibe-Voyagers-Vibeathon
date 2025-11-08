"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatPanelContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ChatPanelContext = createContext<ChatPanelContextType | undefined>(
  undefined
);

export function ChatPanelProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true); // Start collapsed by default

  return (
    <ChatPanelContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </ChatPanelContext.Provider>
  );
}

export function useChatPanel() {
  const context = useContext(ChatPanelContext);
  if (context === undefined) {
    throw new Error("useChatPanel must be used within a ChatPanelProvider");
  }
  return context;
}

