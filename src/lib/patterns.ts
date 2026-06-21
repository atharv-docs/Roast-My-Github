const SUSPICIOUS_PATTERNS = [
  "test",
  "testing",
  "new",
  "new2",
  "copy",
  "copy-final",
  "actual-final",
  "real-final",
  "temp",
  "demo",
  "project2",
  "backup",
  "final",
  "final-final",
  "v1",
  "v2",
  "v3",
  "old",
  "archived",
  "unused",
  "scratch",
  "practice",
  "learning",
  "experiment",
  "wip",
  "draft",
  "junk",
  "trash",
  "archive",
  "playground",
];

export function detectSuspiciousNames(repos: Array<{ name: string }>): {
  count: number;
  names: string[];
} {
  const suspiciousNames: string[] = [];

  for (const repo of repos) {
    const nameLower = repo.name.toLowerCase();
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (nameLower.includes(pattern)) {
        suspiciousNames.push(repo.name);
        break;
      }
    }
  }

  return {
    count: suspiciousNames.length,
    names: suspiciousNames,
  };
}

export function calculateReadmeQuality(
  readme: string | null,
  hasReadme: boolean
): number {
  if (!hasReadme || !readme) return 0;

  let score = 0;
  const content = readme.toLowerCase();

  // Length scoring (optimal: 500-3000 chars)
  if (readme.length >= 500 && readme.length <= 3000) {
    score += 30;
  } else if (readme.length > 3000) {
    score += 20;
  } else if (readme.length > 200) {
    score += 15;
  } else {
    score += 5;
  }

  // Required sections
  const sections = ["install", "setup", "usage", "example", "getting started"];
  for (const section of sections) {
    if (content.includes(section)) {
      score += 10;
    }
  }

  // Badges
  if (content.includes("badge") || content.includes(" shields")) {
    score += 10;
  }

  // Code blocks
  const codeBlockCount = (readme.match(/```/g) || []).length;
  if (codeBlockCount >= 2) {
    score += 10;
  }

  return Math.min(score, 100);
}

type ActivityType =
  | "weekend-warrior"
  | "deadline-programmer"
  | "open-source-ghost"
  | "one-week-wonder"
  | "code-archaeologist"
  | "consistent-contributor"
  | "night-owl"
  | "sporadic-committer";

interface ActivityAnalysis {
  lateNightPercentage: number;
  weekendPercentage: number;
  lastCommitDaysAgo: number | null;
  totalCommits: number;
  commitDays: Set<number>;
  hourlyDistribution: number[];
}

export function detectActivityType(analysis: ActivityAnalysis): ActivityType {
  const { lateNightPercentage, weekendPercentage, lastCommitDaysAgo, totalCommits } = analysis;

  // Code archaeologist - no commits in 6+ months
  if (lastCommitDaysAgo !== null && lastCommitDaysAgo > 180) {
    return "code-archaeologist";
  }

  // One-week wonder - lots of activity then nothing
  if (lastCommitDaysAgo !== null && lastCommitDaysAgo > 30 && totalCommits > 50) {
    return "one-week-wonder";
  }

  // Weekend warrior - mostly weekend commits
  if (weekendPercentage > 70 && totalCommits > 20) {
    return "weekend-warrior";
  }

  // Night owl - mostly late night
  if (lateNightPercentage > 50 && totalCommits > 20) {
    return "night-owl";
  }

  // Deadline programmer - spikes at end of month (simplified check)
  const recentCommits = Array.from(analysis.commitDays).slice(-10);
  if (recentCommits.length > 5 && analysis.hourlyDistribution[0] > 5) {
    return "deadline-programmer";
  }

  // Open source ghost - many forks but low original activity
  // (This would need more data, simplified here)

  // Consistent contributor
  if (totalCommits > 100 && weekendPercentage < 40 && lateNightPercentage < 30) {
    return "consistent-contributor";
  }

  return "sporadic-committer";
}

export function generateObservations(
  analysis: {
    suspiciousNames: number;
    readmeQuality: number;
    activityType: string;
    repoCount: number;
    abandonedRepos: number;
    averageStars: number;
    forkRatio: number;
    commitCount: number;
    fixPercentage: number;
    hasMostCommonMessage: boolean;
    mostCommonMessage?: string;
  }): string[] {
  const observations: string[] = [];

  if (analysis.suspiciousNames > 5) {
    observations.push(
      `You have ${analysis.suspiciousNames} repositories with suspicious names like "test", "new", or "final"`
    );
  }

  if (analysis.readmeQuality < 30 && analysis.repoCount > 3) {
    observations.push("Your README game needs work - most of your repos lack documentation");
  }

  if (analysis.abandonedRepos > analysis.repoCount * 0.5 && analysis.repoCount > 5) {
    observations.push(
      `Over half your ${analysis.repoCount} repositories are abandoned - digital cemeteries!`
    );
  }

  if (analysis.averageStars < 1 && analysis.repoCount > 10) {
    observations.push("Your repos are collecting dust - zero stars to show for all that code");
  }

  if (analysis.forkRatio > 0.7 && analysis.repoCount > 5) {
    observations.push("You fork more than you create - the ultimate digital borrower");
  }

  if (analysis.commitCount > 100 && analysis.fixPercentage > 50) {
    observations.push(
      `Your commit history is 80% fixes - maybe try writing bug-free code for once?`
    );
  }

  if (analysis.mostCommonMessage) {
    const msg = analysis.mostCommonMessage.toLowerCase();
    if (msg === "fix" || msg === "fixes" || msg === "fixed") {
      observations.push(`Your most common commit is "${msg}" - we get it, things break`);
    } else if (msg.includes("update") && msg.length < 10) {
      observations.push(`"${analysis.mostCommonMessage}" - the most generic commit message in existence`);
    }
  }

  switch (analysis.activityType) {
    case "weekend-warrior":
      observations.push("You're a weekend-only warrior - code sleeps when you do");
      break;
    case "night-owl":
      observations.push("You code when normal people sleep - either genius or just can't sleep");
      break;
    case "code-archaeologist":
      observations.push("Your last commit was made in a previous era of coding");
      break;
    case "one-week-wonder":
      observations.push("You start projects faster than you finish them - classic starter, never finisher");
      break;
    case "sporadic-committer":
      observations.push("Your commit history is as unpredictable as your sleep schedule");
      break;
  }

  if (observations.length < 3) {
    observations.push("At least your GitHub is... something. That's something, right?");
  }

  return observations;
}