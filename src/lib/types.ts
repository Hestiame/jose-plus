export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type SchoolData = {
  avisos: { id: string; texto: string; data: string }[];
  eventos: { id: string; titulo: string; descricao: string | null; data: string }[];
  provas: { id: string; materia: string; conteudo: string | null; data: string }[];
  trabalhos: { id: string; titulo: string; materia: string | null; entrega: string }[];
  merenda: { id: string; data: string; itens: string[] }[];
  documentos: { id: string; nome: string; tipo: string | null; url: string | null }[];
  galeria: { id: string; descricao: string | null; url: string | null }[];
  caixa: {
    saldo: number;
    lancamentos: {
      id: string;
      tipo: "receita" | "despesa";
      descricao: string;
      valor: number;
      categoria: string | null;
      data: string;
    }[];
    metas: { id: string; nome: string; tipo: string; meta: number; arrecadado: number }[];
  };
};

export type AdminAction = {
  acao: "criar" | "atualizar" | "excluir" | "consultar" | "conversar";
  modulo:
    | "avisos"
    | "eventos"
    | "provas"
    | "trabalhos"
    | "merenda"
    | "documentos"
    | "galeria"
    | "caixa_lancamento"
    | "metas"
    | null;
  registro_id: string | null; // id existente, quando for atualizar/excluir
  dados: Record<string, unknown> | null; // campos do registro a criar/atualizar
  resposta: string;
};
