import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Types for the request payload
interface SuggestionField {
  Pain?: string;
  Solution?: string;
  "Ideal Customer Profile"?: string;
  "Business Model/Pricing"?: string;
  "Go-to-Market Plan"?: string;
  "Current Solutions"?: string;
  "10x Better Opportunity"?: string;
  "Feature List"?: {
    Core?: string[];
    Base?: string[];
  };
}

interface Suggestion {
  title: string;
  summary?: string;
  tags?: string[];
  fields: SuggestionField;
}

interface SaveSessionRequest {
  intro: string;
  problemTags: string[];
  suggestions: Suggestion[];
  conversationHistory: { role: string; content: string }[];
}

export async function POST(req: Request) {
  try {
    const body: SaveSessionRequest = await req.json();
    const { intro, problemTags, suggestions, conversationHistory } = body;

    if (!intro || !suggestions || suggestions.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: intro and suggestions" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the current user (could be anonymous or permanent)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 1. Create the discovery session with user_id
    const { data: session, error: sessionError } = await supabase
      .from("discovery_sessions")
      .insert({
        user_id: user.id,
        intro_summary: intro,
        conversation_history: conversationHistory || [],
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      console.error("Error creating session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    const sessionId = session.id;

    // 2. Upsert problem tags and link to session
    if (problemTags && problemTags.length > 0) {
      for (const tagName of problemTags) {
        // Use the upsert_tag function
        const { data: tagId, error: tagError } = await supabase.rpc(
          "upsert_tag",
          { tag_name: tagName, tag_type_param: "problem" }
        );

        if (tagError) {
          console.error("Error upserting tag:", tagError);
          continue;
        }

        // Link tag to session
        await supabase.from("session_tags").insert({
          session_id: sessionId,
          tag_id: tagId,
        });
      }
    }

    // 3. Insert all 3 solutions
    const solutionIds: string[] = [];

    for (let i = 0; i < suggestions.length; i++) {
      const suggestion = suggestions[i];
      const fields = suggestion.fields;
      const featureList = fields["Feature List"];

      const { data: solution, error: solutionError } = await supabase
        .from("solutions")
        .insert({
          session_id: sessionId,
          position: i + 1,
          title: suggestion.title,
          summary: suggestion.summary || null,
          pain: fields.Pain || null,
          solution_description: fields.Solution || null,
          ideal_customer_profile: fields["Ideal Customer Profile"] || null,
          business_model_pricing: fields["Business Model/Pricing"] || null,
          go_to_market_plan: fields["Go-to-Market Plan"] || null,
          current_solutions: fields["Current Solutions"] || null,
          ten_x_opportunity: fields["10x Better Opportunity"] || null,
          features_core: featureList?.Core || [],
          features_base: featureList?.Base || [],
        })
        .select("id")
        .single();

      if (solutionError || !solution) {
        console.error("Error creating solution:", solutionError);
        continue;
      }

      solutionIds.push(solution.id);

      // 4. Upsert solution tags and link to solution
      if (suggestion.tags && suggestion.tags.length > 0) {
        for (const tagName of suggestion.tags) {
          const { data: tagId, error: tagError } = await supabase.rpc(
            "upsert_tag",
            { tag_name: tagName, tag_type_param: "solution" }
          );

          if (tagError) {
            console.error("Error upserting solution tag:", tagError);
            continue;
          }

          await supabase.from("solution_tags").insert({
            solution_id: solution.id,
            tag_id: tagId,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      solutionIds,
    });
  } catch (error) {
    console.error("Error in save session:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve sessions with optional tag search
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const limit = parseInt(searchParams.get("limit") || "20");

    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (tag) {
      // Search by tag using the helper function with user scope
      const { data, error } = await supabase.rpc("search_sessions_by_tag", {
        search_tag: tag,
        target_user_id: user.id,
      });

      if (error) {
        console.error("Error searching sessions:", error);
        return NextResponse.json(
          { error: "Failed to search sessions" },
          { status: 500 }
        );
      }

      return NextResponse.json({ sessions: data });
    }

    // Get recent sessions with their solutions
    const { data: sessions, error } = await supabase
      .from("discovery_sessions")
      .select(
        `
        id,
        intro_summary,
        created_at,
        solutions (
          id,
          position,
          title,
          summary,
          is_selected
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error in get sessions:", error);
    return NextResponse.json(
      { error: "Failed to get sessions" },
      { status: 500 }
    );
  }
}
