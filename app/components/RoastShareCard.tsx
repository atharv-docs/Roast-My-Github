"use client";

import Image from "next/image";
import { forwardRef } from "react";

type RoastShareCardProps = {
  avatar_url: string;
  username: string;
  score: number;
  savageLines: string[];
};

const RoastShareCard = forwardRef<HTMLDivElement, RoastShareCardProps>(
  ({ avatar_url, username, score, savageLines }, ref) => {
    return (
      <div className="share-card-host" aria-hidden="true">
        <div className="share-card-capture" ref={ref}>
          <div className="share-card-noise" />
          <div className="share-card-spotlight" />
          <div className="share-card-topline">
            <div className="share-card-brand">
              <span className="share-card-brand-mark">GH</span>
              <span>GitHub <strong>Roaster</strong></span>
            </div>
            <span className="share-card-case">Public code crimes division · Case closed</span>
          </div>

          <div className="share-card-body">
            <div className="share-card-profile">
              <div className="share-card-avatar-ring">
                <Image
                  src={avatar_url}
                  alt=""
                  width={190}
                  height={190}
                  priority
                />
                <span>Exhibit A</span>
              </div>
              <p>The defendant</p>
              <h2>@{username}</h2>
              <div className="share-card-score">
                <span>Roastability</span>
                <strong>{score}</strong>
                <small>/100</small>
              </div>
            </div>

            <div className="share-card-roasts">
              <div className="share-card-roasts-heading">
                <span>🔥</span>
                <div>
                  <small>Selected court transcript</small>
                  <h3>No Mercy Round</h3>
                </div>
              </div>
              <div className="share-card-lines">
                {savageLines.slice(0, 3).map((line, index) => (
                  <div className="share-card-line" key={`${line}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>“{line}”</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="share-card-footer">
            <span>Roasted by GitHub Roaster</span>
            <span>Public evidence. Artificial intelligence. Natural disrespect.</span>
          </div>
        </div>
      </div>
    );
  },
);

RoastShareCard.displayName = "RoastShareCard";

export default RoastShareCard;
