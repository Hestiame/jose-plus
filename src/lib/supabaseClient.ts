import { createClient } from "@supabase/supabase-js";

// Cliente usado no navegador (aluno e tela de login do admin).
// Usa a chave "anon", que só tem permissão de leitura nos módulos
// escolares (ver supabase/schema.sql) e de leitura/escrita nas
// conversas do próprio usuário.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
