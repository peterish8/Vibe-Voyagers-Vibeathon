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
    const { entry_date, content_text, mood, tags } = body;

    // Ensure profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      await supabase.from("profiles").insert({
        id: user.id,
        nickname: user.email?.split("@")[0] || "User"
      });
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .upsert(
        {
          user_id: user.id,
          entry_date,
          content_text,
          mood,
          tags: tags || [],
        },
        {
          onConflict: "user_id,entry_date",
        }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    console.error("Error saving journal entry:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save journal entry" },
      { status: 500 }
    );
  }
}