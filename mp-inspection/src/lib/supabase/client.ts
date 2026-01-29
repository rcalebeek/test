import { createBrowserClient } from '@supabase/ssr'

// Create client without strict Database typing to avoid
// TypeScript inference issues with Supabase operations
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
