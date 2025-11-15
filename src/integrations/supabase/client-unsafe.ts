// Unsafe wrapper to bypass strict Database typing while we stabilize schemas.
// Reuses the generated client instance, only relaxing its type to `any`.
import { supabase as base } from './client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = base as any;
