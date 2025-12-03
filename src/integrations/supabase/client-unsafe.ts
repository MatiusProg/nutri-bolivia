// Re-export del cliente principal para compatibilidad con código existente
// El cliente ahora usa configuración hardcodeada, no .env
import { supabase as base } from './client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = base as any;
