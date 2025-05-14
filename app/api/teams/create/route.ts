import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  const supabase = createClient(cookies());

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, event_id, max_users, status, description } = await req.json();

  // Busca el usuario en Supabase por clerk_id
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", user.id)
    .single();

  if (!userData)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Crea el equipo con leader_id
  const { data: team, error } = await supabase
    .from("teams")
    .insert([
      {
        name,
        event_id,
        leader_id: userData.id,
        max_users,
        status,
        description,
      },
    ])
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Agrega al creador como miembro
  await supabase.from("team_members").insert([
    {
      team_id: team.id,
      user_id: userData.id,
      joined_at: new Date().toISOString().slice(0, 10),
    },
  ]);

  return NextResponse.json({ team });
}
