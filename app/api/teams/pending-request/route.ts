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

  // Trae los equipos donde el usuario es líder
  const { data: myTeams } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_id", userData.id);

  const myTeamIds = myTeams?.map((t) => t.id) ?? [];

  // Trae las solicitudes pendientes a esos equipos
  const { data: requests, error } = await supabase
    .from("team_join_requests")
    .select(
      "id, team_id, user_id, status, created_at, users:users(clerk_id, id)"
    )
    .in("team_id", myTeamIds)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ requests });
}
