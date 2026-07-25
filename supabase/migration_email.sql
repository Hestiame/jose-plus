-- ============================================================
-- JOSÉ+ — migração: inscrição de e-mail pra receber avisos
-- Rodar uma vez no SQL Editor do Supabase (projeto já existente)
-- ============================================================

create table if not exists inscritos_email (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  criado_em timestamptz not null default now()
);

alter table inscritos_email enable row level security;

create policy "escrita inscritos_email" on inscritos_email for insert with check (true);
-- sem policy de select: a lista de e-mails só é lida pela rota do servidor (service_role),
-- pra não expor os e-mails de ninguém no navegador
