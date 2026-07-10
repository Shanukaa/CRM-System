'use client';
import { useRef, useState } from 'react';
import { Upload, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ImportButton({ columns, templateName, endpoint, mapRow, onImported }) {
  const inputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  function downloadTemplate() {
    const blankRow = Object.fromEntries(columns.map((c) => [c.label, '']));
    const ws = XLSX.utils.json_to_sheet([blankRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, templateName.slice(0, 31));
    XLSX.writeFile(wb, `${templateName}-template.xlsx`);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array', cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, dateNF: 'yyyy-mm-dd' });

      const payloadRows = rawRows.map(mapRow).filter(Boolean);
      if (payloadRows.length === 0) {
        setResult({ error: 'No valid rows found in the file' });
        return;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: payloadRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setResult(data);
      onImported?.();
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setImporting(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={downloadTemplate}
        title="Download import template"
        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50"
      >
        <FileDown size={16} />
      </button>
      <button
        type="button"
        disabled={importing}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50"
      >
        <Upload size={16} /> {importing ? 'Importing...' : 'Import'}
      </button>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
      {result && (
        <span className={`text-xs ${result.error ? 'text-rose-500' : 'text-emerald-600'}`}>
          {result.error ? result.error : `Imported ${result.imported}${result.skipped ? `, skipped ${result.skipped}` : ''}`}
        </span>
      )}
    </div>
  );
}
