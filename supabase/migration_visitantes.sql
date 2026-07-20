-- ============================================================
-- JOSÉ+ — migração: tabela de visitantes
-- Rodar uma vez no SQL Editor do Supabase (projeto já existente)
-- ============================================================

create table if not exists visitantes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('aluno', 'visitante')),
  criado_em timestamptz not null default now()
);

alter table visitantes enable row level security;

create policy "leitura visitantes" on visitantes for select using (true);
create policy "escrita visitantes" on visitantes for insert with check (true);
