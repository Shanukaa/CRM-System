import { google } from 'googleapis';

const DEFAULT_SHEET_ID = process.env.GOOGLE_SHEET_ID;

let sheetsClient = null;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY env vars');
  }
  return new google.auth.JWT(email, null, key, ['https://www.googleapis.com/auth/spreadsheets']);
}

function getSheetsClient() {
  if (!sheetsClient) {
    sheetsClient = google.sheets({ version: 'v4', auth: getAuth() });
  }
  return sheetsClient;
}

// Short-lived in-memory cache. Only helps on warm serverless instances, but
// avoids hammering the Sheets API when several requests land close together.
const cache = new Map();
const CACHE_TTL_MS = 4000;

function cacheKeyFor(spreadsheetId, sheetName) {
  return `${spreadsheetId}::${sheetName}`;
}

function invalidate(sheetName, spreadsheetId = DEFAULT_SHEET_ID) {
  cache.delete(cacheKeyFor(spreadsheetId, sheetName));
}

/**
 * Reads an entire sheet in a single API call and returns it as
 * { headers: string[], rows: object[] } where each row object also carries
 * a hidden _rowNumber (1-indexed, matching the actual sheet row) so updates
 * and deletes can target the correct row.
 *
 * Pass { spreadsheetId } to read from a different Google Sheet file than the
 * main one (e.g. a separately-created Leads spreadsheet) — the same service
 * account is used, it just needs to be shared with that other file too.
 */
export async function getSheetRows(sheetName, { useCache = true, spreadsheetId = DEFAULT_SHEET_ID } = {}) {
  if (!spreadsheetId) {
    throw new Error('No spreadsheet ID configured. Check your GOOGLE_SHEET_ID (or GOOGLE_LEADS_SHEET_ID) env var.');
  }

  const cacheKey = cacheKeyFor(spreadsheetId, sheetName);
  if (useCache && cache.has(cacheKey)) {
    const { data, ts } = cache.get(cacheKey);
    if (Date.now() - ts < CACHE_TTL_MS) return data;
  }

  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z10000`,
  });

  const values = res.data.values || [];
  if (values.length === 0) {
    const empty = { headers: [], rows: [] };
    cache.set(cacheKey, { data: empty, ts: Date.now() });
    return empty;
  }

  const headers = values[0];
  const rows = values.slice(1).map((row, idx) => {
    const obj = { _rowNumber: idx + 2 };
    headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
    return obj;
  });

  const data = { headers, rows };
  cache.set(cacheKey, { data, ts: Date.now() });
  return data;
}

export async function appendRow(sheetName, rowObject, { spreadsheetId = DEFAULT_SHEET_ID } = {}) {
  const sheets = getSheetsClient();
  const { headers } = await getSheetRows(sheetName, { useCache: false, spreadsheetId });
  const row = headers.map((h) => rowObject[h] ?? '');
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
  invalidate(sheetName, spreadsheetId);
}

export async function appendRows(sheetName, rowObjects, { spreadsheetId = DEFAULT_SHEET_ID } = {}) {
  if (!rowObjects.length) return;
  const sheets = getSheetsClient();
  const { headers } = await getSheetRows(sheetName, { useCache: false, spreadsheetId });
  const values = rowObjects.map((obj) => headers.map((h) => obj[h] ?? ''));
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
  invalidate(sheetName, spreadsheetId);
}

export async function batchUpdateColumn(sheetName, columnName, idValueMap, { spreadsheetId = DEFAULT_SHEET_ID } = {}) {
  if (idValueMap.size === 0) return 0;
  const sheets = getSheetsClient();
  const { headers, rows } = await getSheetRows(sheetName, { useCache: false, spreadsheetId });
  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) throw new Error(`Column "${columnName}" not found in ${sheetName}`);
  const col = colLetter(colIndex + 1);

  const data = [];
  for (const [id, value] of idValueMap.entries()) {
    const row = rows.find((r) => r.ID === id);
    if (!row) continue;
    data.push({ range: `${sheetName}!${col}${row._rowNumber}`, values: [[value]] });
  }
  if (data.length === 0) return 0;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: 'USER_ENTERED', data },
  });
  invalidate(sheetName, spreadsheetId);
  return data.length;
}

export async function updateRowById(sheetName, id, updatedFields, { spreadsheetId = DEFAULT_SHEET_ID } = {}) {
  const sheets = getSheetsClient();
  const { headers, rows } = await getSheetRows(sheetName, { useCache: false, spreadsheetId });
  const target = rows.find((r) => r.ID === id);
  if (!target) throw new Error('Record not found');

  const merged = { ...target, ...updatedFields };
  const rowValues = headers.map((h) => merged[h] ?? '');

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${target._rowNumber}:${colLetter(headers.length)}${target._rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [rowValues] },
  });
  invalidate(sheetName, spreadsheetId);
}

export async function deleteRowById(sheetName, id, { spreadsheetId = DEFAULT_SHEET_ID } = {}) {
  const sheets = getSheetsClient();
  const { rows } = await getSheetRows(sheetName, { useCache: false, spreadsheetId });
  const target = rows.find((r) => r.ID === id);
  if (!target) throw new Error('Record not found');

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets.find((s) => s.properties.title === sheetName);
  if (!sheet) throw new Error(`Sheet tab "${sheetName}" not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: target._rowNumber - 1,
              endIndex: target._rowNumber,
            },
          },
        },
      ],
    },
  });
  invalidate(sheetName, spreadsheetId);
}

function colLetter(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
