"use client";

import { useState } from "react";
import { testSupabaseConnection } from "@/lib/supabase/test-connection";
import { useProfile } from "@/lib/hooks/use-profile";

export default function DebugPanel() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { profile, authUser, displayName, loading, error, refetch } = useProfile();

  const runTest = async () => {
    const result = await testSupabaseConnection();
    setTestResult(result);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-3 py-2 rounded-lg text-xs z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Profile Loading:</strong> {loading ? "Yes" : "No"}
        </div>
        <div>
          <strong>Display Name:</strong> {displayName}
        </div>
        <div>
          <strong>Auth User:</strong> {authUser ? "✅" : "❌"}
        </div>
        <div>
          <strong>Profile:</strong> {profile ? "✅" : "❌"}
        </div>
        {error && (
          <div className="text-red-600">
            <strong>Error:</strong> {error.message}
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={runTest}
            className="flex-1 bg-purple-600 text-white px-3 py-1 rounded text-xs mt-2"
          >
            Test Supabase
          </button>
          <button
            onClick={async () => {
              console.log("[DebugPanel] Manually refetching profile...");
              await refetch();
            }}
            className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-xs mt-2"
          >
            Refetch Profile
          </button>
        </div>
        
        {testResult && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <div>
              <strong>Status:</strong> {testResult.success ? "✅" : "❌"}
            </div>
            <div>
              <strong>Message:</strong> {testResult.message || testResult.error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}