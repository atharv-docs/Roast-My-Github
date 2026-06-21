import type { GitHubRepository, GitHubEvent, GitHubUser } from "@/types/github";
import { calculateAccountAgeYears, isWeekend, isLateNight, isAbandoned } from "@/lib/utils";
import { detectSuspiciousNames, calculateReadmeQuality, detectActivityType, generateObservations } from "@/lib/patterns";
import type { ProfileStats, RepositoryStats, CommitStats, PatternStats, GitHubAnalysis } from "@/types/roast";

export function generateProfileStats(user: GitHubUser): ProfileStats {
  return {
    username: user.login,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    accountAgeYears: calculateAccountAgeYears(user.created_at),
    avatarUrl: user.avatar_url,
    name: user.name,
  };
}

export function generateRepositoryStats(repos: GitHubRepository[]): RepositoryStats {
  const total = repos.length;
  const forks = repos.filter((r) => r.fork).length;
  const stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const withReadme = repos.filter(
    (r) => r.topics.includes("readme") || r.description?.toLowerCase().includes("readme")
  ).length;
  const withoutReadme = total - withReadme;
  const abandoned = repos.filter((r) => isAbandoned(r.updated_at, 6)).length;
  const archived = repos.filter((r) => r.archived).length;
  const averageStars = total > 0 ? stars / total : 0;
  const totalSize = repos.reduce((sum, r) => sum + r.size, 0);
  const averageSize = total > 0 ? totalSize / total : 0;

  // Get top languages
  const languageCounts = new Map<string, number>();
  for (const repo of repos) {
    if (repo.language) {
      languageCounts.set(repo.language, (languageCounts.get(repo.language) || 0) + 1);
    }
  }
  const topLanguages = Array.from(languageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang);

  const forkRatio = total > 0 ? forks / total : 0;

  return {
    total,
    forks,
    stars,
    withReadme,
    withoutReadme,
    abandoned,
    archived,
    averageStars: Math.round(averageStars * 100) / 100,
    averageSize: Math.round(averageSize),
    topLanguages,
    forkRatio: Math.round(forkRatio * 100) / 100,
    totalSize,
  };
}

export function generateCommitStats(events: GitHubEvent[]): CommitStats {
  const pushEvents = events.filter((e) => e.type === "PushEvent");
  const totalEvents = events.length;

  // Extract commit messages
  const allMessages: string[] = [];
  for (const event of pushEvents) {
    if (event.payload.commits) {
      for (const commit of event.payload.commits) {
        allMessages.push(commit.message);
      }
    }
  }

  // Find most common messages (normalized)
  const messageCounts = new Map<string, number>();
  for (const msg of allMessages) {
    const normalized = msg.toLowerCase().trim().split("\n")[0].slice(0, 50);
    if (normalized.length > 2) {
      messageCounts.set(normalized, (messageCounts.get(normalized) || 0) + 1);
    }
  }

  const mostCommonMessages = Array.from(messageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([msg]) => msg);

  // Calculate fix percentage
  const fixMessages = allMessages.filter(
    (m) =>
      m.toLowerCase().includes("fix") ||
      m.toLowerCase().includes("bug") ||
      m.toLowerCase().includes("patch")
  );
  const fixPercentage =
    allMessages.length > 0
      ? Math.round((fixMessages.length / allMessages.length) * 100)
      : 0;

  // Average message length
  const averageMessageLength =
    allMessages.length > 0
      ? Math.round(allMessages.reduce((sum, m) => sum + m.length, 0) / allMessages.length)
      : 0;

  // Late night and weekend commits
  let lateNightCommits = 0;
  let weekendCommits = 0;
  const commitDays = new Set<number>();
  const hourlyDistribution = new Array(24).fill(0);

  for (const event of pushEvents) {
    const date = new Date(event.created_at);
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    );
    commitDays.add(dayOfYear);

    if (isLateNight(date)) {
      lateNightCommits++;
    }
    if (isWeekend(date)) {
      weekendCommits++;
    }

    hourlyDistribution[date.getHours()]++;
  }

  // Find last commit date
  let lastCommitDate: string | null = null;
  if (pushEvents.length > 0) {
    const sorted = [...pushEvents].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    lastCommitDate = sorted[0].created_at;
  }

  const activityAnalysis = {
    lateNightPercentage:
      pushEvents.length > 0 ? (lateNightCommits / pushEvents.length) * 100 : 0,
    weekendPercentage:
      pushEvents.length > 0 ? (weekendCommits / pushEvents.length) * 100 : 0,
    lastCommitDaysAgo: lastCommitDate
      ? Math.floor(
          (Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24)
        )
      : null,
    totalCommits: pushEvents.length,
    commitDays,
    hourlyDistribution,
  };

  const activityType = detectActivityType(activityAnalysis);

  return {
    totalEvents,
    pushEvents: pushEvents.length,
    mostCommonMessages,
    fixPercentage,
    averageMessageLength,
    lateNightCommits,
    weekendCommits,
    lastCommitDate,
  };
}

export function generatePatternStats(
  repos: GitHubRepository[],
  reposWithReadme: Map<string, string>
): PatternStats {
  const { count: suspiciousNames, names: suspiciousNameList } =
    detectSuspiciousNames(repos);

  // Calculate average README quality
  let totalReadmeQuality = 0;
  let reposWithReadmeContent = 0;
  for (const repo of repos) {
    if (reposWithReadme.has(repo.full_name)) {
      const quality = calculateReadmeQuality(
        reposWithReadme.get(repo.full_name) ?? null,
        true
      );
      totalReadmeQuality += quality;
      reposWithReadmeContent++;
    }
  }
  const averageReadmeQuality =
    reposWithReadmeContent > 0
      ? Math.round(totalReadmeQuality / reposWithReadmeContent)
      : 0;

  // Use a simplified activity type detection
  const activityType = "sporadic-committer";

  return {
    suspiciousNames,
    suspiciousNameList,
    readmeQuality: averageReadmeQuality,
    activityType,
  };
}

export function generateGitHubAnalysis(
  user: GitHubUser,
  repos: GitHubRepository[],
  events: GitHubEvent[],
  reposWithReadme: Map<string, string>
): GitHubAnalysis {
  const profile = generateProfileStats(user);
  const repositories = generateRepositoryStats(repos);
  const commits = generateCommitStats(events);
  const patterns = generatePatternStats(repos, reposWithReadme);

  const observations = generateObservations({
    suspiciousNames: patterns.suspiciousNames,
    readmeQuality: patterns.readmeQuality,
    activityType: patterns.activityType,
    repoCount: repositories.total,
    abandonedRepos: repositories.abandoned,
    averageStars: repositories.averageStars,
    forkRatio: repositories.forkRatio,
    commitCount: commits.pushEvents,
    fixPercentage: commits.fixPercentage,
    hasMostCommonMessage: commits.mostCommonMessages.length > 0,
    mostCommonMessage: commits.mostCommonMessages[0],
  });

  return {
    profile,
    repositories,
    commits,
    patterns,
    observations,
  };
}