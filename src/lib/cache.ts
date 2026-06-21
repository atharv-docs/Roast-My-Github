import type { RoastResult, GitHubAnalysis } from "@/types/roast";

interface CacheEntry {
  roast: RoastResult;
  analysis: GitHubAnalysis;
  timestamp: number;
}

const roastCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export function getCachedRoast(username: string): {
  roast: RoastResult;
  analysis: GitHubAnalysis;
} | null {
  const entry = roastCache.get(username.toLowerCase());
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    roastCache.delete(username.toLowerCase());
    return null;
  }

  return { roast: entry.roast, analysis: entry.analysis };
}

export function setCachedRoast(
  username: string,
  roast: RoastResult,
  analysis: GitHubAnalysis
): void {
  roastCache.set(username.toLowerCase(), {
    roast,
    analysis,
    timestamp: Date.now(),
  });
}

export function clearRoastCache(): void {
  roastCache.clear();
}

export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: roastCache.size,
    entries: Array.from(roastCache.keys()),
  };
}