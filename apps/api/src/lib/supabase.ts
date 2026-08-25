import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Service role client — bypasses RLS.
// Express middleware handles auth and institution scoping.
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
