"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  nickname: string | null;
  persona_text: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isFetchingRef = useRef(false);

  const fetchProfile = useCallback(async (sessionUser?: any) => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log("[fetchProfile] Already fetching, skipping...");
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      const supabase = createClient();

      console.log("[fetchProfile] Starting profile fetch...", {
        hasSessionUser: !!sessionUser,
      });

      // Use sessionUser if provided, otherwise try to get user
      let user = sessionUser;

      if (!user) {
        const {
          data: { user: fetchedUser },
          error: userError,
        } = await supabase.auth.getUser();

        console.log("[fetchProfile] getUser result:", {
          hasUser: !!fetchedUser,
          userId: fetchedUser?.id,
          error: userError?.message,
        });

        if (userError) {
          console.error("[fetchProfile] Error getting user:", userError);
          setAuthUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        user = fetchedUser;
      }

      if (!user) {
        console.log("[fetchProfile] No user found - not authenticated");
        setAuthUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Debug: Log what we're getting from auth
      console.log("Auth User:", {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        raw_user_meta_data: (user as any).raw_user_meta_data,
        app_metadata: user.app_metadata,
      });

      setAuthUser(user);

      // Try to get existing profile
      console.log(
        "[fetchProfile] Fetching profile from database for user:",
        user.id
      );

      // Simple query without timeout - Supabase handles timeouts internally
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("[fetchProfile] Profile query result:", {
        hasData: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message,
        profileId: data?.id,
        profileNickname: data?.nickname,
        fullError: error,
      });

      // If profile doesn't exist, create it
      if (error && error.code === "PGRST116") {
        console.log(
          "[fetchProfile] Profile not found (PGRST116), creating new profile"
        );
        // Get name from multiple possible sources
        const rawMeta = (user as any).raw_user_meta_data;
        const nickname =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          rawMeta?.full_name ||
          rawMeta?.name ||
          (rawMeta?.given_name && rawMeta?.family_name
            ? `${rawMeta.given_name} ${rawMeta.family_name}`
            : null) ||
          rawMeta?.given_name ||
          user.email?.split("@")[0] ||
          "User";

        console.log("Creating profile with nickname:", nickname);

        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            nickname,
            persona_text: null,
            avatar_url:
              user.user_metadata?.avatar_url || rawMeta?.avatar_url || null,
          })
          .select()
          .single();

        if (createError) {
          console.error("[fetchProfile] Error creating profile:", createError);
          throw createError;
        }
        console.log("[fetchProfile] Profile created successfully:", newProfile);
        data = newProfile;
      } else if (error) {
        console.error("[fetchProfile] Error fetching profile:", error);
        throw error;
      }

      // If profile exists but nickname is null/empty, update it with auth user data
      if (data && (!data.nickname || data.nickname === "User")) {
        const rawMeta = (user as any).raw_user_meta_data;
        const nickname =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          rawMeta?.full_name ||
          rawMeta?.name ||
          (rawMeta?.given_name && rawMeta?.family_name
            ? `${rawMeta.given_name} ${rawMeta.family_name}`
            : null) ||
          rawMeta?.given_name ||
          user.email?.split("@")[0] ||
          null;

        if (nickname && nickname !== "User") {
          console.log("Updating profile nickname from null/User to:", nickname);
          const { data: updatedProfile, error: updateError } = await supabase
            .from("profiles")
            .update({ nickname, updated_at: new Date().toISOString() })
            .eq("id", user.id)
            .select()
            .single();

          if (!updateError && updatedProfile) {
            data = updatedProfile;
          }
        }
      }

      if (data) {
        console.log("[fetchProfile] Setting profile state:", {
          id: data.id,
          nickname: data.nickname,
          hasNickname: !!data.nickname,
        });
        setProfile(data);
        console.log("[useProfile] ✅ Profile loaded successfully:", {
          id: data.id,
          nickname: data.nickname,
          hasNickname: !!data.nickname,
        });
      } else {
        console.warn(
          "[fetchProfile] ⚠️ No profile data to set! data is null/undefined"
        );
        setProfile(null);
      }
    } catch (err) {
      console.error("[fetchProfile] ❌ Error in fetchProfile:", err);
      setError(err as Error);
      setProfile(null);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      console.log(
        "[fetchProfile] fetchProfile completed, loading set to false"
      );
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Listen for auth changes FIRST - this will fire with current session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("[useProfile] Auth state changed:", event, {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
      });

      if (session?.user) {
        console.log(
          "[useProfile] Session found, fetching profile with session user"
        );
        // Pass the user from session directly to avoid getUser() call
        await fetchProfile(session.user);
      } else if (event === "SIGNED_OUT") {
        console.log("[useProfile] User signed out");
        setProfile(null);
        setAuthUser(null);
        setLoading(false);
      }
    });

    // Also try to fetch immediately (in case onAuthStateChange doesn't fire)
    fetchProfile().catch((err) => {
      console.error("[useProfile] Initial fetchProfile error:", err);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  // Get display name with fallbacks - PRIORITIZE profile nickname from database
  // Memoize so it updates when authUser or profile changes
  const displayName = useMemo(() => {
    console.log("[getDisplayName] Computing displayName", {
      hasAuthUser: !!authUser,
      hasProfile: !!profile,
      profileNickname: profile?.nickname,
      authUserEmail: authUser?.email,
    });

    // PRIORITY 1: Profile nickname from database (user's explicit choice)
    if (
      profile?.nickname &&
      profile.nickname.trim() !== "" &&
      profile.nickname !== "User" &&
      profile.nickname !== "there"
    ) {
      console.log(
        "[getDisplayName] ✅ Using profile.nickname:",
        profile.nickname
      );
      return profile.nickname;
    }

    if (!authUser) {
      console.log("[getDisplayName] No authUser, returning 'there'");
      return "there";
    }

    // PRIORITY 2: Check user_metadata (standard Supabase location)
    if (authUser.user_metadata?.full_name) {
      console.log(
        "[getDisplayName] Found user_metadata.full_name:",
        authUser.user_metadata.full_name
      );
      return authUser.user_metadata.full_name;
    }
    if (authUser.user_metadata?.name) {
      console.log(
        "[getDisplayName] Found user_metadata.name:",
        authUser.user_metadata.name
      );
      return authUser.user_metadata.name;
    }

    // PRIORITY 3: Check raw_user_meta_data (sometimes Google data is here)
    const rawMeta = (authUser as any).raw_user_meta_data;
    if (rawMeta?.full_name) {
      console.log(
        "[getDisplayName] Found raw_user_meta_data.full_name:",
        rawMeta.full_name
      );
      return rawMeta.full_name;
    }
    if (rawMeta?.name) {
      console.log(
        "[getDisplayName] Found raw_user_meta_data.name:",
        rawMeta.name
      );
      return rawMeta.name;
    }
    if (rawMeta?.given_name && rawMeta?.family_name) {
      const fullName = `${rawMeta.given_name} ${rawMeta.family_name}`;
      console.log(
        "[getDisplayName] Found raw_user_meta_data given_name + family_name:",
        fullName
      );
      return fullName;
    }
    if (rawMeta?.given_name) {
      console.log(
        "[getDisplayName] Found raw_user_meta_data.given_name:",
        rawMeta.given_name
      );
      return rawMeta.given_name;
    }

    // Use email as fallback
    if (authUser.email) {
      const emailName = authUser.email.split("@")[0];
      console.log("[getDisplayName] Using email username:", emailName);
      return emailName;
    }

    // Final fallbacks
    if (authUser.id) {
      const idName = authUser.id.substring(0, 8);
      console.log("[getDisplayName] Using user ID substring:", idName);
      return idName;
    }

    console.warn("[getDisplayName] All fallbacks exhausted, returning 'there'");
    return "there";
  }, [authUser, profile]);

  return {
    profile,
    authUser,
    displayName,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}
