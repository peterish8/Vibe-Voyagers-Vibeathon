"use client";

import { createClient } from "./client";

export async function testSupabaseConnection() {
  try {
    const supabase = createClient();
    
    // Test 1: Check if we can connect to Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Auth error:", authError);
      return { success: false, error: "Authentication failed", details: authError };
    }

    // Test 2: Check if we can query the profiles table
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (profileError) {
      console.error("Profile query error:", profileError);
      return { success: false, error: "Database query failed", details: profileError };
    }

    // Test 3: Check if user has a profile (if authenticated)
    if (user) {
      const { data: userProfile, error: userProfileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userProfileError && userProfileError.code !== 'PGRST116') {
        console.error("User profile error:", userProfileError);
        return { success: false, error: "User profile query failed", details: userProfileError };
      }

      return {
        success: true,
        user: user,
        profile: userProfile,
        message: "Supabase connection successful"
      };
    }

    return {
      success: true,
      user: null,
      profile: null,
      message: "Supabase connection successful (not authenticated)"
    };

  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return { success: false, error: "Connection test failed", details: error };
  }
}