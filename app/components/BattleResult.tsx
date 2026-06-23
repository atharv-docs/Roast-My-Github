"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export type BattleProfile = {
  username: string;
  name: string | null;
  avatar_url: string;
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
  empty_description_count: number;
  weak_description_count: number;
  suspicious_repo_names: string[];
  most_recent_push: string | null;
  portfolio_energy_score: number;
  top_repos: Array<{
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
  }>;
};

export type BattleResultData = {
  profiles: { A: BattleProfile; B: BattleProfile };
  comparison: Record<string, "A" | "B">;
  battle: {
    title: string;
    fighterA: {
      username: string;
      intro: string;
      roastLines: string[];
      score: number;
      biggestCrime: string;
    };
    fighterB: {
      username: string;
      intro: string;
      roastLines: string[];
      score: number;
      biggestCrime: string;
    };
    battleLines: string[];
    winner: {
      username: string;
      reason: string;
      finishingMove: string;
    };
    verdict: string;
  };
};

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value > 999 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function FighterPanel({
  side,
  profile,
  fighter,
  isWinner,
  isLoser,
  delay,
  revealDelay,
}: {
  side: "A" | "B";
  profile: BattleProfile;
  fighter: BattleResultData["battle"]["fighterA"];
  isWinner: boolean;
  isLoser: boolean;
  delay: number;
  revealDelay: number;
}) {
  const stats = [
    ["Repos", profile.public_repos],
    ["Stars", compactNumber(profile.total_stars)],
    ["Stale", profile.stale_repo_count],
    ["Missing READMEs", profile.missing_readme_count],
    ["Top language", profile.top_languages[0]?.language ?? "None"],
  ];

  return (
    <motion.article
      className={`battle-fighter fighter-${side.toLowerCase()}`}
      initial={{ opacity: 0, x: side === "A" ? -32 : 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="fighter-spotlight" aria-hidden="true" />
      {isWinner && (
        <motion.div
          className="fighter-win-outline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: revealDelay, duration: 0.55 }}
          aria-hidden="true"
        />
      )}
      {isLoser && (
        <motion.span
          className="loser-stamp"
          initial={{ opacity: 0, scale: 1.4, rotate: 15 }}
          animate={{ opacity: 1, scale: 1, rotate: 8 }}
          transition={{ delay: revealDelay, type: "spring" }}
        >
          Roasted<br />out
        </motion.span>
      )}
      <span className="fighter-corner">Corner {side}</span>
      <div className="fighter-avatar">
        <Image
          src={profile.avatar_url}
          alt={`${profile.username}'s GitHub avatar`}
          width={132}
          height={132}
          priority
        />
        <span>Fighter {side}</span>
      </div>
      <p className="fighter-label">Entering the roast ring</p>
      <h3>@{profile.username}</h3>
      <p className="fighter-intro">{fighter.intro}</p>
      <div className="fighter-score"><span>Damage taken</span><strong>{fighter.score}</strong><small>/100</small></div>
      <div className="fighter-stats">
        {stats.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
        <div className="fighter-crime">
          <span>Biggest crime</span>
          <strong>{fighter.biggestCrime}</strong>
        </div>
      </div>
    </motion.article>
  );
}

export default function BattleResult({
  result,
  onAgain,
  onCopy,
  onCopyVerdict,
  onDownload,
  isGeneratingCard,
}: {
  result: BattleResultData;
  onAgain: () => void;
  onCopy: () => void;
  onCopyVerdict: () => void;
  onDownload: () => void;
  isGeneratingCard: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const noDelay = Boolean(reduceMotion);
  const aLines = result.battle.fighterA.roastLines;
  const bLines = result.battle.fighterB.roastLines;
  const aStart = noDelay ? 0 : 0.75;
  const bStart = noDelay ? 0 : aStart + aLines.length * 0.16 + 0.65;
  const commentaryStart = noDelay ? 0 : bStart + bLines.length * 0.16 + 0.65;
  const winnerStart = noDelay
    ? 0
    : commentaryStart + result.battle.battleLines.length * 0.18 + 0.8;
  const winnerIsA =
    result.battle.winner.username.toLowerCase() ===
    result.profiles.A.username.toLowerCase();

  return (
    <motion.section
      className="battle-result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      aria-label={`Roast battle between ${result.profiles.A.username} and ${result.profiles.B.username}`}
    >
      <div className="battle-marquee">
        <span className="rule" />
        <div><small>Tonight’s sanctioned main event</small><h2>{result.battle.title}</h2></div>
        <span className="rule" />
      </div>

      <div className="battle-arena">
        <FighterPanel
          side="A"
          profile={result.profiles.A}
          fighter={result.battle.fighterA}
          isWinner={winnerIsA}
          isLoser={!winnerIsA}
          delay={noDelay ? 0 : 0.15}
          revealDelay={winnerStart}
        />
        <motion.div
          className="battle-vs"
          initial={{ opacity: 0, scale: 1.7, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ delay: noDelay ? 0 : 0.45, type: "spring", stiffness: 170 }}
          aria-label="versus"
        >
          <span>VS</span>
          <small>Code decides</small>
        </motion.div>
        <FighterPanel
          side="B"
          profile={result.profiles.B}
          fighter={result.battle.fighterB}
          isWinner={!winnerIsA}
          isLoser={winnerIsA}
          delay={noDelay ? 0 : 0.25}
          revealDelay={winnerStart}
        />
      </div>

      <div className="battle-rounds">
        <div className="battle-round fighter-a-round">
          <div className="round-heading"><span>Round 01</span><strong>@{result.profiles.A.username} takes the mic</strong></div>
          {aLines.map((line, index) => (
            <motion.p key={`${line}-${index}`} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: aStart + index * 0.16 }}>
              <span>{String(index + 1).padStart(2, "0")}</span>{line}
            </motion.p>
          ))}
        </div>
        <div className="battle-round fighter-b-round">
          <div className="round-heading"><span>Round 02</span><strong>@{result.profiles.B.username} fires back</strong></div>
          {bLines.map((line, index) => (
            <motion.p key={`${line}-${index}`} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: bStart + index * 0.16 }}>
              <span>{String(index + 1).padStart(2, "0")}</span>{line}
            </motion.p>
          ))}
        </div>
      </div>

      <div className="battle-commentary">
        <div className="commentary-mic">LIVE</div>
        <div>
          <small>Ringside commentary</small>
          {result.battle.battleLines.map((line, index) => (
            <motion.p key={`${line}-${index}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: commentaryStart + index * 0.18 }}>
              “{line}”
            </motion.p>
          ))}
        </div>
      </div>

      <motion.div
        className="battle-winner"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: winnerStart, duration: 0.65, type: "spring" }}
      >
        <div className="winner-spotlight" aria-hidden="true" />
        <span className="winner-crown">★ Roast battle survivor ★</span>
        <h3>@{result.battle.winner.username}</h3>
        <p>{result.battle.winner.reason}</p>
        <div className="finishing-move"><span>Finishing move</span><strong>{result.battle.winner.finishingMove}</strong></div>
        <blockquote>{result.battle.verdict}</blockquote>
      </motion.div>

      <motion.div className="battle-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: winnerStart }}>
        <button type="button" className="share-button" onClick={onAgain}>Battle Again</button>
        <button type="button" className="share-button battle-download-button" onClick={onDownload} disabled={isGeneratingCard}>
          {isGeneratingCard ? "Developing Fight Poster…" : "Download Battle Card"}
        </button>
        <button type="button" className="copy-button" onClick={onCopyVerdict}>Copy Battle Verdict</button>
        <button type="button" className="copy-button" onClick={onCopy}>Copy Battle Result</button>
      </motion.div>
    </motion.section>
  );
}
