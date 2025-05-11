import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/utils/supabase/server";

import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", user.id)
    .single();

  if (!data) {
    const { error: insertError } = await supabase.from("users").insert([
      {
        clerk_id: user.id,
      },
    ]);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
