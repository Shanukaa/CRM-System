'use client';
import { useEffect, useState } from 'react';

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user || null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
