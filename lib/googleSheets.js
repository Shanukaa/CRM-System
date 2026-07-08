import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

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

function invalidate(sheetName) {
  cache.delete(`rows:${sheetName}`);
}

/**
 * Reads an entire sheet in a single API call and returns it as
 * { headers: string[], rows: object[] } where each row object also carries
 * a hidden _rowNumber (1-indexed, matching the actual sheet row) so updates
 * and deletes can target the correct row.
 */
export async function getSheetRows(sheetName, { useCache = true } = {}) {
  const cacheKey = `rows:${sheetName}`;
  if (useCache && cache.has(cacheKey)) {
    const { data, ts } = cache.get(cacheKey);
    if (Date.now() - ts < CACHE_TTL_MS) return data;
  }

  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
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

export async function appendRow(sheetName, rowObject) {
  const sheets = getSheetsClient();
  const { headers } = await getSheetRows(sheetName, { useCache: false });
  const row = headers.map((h) => rowObject[h] ?? '');
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
  invalidate(sheetName);
}

export async function updateRowById(sheetName, id, updatedFields) {
  const sheets = getSheetsClient();
  const { headers, rows } = await getSheetRows(sheetName, { useCache: false });
  const target = rows.find((r) => r.ID === id);
  if (!target) throw new Error('Record not found');

  const merged = { ...target, ...updatedFields };
  const rowValues = headers.map((h) => merged[h] ?? '');

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A${target._rowNumber}:${colLetter(headers.length)}${target._rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [rowValues] },
  });
  invalidate(sheetName);
}

export async function deleteRowById(sheetName, id) {
  const sheets = getSheetsClient();
  const { rows } = await getSheetRows(sheetName, { useCache: false });
  const target = rows.find((r) => r.ID === id);
  if (!target) throw new Error('Record not found');

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = meta.data.sheets.find((s) => s.properties.title === sheetName);
  if (!sheet) throw new Error(`Sheet tab "${sheetName}" not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
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
  invalidate(sheetName);
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
