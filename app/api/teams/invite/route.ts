import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  const supabase = createClient(cookies());

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { team_id, user_id_to_add } = await req.json();

  // Busca el usuario actual en Supabase
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", user.id)
    .single();

  if (!userData)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verifica que el usuario actual sea el líder del equipo
  const { data: team } = await supabase
    .from("teams")
    .select("leader_id, max_users")
    .eq("id", team_id)
    .single();

  if (!team || team.leader_id !== userData.id)
    return NextResponse.json(
      { error: "Only the team leader can add members" },
      { status: 403 }
    );

  // Verifica que no se exceda el máximo de usuarios
  const { count: currentCount } = await supabase
    .from("team_members")
    .select("id", { count: "exact", head: true })
    .eq("team_id", team_id);

  if (
    team.max_users &&
    currentCount !== null &&
    currentCount >= team.max_users
  ) {
    return NextResponse.json({ error: "Team is full" }, { status: 400 });
  }

  // Agrega al usuario indicado como miembro
  const { error } = await supabase.from("team_members").insert([
    {
      team_id,
      user_id: user_id_to_add,
      joined_at: new Date().toISOString().slice(0, 10),
    },
  ]);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
