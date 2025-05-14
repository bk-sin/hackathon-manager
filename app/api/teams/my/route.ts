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

  // Trae los equipos donde el usuario es miembro, con evento y cuenta de miembros
  const { data: teams, error } = await supabase
    .from("team_members")
    .select("team_id, teams(*, event:events(*), members:team_members(count))")
    .eq("user_id", userData.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Mapea para agregar el count de miembros como "members"
  const teamsWithMembers =
    teams?.map((tm) => {
      const team = Array.isArray(tm.teams) ? tm.teams[0] : tm.teams;
      const membersCount = team?.members?.[0]?.count ?? 0;
      return {
        ...team,
        event: team?.event,
        members: membersCount,
        leader_id: team?.leader_id,
        isLeader: team?.leader_id === userData.id,
      };
    }) ?? [];

  return NextResponse.json({ teams: teamsWithMembers });
}
