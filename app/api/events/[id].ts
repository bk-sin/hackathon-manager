import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET: Ver un evento
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ event: data });
}

// PUT: Actualizar un evento
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(cookies());
  const { name, description, start_date, end_date } = await req.json();

  const { data, error } = await supabase
    .from("events")
    .update({ name, description, start_date, end_date })
    .eq("id", params.id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
}

// DELETE: Eliminar un evento
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(cookies());
  const { error } = await supabase.from("events").delete().eq("id", params.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
