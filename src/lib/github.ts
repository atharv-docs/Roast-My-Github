import type { GitHubUser, GitHubRepository, GitHubEvent } from "@/types/github";

const GITHUB_API_BASE = "https://api.github.com";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchGitHub<T>(endpoint: string, username?: string): Promise<T> {
  const cacheKey = username ? `${endpoint}:${username}` : endpoint;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RoastMyGitHub",
  };

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers,
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("User not found. Are you sure they exist?");
    }
    if (response.status === 403) {
      const resetTime = response.headers.get("X-RateLimit-Reset");
      if (resetTime) {
        const resetDate = new Date(parseInt(resetTime) * 1000);
        const minutes = Math.ceil((resetDate.getTime() - Date.now()) / 60000);
        throw new Error(`GitHub rate limited. Try again in ${minutes} minute(s).`);
      }
      throw new Error("GitHub is playing hard to get. Try again in a minute.");
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  setCache(cacheKey, data);
  return data as T;
}

export async function getGitHubUser(username: string): Promise<GitHubUser> {
  return fetchGitHub<GitHubUser>(`/users/${username}`, username);
}

export async function getGitHubRepositories(username: string): Promise<GitHubRepository[]> {
  const repos: GitHubRepository[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetchGitHub<GitHubRepository[]>(
      `/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
      username
    );

    if (!response || response.length === 0) break;
    repos.push(...response);

    if (response.length < perPage) break;
    page++;

    // Safety limit
    if (page > 10) break;
  }

  return repos;
}

export async function getGitHubEvents(username: string): Promise<GitHubEvent[]> {
  const events = await fetchGitHub<GitHubEvent[]>(
    `/users/${username}/events?per_page=100`,
    username
  );
  return events;
}

export async function checkGitHubHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/zen`, {
      method: "GET",
      headers: { "User-Agent": "RoastMyGitHub" },
    });
    return response.ok;
  } catch {
    return false;
  }
}
export function clearCache(): void {
  cache.clear();
}