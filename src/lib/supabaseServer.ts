import { createClient } from "@supabase/supabase-js";
import { SchoolData } from "./types";

// Cliente usado SOMENTE dentro das API routes (roda no servidor).
// A service_role key ignora RLS, então é ela quem tem permissão de
// criar/editar/excluir avisos, provas, eventos, caixa, etc.
// Nunca importe este arquivo em um componente de cliente ("use client").
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function fetchSchoolData(): Promise<SchoolData> {
  const [avisos, eventos, provas, trabalhos, merenda, documentos, galeria, lancamentos, metas] =
    await Promise.all([
      supabaseAdmin.from("avisos").select("*").order("data", { ascending: false }).limit(30),
      supabaseAdmin.from("eventos").select("*").order("data", { ascending: true }).limit(30),
      supabaseAdmin.from("provas").select("*").order("data", { ascending: true }).limit(30),
      supabaseAdmin.from("trabalhos").select("*").order("entrega", { ascending: true }).limit(30),
      supabaseAdmin.from("merenda").select("*").order("data", { ascending: false }).limit(14),
      supabaseAdmin.from("documentos").select("*").order("criado_em", { ascending: false }).limit(30),
      supabaseAdmin.from("galeria").select("*").order("criado_em", { ascending: false }).limit(30),
      supabaseAdmin.from("caixa_lancamentos").select("*").order("data", { ascending: false }).limit(100),
      supabaseAdmin.from("metas").select("*")
    ]);

  const lancamentosData = lancamentos.data || [];
  const saldo = lancamentosData.reduce(
    (acc, l) => acc + (l.tipo === "receita" ? Number(l.valor) : -Number(l.valor)),
    0
  );

  const metasComArrecadado = (metas.data || []).map((m) => {
    const arrecadado = lancamentosData
      .filter((l) => l.tipo === "receita" && l.categoria === m.tipo)
      .reduce((acc, l) => acc + Number(l.valor), 0);
    return { ...m, arrecadado };
  });

  return {
    avisos: avisos.data || [],
    eventos: eventos.data || [],
    provas: provas.data || [],
    trabalhos: trabalhos.data || [],
    merenda: merenda.data || [],
    documentos: documentos.data || [],
    galeria: galeria.data || [],
    caixa: {
      saldo,
      lancamentos: lancamentosData,
      metas: metasComArrecadado
    }
  };
}
