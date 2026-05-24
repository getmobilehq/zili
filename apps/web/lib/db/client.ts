import { createBrowserClient } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from './env';
import type { Database } from './types';

/** Supabase client for Client Components (browser). */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey());
}
