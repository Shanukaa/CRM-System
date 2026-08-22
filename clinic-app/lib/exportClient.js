import * as XLSX from 'xlsx';

export function exportToExcel(rows, columns, filename) {
  const data = rows.map((r) => {
    const obj = {};
    columns.forEach((c) => { obj[c.label] = r[c.key]; });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, filename.slice(0, 31));
  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
