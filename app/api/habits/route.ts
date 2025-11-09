import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch habits
    const { data: habits, error: habitsError } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (habitsError) throw habitsError;

    // Fetch habit logs
    const { data: logs, error: logsError } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false });

    if (logsError) throw logsError;

    return NextResponse.json({
      habits: habits || [],
      logs: logs || [],
      success: true,
    });
  } catch (error: any) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch habits" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, is_active = true, target_days_per_week = 7 } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Habit name is required" },
        { status: 400 }
      );
    }

    // Ensure profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Create profile if it doesn't exist
      await supabase.from("profiles").insert({
        id: user.id,
        nickname: user.email?.split("@")[0] || "User"
      });
    }

    // Create habit
    const { data: habit, error: habitError } = await supabase
      .from("habits")
      .insert({
        user_id: user.id,
        name: name.trim(),
        is_active,
        target_days_per_week: Math.min(Math.max(1, target_days_per_week), 7),
      })
      .select()
      .single();

    if (habitError) {
      console.error("Habit creation error:", habitError);
      return NextResponse.json(
        { error: habitError.message || "Failed to create habit" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      habit,
      success: true,
    });
  } catch (error: any) {
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create habit" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Habit ID is required" }, { status: 400 });
    }

    const { data: habit, error: habitError } = await supabase
      .from("habits")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (habitError) {
      return NextResponse.json(
        { error: habitError.message || "Failed to update habit" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      habit,
      success: true,
    });
  } catch (error: any) {
    console.error("Error updating habit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update habit" },
      { status: 500 }
    );
  }
}

