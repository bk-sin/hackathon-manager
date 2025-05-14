import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  const supabase = createClient(cookies());

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { request_id, action } = await req.json(); // action: "accept" | "decline"

  // Busca la solicitud
  const { data: request } = await supabase
    .from("team_join_requests")
    .select("*, team:teams(leader_id)")
    .eq("id", request_id)
    .single();

  if (!request)
    return NextResponse.json({ error: "Request not found" }, { status: 404 });

  // Busca el usuario actual en Supabase
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", user.id)
    .single();

  if (!userData || request.team.leader_id !== userData.id)
    return NextResponse.json(
      { error: "Only the team leader can respond" },
      { status: 403 }
    );

  // Actualiza el estado de la solicitud
  await supabase
    .from("team_join_requests")
    .update({
      status: action === "accept" ? "accepted" : "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", request_id);

  // Si acepta, agrega al usuario al equipo
  if (action === "accept") {
    await supabase.from("team_members").insert([
      {
        team_id: request.team_id,
        user_id: request.user_id,
        joined_at: new Date().toISOString().slice(0, 10),
      },
    ]);
  }

  return NextResponse.json({ ok: true });
}
