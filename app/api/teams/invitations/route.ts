import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  const supabase = createClient(cookies());

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Busca el usuario en Supabase por clerk_id
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", user.id)
    .single();

  if (!userData)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Trae las invitaciones pendientes
  const { data: invitations, error } = await supabase
    .from("team_invitations")
    .select("id, team_id, invited_by_user_id, status, created_at")
    .eq("invited_user_id", userData.id)
    .eq("status", "pending");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ invitations });
}
