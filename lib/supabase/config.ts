/**
 * The Supabase project this site authenticates against.
 *
 * Both values are safe in the browser — the publishable key is meant to be shipped to clients, and
 * what it may do is decided by row-level security in the backend, not by keeping it secret. The
 * secret key never appears in this repository.
 */
export function supabaseBrowserConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  return url && key ? { url, key } : null
}

/** Whether an admin login is possible at all. Unconfigured means the tools stay shut. */
export function isSupabaseAuthConfigured(): boolean {
  return supabaseBrowserConfig() !== null
}
