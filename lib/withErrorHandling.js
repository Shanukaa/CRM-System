import { NextResponse } from 'next/server';

/**
 * Wraps a Next.js Route Handler so that any thrown error (e.g. a Google Sheets
 * API failure, missing env vars, network hiccup) is caught and turned into a
 * proper JSON error response instead of crashing and returning an empty/HTML
 * response that breaks `res.json()` on the client with "Unexpected end of
 * JSON input".
 */
export function withErrorHandling(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
    }
  };
}
