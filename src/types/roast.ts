export interface ProfileStats {
  username: string;
  followers: number;
  following: number;
  publicRepos: number;
  accountAgeYears: number;
  avatarUrl: string;
  name: string | null;
}

export interface RepositoryStats {
  total: number;
  forks: number;
  stars: number;
  withReadme: number;
  withoutReadme: number;
  abandoned: number;
  archived: number;
  averageStars: number;
  averageSize: number;
  topLanguages: string[];
  forkRatio: number;
  totalSize: number;
}

export interface CommitStats {
  totalEvents: number;
  pushEvents: number;
  mostCommonMessages: string[];
  fixPercentage: number;
  averageMessageLength: number;
  lateNightCommits: number;
  weekendCommits: number;
  lastCommitDate: string | null;
}

export interface PatternStats {
  suspiciousNames: number;
  suspiciousNameList: string[];
  readmeQuality: number;
  activityType: string;
}

export interface GitHubAnalysis {
  profile: ProfileStats;
  repositories: RepositoryStats;
  commits: CommitStats;
  patterns: PatternStats;
  observations: string[];
}

export interface OpeningBurn {
  text: string;
}

export interface TopRoast {
  number: number;
  text: string;
  data: string;
}

export interface DeveloperAward {
  icon: string;
  title: string;
  description: string;
}

export interface PersonalityScore {
  name: string;
  score: number;
  maxScore: number;
  explanation: string;
}

export interface FinalVerdict {
  text: string;
}

export interface RoastResult {
  openingBurn: OpeningBurn;
  topRoasts: TopRoast[];
  developerAwards: DeveloperAward[];
  personalityScores: PersonalityScore[];
  finalVerdict: FinalVerdict;
  roastScore: number;
  generatedAt: string;
}

export interface RoastResponse {
  roast: RoastResult;
  analysis: GitHubAnalysis;
  cached: boolean;
}

export const LOADING_MESSAGES = [
  "Inspecting commit crimes...",
  "Counting abandoned dreams...",
  "Reading README excuses...",
  "Looking for unit tests...",
  "Analyzing your naming disasters...",
  "Checking for 'final-final' repositories...",
  "Calculating your debug-to-code ratio...",
  "Judging your commit messages...",
  "Looking for evidence of testing...",
  "Drafting the perfect roast...",
  "Adding extra spice...",
  "Polishing the burns...",
] as const;

export type LoadingMessage = (typeof LOADING_MESSAGES)[number];