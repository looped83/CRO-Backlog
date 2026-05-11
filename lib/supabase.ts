// Supabase integration stub — not required for V1 core loop
// Replace with real client when NEXT_PUBLIC_SUPABASE_URL is set

import type { StoredAnalysis } from "./schemas";

export async function saveAnalysis(_analysis: StoredAnalysis): Promise<void> {
  // No-op in V1 — analyses stored in-memory/localStorage on client
}

export async function getAnalysis(_id: string): Promise<StoredAnalysis | null> {
  return null;
}
