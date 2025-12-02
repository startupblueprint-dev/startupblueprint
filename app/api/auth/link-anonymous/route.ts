import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/link-anonymous
 * 
 * Reassigns all discovery sessions from an anonymous user to the newly logged-in user.
 * Called after an anonymous user logs into an existing account.
 */
export async function POST(req: Request) {
  try {
    const { anonymousUserId } = await req.json();

    if (!anonymousUserId) {
      return NextResponse.json(
        { error: "Missing anonymousUserId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Don't reassign if the user is still anonymous
    if (user.is_anonymous) {
      return NextResponse.json(
        { error: "Cannot reassign to anonymous user" },
        { status: 400 }
      );
    }

    // Reassign all discovery sessions from anonymous user to current user
    // Using service role would be ideal here, but we'll use RPC for security
    const { error: updateError } = await supabase.rpc("reassign_anonymous_sessions", {
      old_user_id: anonymousUserId,
      new_user_id: user.id,
    });

    if (updateError) {
      console.error("Error reassigning sessions:", updateError);
      return NextResponse.json(
        { error: "Failed to reassign sessions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in link-anonymous:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
