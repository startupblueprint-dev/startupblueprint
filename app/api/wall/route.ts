import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET endpoint to retrieve all discovery sessions for the wall (public view)
export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Fetch all sessions with their tags and solutions
    const { data: sessions, error: sessionsError } = await supabase
      .from("discovery_sessions")
      .select(
        `
        id,
        intro_summary,
        created_at,
        session_tags (
          tag_id,
          tags (
            id,
            name,
            tag_type
          )
        ),
        solutions (
          id,
          position,
          title,
          summary,
          is_selected,
          pain,
          solution_description,
          ideal_customer_profile,
          business_model_pricing,
          tam_sam_som,
          go_to_market_plan,
          current_solutions,
          ten_x_opportunity,
          features_core,
          features_base
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(1000);

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    // Transform the data to flatten tags
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedSessions = sessions?.map((session: any) => ({
      ...session,
      tags: session.session_tags
        ?.map((st: { tags: { id: string; name: string; tag_type: string } | null }) => st.tags)
        .filter(Boolean) || [],
      session_tags: undefined,
    }));

    return NextResponse.json({ sessions: transformedSessions });
  } catch (error) {
    console.error("Error in get wall sessions:", error);
    return NextResponse.json(
      { error: "Failed to get sessions" },
      { status: 500 }
    );
  }
}
