export function downloadICS(params: { titulo: string; descricao?: string; data: string }) {
  const { titulo, descricao, data } = params;
  const dateStr = data.replace(/-/g, "");
  const uid = `${dateStr}-${Math.random().toString(36).slice(2, 8)}@joseplus`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//José+//Assistente Escolar//PT",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    `SUMMARY:${titulo}`,
    descricao ? `DESCRIPTION:${descricao.replace(/\n/g, "\\n")}` : "",
    "END:VEVENT",
    "END:VCALENDAR"
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${titulo.replace(/[^\w\s-]/g, "").slice(0, 40) || "evento"}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
