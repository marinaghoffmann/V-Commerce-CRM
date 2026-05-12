export function exportCSV(data: object[], fileName: string) {
  // Pega os nomes das colunas a partir da primeira linha
  const headers = Object.keys(data[0]);

  // Monta o CSV linha por linha
  let csv = headers.join(",") + "\n";

  for (const row of data) {
    const values = headers.map((col) => (row as Record<string, unknown>)[col]);
    csv += values.join(",") + "\n";
  }

  // Cria um arquivo temporário e faz o download
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName + ".csv";
  link.click();
}