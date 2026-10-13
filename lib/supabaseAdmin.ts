import { createClient } from '@supabase/supabase-js';

// Server-only client. Uses the service-role key so it can read/write the
// `guests` table even though Row Level Security has zero public policies.
// NEVER import this file from a Client Component or expose this key to the browser.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
