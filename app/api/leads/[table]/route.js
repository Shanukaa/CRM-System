import { NextResponse } from 'next/server';
import { getSheetRows, updateCell } from '@/lib/googleSheets';
import { requireSession } from '@/lib/apiAuth';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { FAT_CONTOURING_EDITABLE, BODY_FILLERS_EDITABLE } from '@/lib/constants';

const PAGE_SIZE = 15;

const SHEET_MAP = {
  'fat-contouring': 'FAT Contouring',
  'body-fillers': 'Body Fillers',
};

// Server-side whitelist — enforced regardless of what the client sends, so only
// the specific follow-up columns each table allows can ever be edited from here.
const EDITABLE_MAP = {
  'fat-contouring': FAT_CONTOURING_EDITABLE,
  'body-fillers': BODY_FILLERS_EDITABLE,
};

const LEADS_SHEET_ID = process.env.GOOGLE_LEADS_SHEET_ID;

export const GET = withErrorHandling(async (req, { params }) => {
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
  const dateFilter = searchParams.get('date') || '';
  const all = searchParams.get('all') === 'true';

  const { rows } = await getSheetRows(sheetName, { spreadsheetId: LEADS_SHEET_ID });
  let filtered = rows;
  if (q) {
    filtered = filtered.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }
  if (dateFilter) {
    filtered = filtered.filter((r) => normalizeDate(r['created_time']) === dateFilter);
  }

  if (dateFilter) {
    // Searching a specific date: show that day's leads oldest-to-newest.
    filtered = filtered.slice().sort((a, b) => {
      const da = parseDateTime(a['created_time']);
      const db = parseDateTime(b['created_time']);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da - db;
    });
  } else {
    filtered = filtered.slice().reverse(); // default: most recently added first
  }

  const total = filtered.length;
  const pageRows = all ? filtered : filtered.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE);

  return NextResponse.json({
    data: pageRows.map(cleanRow),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
});

export const PATCH = withErrorHandling(async (req, { params }) => {
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

  const body = await req.json();
  const { row, field, value } = body;
  if (!row || !field) {
    return NextResponse.json({ error: 'row and field are required' }, { status: 400 });
  }

  const editable = EDITABLE_MAP[params.table] || [];
  if (!editable.includes(field)) {
    return NextResponse.json({ error: 'This field is not editable' }, { status: 403 });
  }

  try {
    await updateCell(sheetName, row, field, value ?? '', { spreadsheetId: LEADS_SHEET_ID });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
});

function cleanRow(r) {
  const { _rowNumber, ...rest } = r;
  return { ...rest, _row: _rowNumber };
}

function normalizeDate(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? v : d.toISOString().slice(0, 10);
}

function parseDateTime(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}
