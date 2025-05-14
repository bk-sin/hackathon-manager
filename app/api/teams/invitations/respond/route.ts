import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  const supabase = createClient(cookies());

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invitation_id, action } = await req.json(); // action: "accept" | "decline"

  // Busca el usuario en Supabase por clerk_id
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", user.id)
    .single();

  if (!userData)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Busca la invitación
  const { data: invitation } = await supabase
    .from("team_invitations")
    .select("id, team_id, invited_user_id, status")
    .eq("id", invitation_id)
    .single();

  if (!invitation || invitation.invited_user_id !== userData.id)
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 }
    );

  if (invitation.status !== "pending")
    return NextResponse.json(
      { error: "Invitation already responded" },
      { status: 400 }
    );

  // Actualiza el estado de la invitación
  const { error } = await supabase
    .from("team_invitations")
    .update({
      status: action === "accept" ? "accepted" : "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", invitation_id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Si acepta, lo agrega como miembro
  if (action === "accept") {
    await supabase.from("team_members").insert([
      {
        team_id: invitation.team_id,
        user_id: userData.id,
        joined_at: new Date().toISOString().slice(0, 10),
      },
    ]);
  }

  return NextResponse.json({ ok: true });
}
