// Cliente de Lovable Cloud para Analytics y Multimedia
import { createClient } from '@supabase/supabase-js';

const LOVABLE_CLOUD_URL = 'https://tikwxotrigqmbptucciy.supabase.co';
const LOVABLE_CLOUD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpa3d4b3RyaWdxbWJwdHVjY2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNjE3MzIsImV4cCI6MjA3NjgzNzczMn0.nDcMxnJjhohzLdULEF-ZcMyPCTLN-bpXEz7QKRbjzCQ';

export const lovableCloud = createClient(LOVABLE_CLOUD_URL, LOVABLE_CLOUD_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
