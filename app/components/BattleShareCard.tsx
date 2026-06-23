"use client";

import Image from "next/image";
import { forwardRef } from "react";

export type BattleShareCardProps = {
  fighterAAvatar: string;
  fighterAUsername: string;
  fighterAScore: number;
  fighterABiggestCrime: string;
  fighterATopRoastLine: string;
  fighterBAvatar: string;
  fighterBUsername: string;
  fighterBScore: number;
  fighterBBiggestCrime: string;
  fighterBTopRoastLine: string;
  winnerUsername: string;
  winnerReason: string;
  winnerFinishingMove: string;
  finalVerdict: string;
};

function truncate(value: string, limit: number) {
  if (value.length <= limit) return value;
  const clipped = value.slice(0, limit - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > limit * 0.7 ? lastSpace : clipped.length).trim()}…`;
}

const BattleShareCard = forwardRef<HTMLDivElement, BattleShareCardProps>(
  (
    {
      fighterAAvatar,
      fighterAUsername,
      fighterAScore,
      fighterABiggestCrime,
      fighterATopRoastLine,
      fighterBAvatar,
      fighterBUsername,
      fighterBScore,
      fighterBBiggestCrime,
      fighterBTopRoastLine,
      winnerUsername,
      winnerReason,
      winnerFinishingMove,
      finalVerdict,
    },
    ref,
  ) => {
    const winnerIsA = winnerUsername.toLowerCase() === fighterAUsername.toLowerCase();

    const fighter = (
      side: "A" | "B",
      avatar: string,
      username: string,
      score: number,
      biggestCrime: string,
      roastLine: string,
      isWinner: boolean,
    ) => (
      <section className={`battle-share-fighter battle-share-fighter-${side.toLowerCase()}${isWinner ? " is-winner" : ""}`}>
        <span className="battle-share-corner">Corner {side}</span>
        {isWinner && <span className="battle-share-winner-stamp">Winner</span>}
        <div className="battle-share-avatar">
          <Image src={avatar} alt="" width={178} height={178} unoptimized priority />
        </div>
        <h2>@{truncate(username, 22)}</h2>
        <div className="battle-share-score">
          <span>Roast damage</span>
          <strong>{score}</strong>
          <small>/100</small>
        </div>
        <div className="battle-share-crime">
          <span>Biggest crime</span>
          <p>{truncate(biggestCrime, 88)}</p>
        </div>
        <blockquote>“{truncate(roastLine, 155)}”</blockquote>
      </section>
    );

    return (
      <div className="battle-share-card-host" aria-hidden="true">
        <div className="battle-share-card" ref={ref}>
          <div className="battle-share-texture" />
          <div className="battle-share-vignette" />
          <div className="battle-share-spotlight spotlight-a" />
          <div className="battle-share-spotlight spotlight-b" />

          <header className="battle-share-header">
            <div className="battle-share-brand"><span>GH</span> GitHub Roaster</div>
            <p>Tonight’s sanctioned main event</p>
            <h1>GitHub Roast Battle</h1>
            <div className="battle-share-rule"><span /> Public code crimes division <span /></div>
          </header>

          <div className="battle-share-matchup">
            {fighter("A", fighterAAvatar, fighterAUsername, fighterAScore, fighterABiggestCrime, fighterATopRoastLine, winnerIsA)}
            <div className="battle-share-vs"><strong>VS</strong><span>Code decides</span></div>
            {fighter("B", fighterBAvatar, fighterBUsername, fighterBScore, fighterBBiggestCrime, fighterBTopRoastLine, !winnerIsA)}
          </div>

          <section className="battle-share-verdict">
            <span className="battle-share-survivor">★ Roast battle survivor ★</span>
            <div className="battle-share-verdict-title">
              <small>Winner</small>
              <h3>@{truncate(winnerUsername, 22)}</h3>
            </div>
            <p>{truncate(winnerReason, 185)}</p>
            <div className="battle-share-finisher">
              <span>Finishing move</span>
              <strong>{truncate(winnerFinishingMove, 86)}</strong>
            </div>
            <blockquote>{truncate(finalVerdict, 170)}</blockquote>
          </section>

          <footer className="battle-share-footer">
            <span>Roasted by GitHub Roaster</span>
            <span>Public evidence · Artificial intelligence · Natural disrespect</span>
          </footer>
        </div>
      </div>
    );
  },
);

BattleShareCard.displayName = "BattleShareCard";

export default BattleShareCard;
