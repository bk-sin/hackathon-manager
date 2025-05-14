import { Team } from "@/types/globals";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(cookies());

  // Equipos con status "forming" y que no estén llenos
  const { data: teams, error } = await supabase
    .from("teams")
    .select("*, members:team_members(count)")
    .eq("status", "forming");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Filtra los que no están llenos
  const availableTeams = (teams ?? []).map((team: Team) => ({
    ...team,
    members: Array.isArray(team.members) ? team.members[0]?.count ?? 0 : 0,
  }));

  return NextResponse.json({ teams: availableTeams });
}
