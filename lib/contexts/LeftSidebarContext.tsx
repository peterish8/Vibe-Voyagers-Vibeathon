"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LeftSidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const LeftSidebarContext = createContext<LeftSidebarContextType | undefined>(
  undefined
);

export function LeftSidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leftSidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const handleSetCollapsed = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('leftSidebarCollapsed', JSON.stringify(newCollapsed));
    }
  };

  return (
    <LeftSidebarContext.Provider value={{ collapsed, setCollapsed: handleSetCollapsed }}>
      {children}
    </LeftSidebarContext.Provider>
  );
}

export function useLeftSidebar() {
  const context = useContext(LeftSidebarContext);
  if (context === undefined) {
    throw new Error("useLeftSidebar must be used within a LeftSidebarProvider");
  }
  return context;
}

