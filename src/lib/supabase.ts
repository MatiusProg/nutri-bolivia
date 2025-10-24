import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cikrrifmawnptypogrdl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpa3JyaWZtYXducHR5cG9ncmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDI0NTMsImV4cCI6MjA3NTA3ODQ1M30.kgdOnAHjq3mv7enTYEHaoFU5p65-x2LDyHYnqDNIKZ8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
