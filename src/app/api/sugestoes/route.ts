import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

async function requireAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("sugestoes")
    .select("id, texto, criado_em")
    .order("criado_em", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar sugestões." }, { status: 500 });
  }

  return NextResponse.json({ sugestoes: data || [] });
}
