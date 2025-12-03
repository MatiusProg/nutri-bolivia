// Cliente de Supabase - usa configuración hardcodeada para evitar problemas con .env
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_CONFIG } from './supabase-config';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_CONFIG.url, 
  SUPABASE_CONFIG.anonKey, 
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
