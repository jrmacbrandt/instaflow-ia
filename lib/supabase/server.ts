import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with the service_role key.
 * Use ONLY in server-side code (API Routes, Server Components).
 * Returns null if Supabase env vars are not set (falls back to mockStore).
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || url.includes('your-supabase-project')) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * The UUID of the single owner user in Supabase auth.users.
 * Set OWNER_USER_ID in .env.local after creating the user in Supabase Dashboard.
 */
export const OWNER_USER_ID = process.env.OWNER_USER_ID || 'user-demo-123';
