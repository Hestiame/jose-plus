type Feriado = { data: string; nome: string };

async function fetchYear(year: number): Promise<Feriado[]> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`, {
      next: { revalidate: 60 * 60 * 24 } // cache de 24h, evita bater na API toda hora
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { date: string; name: string }[];
    return data.map((f) => ({ data: f.date, nome: f.name }));
  } catch {
    return [];
  }
}

// Busca os feriados nacionais do ano atual e do próximo (cobre a virada de dezembro/janeiro).
export async function fetchFeriados(): Promise<Feriado[]> {
  const year = new Date().getFullYear();
  const [atual, proximo] = await Promise.all([fetchYear(year), fetchYear(year + 1)]);
  return [...atual, ...proximo];
}
