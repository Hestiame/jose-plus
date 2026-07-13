# José+ — Assistente escolar inteligente

Protótipo funcional em produção do José+: chat público (estilo ChatGPT) conectado
aos dados da escola, e painel administrativo onde tudo é feito por conversa em
linguagem natural (criar avisos, provas, eventos, lançar caixa, ler foto da merenda, etc).

Stack usada, pensada pra rodar **de graça**:

- **Next.js 14** (App Router) — frontend + API routes
- **Supabase** (Postgres + Auth + Storage) — banco de dados e login do admin
- **Google Gemini API** (`gemini-2.5-flash`) — IA que responde e decide as ações
- **Vercel** — hospedagem, com deploy automático a cada push no GitHub

---

## 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo de `supabase/schema.sql` (cria as tabelas e as
   regras de segurança — RLS).
3. (Opcional, recomendado para testar) rode também `supabase/seed.sql` para popular
   com dados de exemplo.
4. Vá em **Authentication → Users → Add user** e crie o usuário do administrador
   (e-mail + senha). É esse login que vai dar acesso ao painel `/admin`.
5. Em **Project Settings → API**, copie:
   - `Project URL` → vai virar `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → vai virar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → vai virar `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca exponha
     essa chave no frontend — ela só é usada dentro das API routes do servidor)

## 2. Pegar a chave do Gemini

1. Acesse [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Crie uma chave de API gratuita (não pede cartão de crédito).
3. Isso vai virar `GEMINI_API_KEY`.

## 3. Rodar localmente

```bash
cp .env.example .env.local
# preencha .env.local com os valores do passo 1 e 2

npm install
npm run dev
```

Acesse `http://localhost:3000` (área pública) e `http://localhost:3000/admin` (login administrativo).

## 4. Subir para o GitHub

```bash
git init
git add .
git commit -m "José+ inicial"
gh repo create jose-plus --public --source=. --push
# ou crie o repositório manualmente no GitHub e faça o git remote add + push
```

## 5. Publicar de graça na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório do GitHub.
2. Em **Environment Variables**, adicione as 4 variáveis do `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`).
3. Clique em **Deploy**. A partir daqui, todo `git push` na branch principal gera
   um novo deploy automaticamente.

> ⚠️ O plano Hobby (grátis) da Vercel é para uso não-comercial/pessoal. Perfeito
> para pilotar com uma escola sem cobrar nada. No dia em que o José+ virar um
> produto pago, migre para o plano Pro.

## Estrutura do projeto

```
src/
  app/
    page.tsx              → chat público (área do aluno)
    admin/page.tsx         → login + chat administrativo + dashboard
    api/chat/route.ts      → endpoint do chat público (lê dados, chama o Gemini)
    api/admin/route.ts     → endpoint do chat admin (autentica, chama o Gemini
                              em modo JSON, aplica criar/editar/excluir no Supabase)
  components/
    ChatPanel.tsx          → UI de chat (histórico, nova conversa, renomear, excluir)
    Dashboard.tsx           → Portal da Transparência + visão rápida dos módulos
  lib/
    supabaseClient.ts      → cliente do navegador (chave anon, somente leitura nos módulos)
    supabaseServer.ts      → cliente do servidor (service_role, único que escreve)
    gemini.ts              → chamada à API do Gemini
    prompts.ts             → os "cérebros" em texto do José+ (público e admin)
    types.ts               → tipos compartilhados
supabase/
  schema.sql               → tabelas + Row Level Security
  seed.sql                 → dados de exemplo (opcional)
```

## Como a segurança funciona

- O navegador (aluno ou admin) só tem a chave **anon** do Supabase, que só permite
  **ler** avisos, provas, eventos, merenda, caixa etc. Não é possível escrever
  direto do navegador.
- Toda escrita (criar aviso, lançar caixa, etc.) passa pela rota `/api/admin`,
  que exige um token de login válido e só então usa a chave `service_role`
  (que fica só no servidor) para alterar o banco.
- O Gemini decide **o quê** fazer (criar/editar/excluir/consultar) e devolve um
  JSON estruturado; quem efetivamente aplica a mudança no banco é o código da
  rota, nunca a IA diretamente.

## Próximos passos sugeridos

- Upload real de imagens (merenda, galeria, documentos) para o Supabase Storage
  em vez de só descrever o que a IA viu na foto.
- Multi-tenant: uma tabela `escolas` e uma coluna `escola_id` em cada módulo,
  para o José+ atender várias escolas no mesmo banco.
- Notificações (e-mail ou push) quando um aviso novo é publicado.
