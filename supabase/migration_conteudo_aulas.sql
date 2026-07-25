-- ============================================================
-- JOSÉ+ — migração: conteúdo das aulas (a partir de foto do quadro)
-- Rodar uma vez no SQL Editor do Supabase (projeto já existente)
-- ============================================================

create table if not exists conteudo_aulas (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  materia text,
  resumo text not null,
  criado_em timestamptz not null default now()
);

alter table conteudo_aulas enable row level security;

create policy "leitura publica conteudo_aulas" on conteudo_aulas for select using (true);
-- sem policy de insert/update/delete: só a service_role (usada nas API routes) pode escrever
