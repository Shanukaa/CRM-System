import { NextResponse } from 'next/server';
import { getSheetRows } from '@/lib/googleSheets';
import { requireSession } from '@/lib/apiAuth';

const PAGE_SIZE = 15;

const SHEET_MAP = {
  'fat-contouring': 'FAT Contouring',
  'body-fillers': 'Body Fillers',
};

const LEADS_SHEET_ID = process.env.GOOGLE_LEADS_SHEET_ID;

export async function GET(req, { params }) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sheetName = SHEET_MAP[params.table];
  if (!sheetName) return NextResponse.json({ error: 'Unknown lead table' }, { status: 404 });

  if (!LEADS_SHEET_ID) {
    return NextResponse.json(
      { error: 'GOOGLE_LEADS_SHEET_ID is not configured. Add it to your environment variables.' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const all = searchParams.get('all') === 'true';

  const { rows } = await getSheetRows(sheetName, { spreadsheetId: LEADS_SHEET_ID });
  let filtered = rows;
  if (q) {
    filtered = filtered.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }
  filtered = filtered.slice().reverse(); // most recently added first

  const total = filtered.length;
  const pageRows = all ? filtered : filtered.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE);

  return NextResponse.json({
    data: pageRows.map(cleanRow),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}

function cleanRow(r) {
  const { _rowNumber, ...rest } = r;
  return rest;
}
