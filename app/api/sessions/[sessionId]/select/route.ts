import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface SelectSolutionRequest {
  solutionPosition: number; // 1, 2, or 3
  prdContent?: string;
  landingPageContent?: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body: SelectSolutionRequest = await req.json();
    const { solutionPosition, prdContent, landingPageContent } = body;

    if (!solutionPosition || solutionPosition < 1 || solutionPosition > 3) {
      return NextResponse.json(
        { error: "Invalid solution position. Must be 1, 2, or 3" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Get the solution by session and position
    const { data: solution, error: fetchError } = await supabase
      .from("solutions")
      .select("id")
      .eq("session_id", sessionId)
      .eq("position", solutionPosition)
      .single();

    if (fetchError || !solution) {
      console.error("Error fetching solution:", fetchError);
      return NextResponse.json(
        { error: "Solution not found" },
        { status: 404 }
      );
    }

    // 2. Mark this solution as selected (and unselect others in the session)
    // First, unselect all solutions in this session
    await supabase
      .from("solutions")
      .update({ is_selected: false, selected_at: null })
      .eq("session_id", sessionId);

    // Then select the chosen one
    const { error: updateError } = await supabase
      .from("solutions")
      .update({
        is_selected: true,
        selected_at: new Date().toISOString(),
      })
      .eq("id", solution.id);

    if (updateError) {
      console.error("Error updating solution:", updateError);
      return NextResponse.json(
        { error: "Failed to select solution" },
        { status: 500 }
      );
    }

    // 3. Save generated documents if provided
    if (prdContent) {
      await supabase.from("generated_documents").upsert(
        {
          solution_id: solution.id,
          doc_type: "prd",
          content: prdContent,
        },
        { onConflict: "solution_id,doc_type" }
      );
    }

    if (landingPageContent) {
      await supabase.from("generated_documents").upsert(
        {
          solution_id: solution.id,
          doc_type: "landing_page",
          content: landingPageContent,
        },
        { onConflict: "solution_id,doc_type" }
      );
    }

    return NextResponse.json({
      success: true,
      solutionId: solution.id,
      documentsStored: {
        prd: !!prdContent,
        landingPage: !!landingPageContent,
      },
    });
  } catch (error) {
    console.error("Error in select solution:", error);
    return NextResponse.json(
      { error: "Failed to select solution" },
      { status: 500 }
    );
  }
}
