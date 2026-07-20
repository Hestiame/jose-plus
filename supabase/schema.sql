-- ============================================================
-- JOSÉ+ — schema do banco (rodar no SQL Editor do Supabase)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- módulos escolares ----------
create table if not exists avisos (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  data date not null default current_date,
  criado_em timestamptz not null default now()
);

create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  data date not null,
  criado_em timestamptz not null default now()
);

create table if not exists provas (
  id uuid primary key default gen_random_uuid(),
  materia text not null,
  conteudo text,
  data date not null,
  criado_em timestamptz not null default now()
);

create table if not exists trabalhos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  materia text,
  entrega date not null,
  criado_em timestamptz not null default now()
);

create table if not exists merenda (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  itens text[] not null default '{}',
  criado_em timestamptz not null default now()
);

create table if not exists documentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text,
  url text,
  criado_em timestamptz not null default now()
);

create table if not exists galeria (
  id uuid primary key default gen_random_uuid(),
  descricao text,
  url text,
  criado_em timestamptz not null default now()
);

-- ---------- caixa da turma ----------
create table if not exists caixa_lancamentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('receita', 'despesa')),
  descricao text not null,
  valor numeric(12, 2) not null,
  categoria text, -- ex: 'rifa', 'vaquinha', 'geral'
  data date not null default current_date,
  criado_em timestamptz not null default now()
);

create table if not exists metas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('formatura', 'rifa', 'vaquinha')),
  meta numeric(12, 2) not null,
  criado_em timestamptz not null default now()
);

-- ---------- conversas do chat (públicas e admin) ----------
create table if not exists conversas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('publica', 'admin')),
  titulo text not null default 'Nova conversa',
  usuario_id text not null, -- id anônimo gerado no navegador do aluno, ou 'admin'
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists mensagens (
  id uuid primary key default gen_random_uuid(),
  conversa_id uuid not null references conversas(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  conteudo text not null,
  criado_em timestamptz not null default now()
);

create table if not exists visitantes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('aluno', 'visitante')),
  criado_em timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- Regra geral: qualquer pessoa pode LER os módulos escolares
-- (é o que alimenta o chat público). Só o backend (service role,
-- usado nas API routes) pode ESCREVER nos módulos — o admin nunca
-- escreve direto do navegador, sempre passa pela rota /api/admin.
-- ============================================================

alter table avisos enable row level security;
alter table eventos enable row level security;
alter table provas enable row level security;
alter table trabalhos enable row level security;
alter table merenda enable row level security;
alter table documentos enable row level security;
alter table galeria enable row level security;
alter table caixa_lancamentos enable row level security;
alter table metas enable row level security;
alter table conversas enable row level security;
alter table mensagens enable row level security;
alter table visitantes enable row level security;

create policy "leitura publica avisos" on avisos for select using (true);
create policy "leitura publica eventos" on eventos for select using (true);
create policy "leitura publica provas" on provas for select using (true);
create policy "leitura publica trabalhos" on trabalhos for select using (true);
create policy "leitura publica merenda" on merenda for select using (true);
create policy "leitura publica documentos" on documentos for select using (true);
create policy "leitura publica galeria" on galeria for select using (true);
create policy "leitura publica caixa" on caixa_lancamentos for select using (true);
create policy "leitura publica metas" on metas for select using (true);

-- conversas/mensagens: cada aluno só vê as suas (filtra por usuario_id na aplicação)
create policy "leitura conversas" on conversas for select using (true);
create policy "escrita conversas" on conversas for insert with check (true);
create policy "update conversas" on conversas for update using (true);
create policy "delete conversas" on conversas for delete using (true);

create policy "leitura mensagens" on mensagens for select using (true);
create policy "escrita mensagens" on mensagens for insert with check (true);

create policy "leitura visitantes" on visitantes for select using (true);
create policy "escrita visitantes" on visitantes for insert with check (true);

-- Nenhuma policy de insert/update/delete é criada para os módulos
-- escolares: isso significa que só a service_role key (usada nas
-- API routes do servidor) consegue alterá-los. É essa a barreira
-- de segurança que garante que só o painel administrativo edita a base.
