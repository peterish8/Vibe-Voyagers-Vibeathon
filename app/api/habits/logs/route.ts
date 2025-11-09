import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
    const { habit_id, log_date, completed } = body;

    if (!habit_id || !log_date) {
      return NextResponse.json(
        { error: "Habit ID and log date are required" },
        { status: 400 }
      );
    }

    // Upsert habit log
    const { data: log, error: logError } = await supabase
      .from("habit_logs")
      .upsert(
        {
          user_id: user.id,
          habit_id,
          log_date,
          completed: completed !== undefined ? completed : true,
        },
        {
          onConflict: "user_id,habit_id,log_date",
        }
      )
      .select()
      .single();

    if (logError) {
      console.error("Habit log error:", logError);
      return NextResponse.json(
        { error: logError.message || "Failed to update habit log" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      log,
      success: true,
    });
  } catch (error: any) {
    console.error("Error updating habit log:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update habit log" },
      { status: 500 }
    );
  }
}

