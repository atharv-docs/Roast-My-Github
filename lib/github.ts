type GitHubUser = {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
};

type GitHubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  html_url: string;
};

export type AnalyzedRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  html_url: string;
};

export type GitHubAnalysis = {
  username: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  account_created: string;
  repo_count: number;
  total_stars: number;
  total_forks: number;
  top_languages: Array<{ language: string; count: number }>;
  stale_repo_count: number;
  stale_repo_names: string[];
  missing_readme_count: number;
  missing_readme_repos: string[];
  readme_checked_count: number;
  readme_fetch_error_count: number;
  empty_description_count: number;
  weak_description_count: number;
  weak_description_repo_names: string[];
  suspicious_repo_names: string[];
  most_recent_push: string | null;
  portfolio_energy_score: number;
  portfolio_energy_components: Record<string, number>;
  top_repos: AnalyzedRepo[];
};

export type GitHubAnalysisErrorCode =
  | "USER_NOT_FOUND"
  | "GITHUB_RATE_LIMIT"
  | "GITHUB_ERROR";

export class GitHubAnalysisError extends Error {
  code: GitHubAnalysisErrorCode;
  status: number;
  username: string;

  constructor(
    code: GitHubAnalysisErrorCode,
    message: string,
    username: string,
    status: number,
  ) {
    super(message);
    this.name = "GitHubAnalysisError";
    this.code = code;
    this.status = status;
    this.username = username;
  }
}

export function isValidGitHubUsername(value: string) {
  return /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value);
}

function getGitHubHeaders(): HeadersInit {
  const githubToken = process.env.GITHUB_TOKEN?.trim();
  const hasUsableToken = Boolean(
    githubToken && githubToken !== "github_pat_your_token_here",
  );

  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "github-roaster",
    ...(hasUsableToken ? { Authorization: `Bearer ${githubToken}` } : {}),
  };
}

function hasSuspiciousName(name: string) {
  const normalized = name.toLowerCase().replace(/[_.\s]+/g, "-");
  return /(^|-)(test|demo|final(?:-final)?|new-project|portfolio|todo|practice|clone|tutorial)(-|$)/.test(
    normalized,
  );
}

function upstreamMessage(rawText: string) {
  try {
    const parsed = JSON.parse(rawText) as { message?: string };
    if (typeof parsed.message === "string") return parsed.message;
  } catch {
    // GitHub occasionally returns a non-JSON proxy error.
  }
  return rawText.trim() || "No response body";
}

function isRateLimited(response: Response, rawText: string) {
  return (
    response.status === 429 ||
    (response.status === 403 &&
      (response.headers.get("x-ratelimit-remaining") === "0" ||
        /rate limit/i.test(rawText)))
  );
}

export async function analyzeGitHubUser(
  username: string,
  logPrefix = "[github-analysis]",
): Promise<GitHubAnalysis> {
  const encodedUsername = encodeURIComponent(username);
  const headers = getGitHubHeaders();
  console.info(
    `${logPrefix} GitHub authentication:`,
    "Authorization" in headers ? "token" : "public/unauthenticated",
  );

  let userResponse: Response;
  let reposResponse: Response;
  try {
    [userResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${encodedUsername}`, {
        headers,
        next: { revalidate: 300 },
      }),
      fetch(
        `https://api.github.com/users/${encodedUsername}/repos?sort=updated&per_page=30`,
        { headers, next: { revalidate: 300 } },
      ),
    ]);
  } catch (error) {
    throw new GitHubAnalysisError(
      "GITHUB_ERROR",
      error instanceof Error ? error.message : String(error),
      username,
      502,
    );
  }

  console.info(`${logPrefix} GitHub profile fetch status:`, userResponse.status);
  console.info(`${logPrefix} GitHub repos fetch status:`, reposResponse.status);

  if (userResponse.status === 404 || reposResponse.status === 404) {
    throw new GitHubAnalysisError(
      "USER_NOT_FOUND",
      `GitHub user @${username} was not found`,
      username,
      404,
    );
  }

  if (!userResponse.ok || !reposResponse.ok) {
    const [rawUserError, rawReposError] = await Promise.all([
      userResponse.ok ? Promise.resolve("") : userResponse.text(),
      reposResponse.ok ? Promise.resolve("") : reposResponse.text(),
    ]);
    if (
      isRateLimited(userResponse, rawUserError) ||
      isRateLimited(reposResponse, rawReposError)
    ) {
      throw new GitHubAnalysisError(
        "GITHUB_RATE_LIMIT",
        "GitHub API rate limit reached. Add a valid GITHUB_TOKEN or wait for the limit to reset.",
        username,
        429,
      );
    }
    throw new GitHubAnalysisError(
      "GITHUB_ERROR",
      `GitHub profile returned ${userResponse.status}: ${upstreamMessage(rawUserError)}; repos returned ${reposResponse.status}: ${upstreamMessage(rawReposError)}`,
      username,
      502,
    );
  }

  const user = (await userResponse.json()) as GitHubUser;
  const repos = (await reposResponse.json()) as GitHubRepo[];
  const staleBefore = Date.now() - 180 * 24 * 60 * 60 * 1000;

  const languageCounts = repos.reduce<Record<string, number>>((counts, repo) => {
    if (repo.language) counts[repo.language] = (counts[repo.language] ?? 0) + 1;
    return counts;
  }, {});
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([language, count]) => ({ language, count }));

  const topRepoRecords = [...repos]
    .sort((a, b) => {
      const starDifference = b.stargazers_count - a.stargazers_count;
      return starDifference || Date.parse(b.updated_at) - Date.parse(a.updated_at);
    })
    .slice(0, 10);

  console.info(
    `${logPrefix} Checking README evidence for ${topRepoRecords.length} repositories belonging to @${user.login}`,
  );
  const readmeChecks = await Promise.all(
    topRepoRecords.map(async (repo) => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(user.login)}/${encodeURIComponent(repo.name)}/readme`,
          { headers, next: { revalidate: 300 } },
        );
        return { name: repo.name, status: response.status };
      } catch (error) {
        console.error(`${logPrefix} README check failed for ${repo.name}:`, error);
        return { name: repo.name, status: 0 };
      }
    }),
  );

  const missingReadmeRepos = readmeChecks
    .filter((check) => check.status === 404)
    .map((check) => check.name);
  const readmePresentCount = readmeChecks.filter((check) => check.status === 200).length;
  const completedReadmeChecks = readmePresentCount + missingReadmeRepos.length;
  const readmeFetchErrorCount = readmeChecks.length - completedReadmeChecks;
  const staleRepos = repos.filter(
    (repo) => !repo.pushed_at || Date.parse(repo.pushed_at) < staleBefore,
  );
  const emptyDescriptionRepos = repos.filter((repo) => !repo.description?.trim());
  const weakDescriptionRepos = repos.filter(
    (repo) => !repo.description || repo.description.trim().length < 24,
  );
  const suspiciousRepoNames = repos
    .filter((repo) => hasSuspiciousName(repo.name))
    .map((repo) => repo.name);
  const totalStars = repos.reduce((total, repo) => total + repo.stargazers_count, 0);
  const totalForks = repos.reduce((total, repo) => total + repo.forks_count, 0);
  const mostRecentPush = repos.reduce<string | null>((latest, repo) => {
    if (!repo.pushed_at) return latest;
    if (!latest || Date.parse(repo.pushed_at) > Date.parse(latest)) return repo.pushed_at;
    return latest;
  }, null);

  const repoCount = repos.length;
  const freshnessRatio = repoCount ? 1 - staleRepos.length / repoCount : 0;
  const descriptionRatio = repoCount
    ? 1 - weakDescriptionRepos.length / repoCount
    : 0;
  const readmeRatio = completedReadmeChecks
    ? readmePresentCount / completedReadmeChecks
    : 0;
  const scoreParts = {
    publicRepos: Math.min(user.public_repos / 20, 1) * 15,
    freshness: freshnessRatio * 20,
    readmes: readmeRatio * 20,
    stars: Math.min(Math.log10(totalStars + 1) / 3, 1) * 15,
    languageVariety: Math.min(topLanguages.length / 5, 1) * 15,
    descriptions: descriptionRatio * 15,
  };
  const portfolioEnergyScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(Object.values(scoreParts).reduce((total, part) => total + part, 0)),
    ),
  );

  console.info(
    `${logPrefix} README evidence for @${user.login}: ${missingReadmeRepos.length} missing, ${readmePresentCount} present, ${readmeFetchErrorCount} unavailable`,
  );

  return {
    username: user.login,
    name: user.name,
    avatar_url: user.avatar_url,
    html_url: user.html_url,
    bio: user.bio,
    followers: user.followers,
    following: user.following,
    public_repos: user.public_repos,
    account_created: user.created_at,
    repo_count: repoCount,
    total_stars: totalStars,
    total_forks: totalForks,
    top_languages: topLanguages,
    stale_repo_count: staleRepos.length,
    stale_repo_names: staleRepos.map((repo) => repo.name),
    missing_readme_count: missingReadmeRepos.length,
    missing_readme_repos: missingReadmeRepos,
    readme_checked_count: completedReadmeChecks,
    readme_fetch_error_count: readmeFetchErrorCount,
    empty_description_count: emptyDescriptionRepos.length,
    weak_description_count: weakDescriptionRepos.length,
    weak_description_repo_names: weakDescriptionRepos.map((repo) => repo.name),
    suspicious_repo_names: suspiciousRepoNames,
    most_recent_push: mostRecentPush,
    portfolio_energy_score: portfolioEnergyScore,
    portfolio_energy_components: Object.fromEntries(
      Object.entries(scoreParts).map(([key, value]) => [key, Math.round(value)]),
    ),
    top_repos: topRepoRecords.map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      html_url: repo.html_url,
    })),
  };
}
