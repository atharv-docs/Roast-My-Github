import { getGitHubUser, getGitHubRepositories, getGitHubEvents } from "@/lib/github";
import { generateGitHubAnalysis } from "@/lib/statistics";
import { generateRoast } from "@/lib/ollama";
import { getCachedRoast, setCachedRoast } from "@/lib/cache";
import type { GitHubAnalysis, RoastResult, RoastResponse } from "@/types/roast";

export async function analyzeGitHub(username: string): Promise<RoastResponse> {
  // Check cache first
  const cached = getCachedRoast(username);
  if (cached) {
    return { ...cached, cached: true };
  }

  // Fetch GitHub data
  const user = await getGitHubUser(username);
  const repos = await getGitHubRepositories(username);
  const events = await getGitHubEvents(username);

  // Generate analysis
  const reposWithReadme = new Map<string, string>();
  const analysis = generateGitHubAnalysis(user, repos, events, reposWithReadme);

  // Generate roast
  const roast = await generateRoast(analysis);

  // Cache result
  setCachedRoast(username, roast, analysis);

  return { roast, analysis, cached: false };
}

export async function getCachedResult(
  username: string
): Promise<RoastResponse | null> {
  const cached = getCachedRoast(username);
  if (cached) {
    return { ...cached, cached: true };
  }
  return null;
}