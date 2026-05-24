import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAnonKey, supabaseUrl } from './env';
import type { Database } from './types';

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Reads/writes the session cookie via Next's cookie store. Writing from a
 * Server Component throws (read-only context); session refresh happens in
 * middleware instead — wired in the Sprint 2 auth work.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component context — safe to ignore; middleware refreshes.
        }
      },
    },
  });
}
