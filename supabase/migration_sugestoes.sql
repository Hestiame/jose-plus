-- ============================================================
-- JOSÉ+ — migração: caixinha de sugestões anônima
-- Rodar uma vez no SQL Editor do Supabase (projeto já existente)
-- ============================================================

create table if not exists sugestoes (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  criado_em timestamptz not null default now()
);

alter table sugestoes enable row level security;

-- Só existe policy de INSERT — nem o navegador do admin consegue LER
-- direto (chave anon). A leitura só acontece pela rota /api/sugestoes,
-- que usa a service_role no servidor após confirmar o login do admin.
create policy "escrita sugestoes" on sugestoes for insert with check (true);
