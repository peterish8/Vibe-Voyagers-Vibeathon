"use client";

import { createClient } from "@/lib/supabase/client";

export async function ensureUserProfile() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          nickname: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
          persona_text: null,
          avatar_url: user.user_metadata?.avatar_url || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        return null;
      }
      
      return newProfile;
    }

    return existingProfile;
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    return null;
  }
}