import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET: Listar eventos
export async function GET() {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data });
}

// POST: Crear evento
export async function POST(req: NextRequest) {
  const supabase = createClient(cookies());
  const { name, description, start_date, end_date } = await req.json();

  const { data, error } = await supabase
    .from("events")
    .insert([{ name, description, start_date, end_date }])
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
}
