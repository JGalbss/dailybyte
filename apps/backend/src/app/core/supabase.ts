import { createClient } from '@supabase/supabase-js';
import { system, SystemProp } from './system';
import { Database } from '@dailybyte/shared';

// typesafe supabase client
export const db = createClient<Database>(
  system.get(SystemProp.SUPABASE_URL),
  system.get(SystemProp.SUPABASE_ANON_KEY),
);
