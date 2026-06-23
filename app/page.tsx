"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FormEvent, useEffect, useRef, useState } from "react";
import BattleResult, { BattleResultData } from "./components/BattleResult";
import BattleShareCard from "./components/BattleShareCard";
import RoastShareCard from "./components/RoastShareCard";

const soloLoadingMessages = [
  "Auditing commit history…",
  "Counting abandoned side projects…",
  "Inspecting README crimes…",
  "Checking if HTML is carrying the whole portfolio…",
  "Asking Groq if this profile deserves mercy…",
];

const battleLoadingMessages = [
  "Comparing abandoned dreams…",
  "Measuring README damage…",
  "Checking who committed less to their commitments…",
  "Calculating open-source emotional damage…",
  "Preparing the knockout verdict…",
];

type RoastResult = {
  profile: {
    username: string;
    name: string | null;
    bio: string | null;
    avatarUrl: string;
    githubUrl: string;
    followers: number;
    following: number;
    publicRepos: number;
    topLanguages: string[];
  };
  evidence: {
    publicRepos: number;
    reposAnalyzed: number;
    topLanguage: string;
    languageBreakdown: Array<{ language: string; count: number }>;
    staleRepos: number;
    staleRepoNames: string[];
    missingReadmes: number;
    missingReadmeRepos: string[];
    readmesChecked: number;
    totalStars: number;
    portfolioEnergyScore: number;
  };
  roast: {
    intro: string;
    lines: string[];
    savageLines: string[];
    verdict: string;
    score: number;
  };
};

type ApiError = {
  code?: string;
  error?: string;
  developerError?: string;
  failedUsername?: string;
  rawGroqText?: string;
};

const errorMessages: Record<string, string> = {
  USER_NOT_FOUND: "This GitHub user is so inactive even GitHub forgot them.",
  GROQ_ERROR: "The comedian choked on stage. Try again.",
  GITHUB_ERROR: "GitHub locked the evidence room. Give it another shot.",
  GITHUB_RATE_LIMIT: "GitHub called a timeout. The API rate limit needs a breather.",
  INVALID_USERNAME: "Enter a real GitHub username. The court rejects imaginary defendants.",
};

function GithubMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.95.1-.75.4-1.25.73-1.54-2.57-.3-5.27-1.29-5.27-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18A10.99 10.99 0 0 1 12 6.1c.98 0 1.95.13 2.86.38 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.28 5.69.42.36.78 1.06.78 2.13v3.28c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

function FlameIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M13.4 2.5c.4 3.4-2.1 4.8-3.6 6.6-1.3 1.6-1 3.5.3 4.5-.1-2.2 1.1-3.6 2.5-4.8-.2 2.6 2.4 3.8 2.4 6.3 0 1.8-1.2 3.4-3 4-2.9-.5-5-2.7-5-5.6 0-4.1 3.7-5.6 6.4-11Z" fill="currentColor" />
      <path d="M14.9 7.4c2.6 1.8 4.1 4.2 4.1 6.7 0 3.8-3.1 6.9-7 6.9-.8 0-1.5-.1-2.2-.4 4.2-.1 7.1-2.5 7.1-5.8 0-2.2-1.5-3.8-2-7.4Z" fill="currentColor" opacity=".55" />
    </svg>
  );
}

function GavelIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m14.5 5.5 4 4M6 14l4 4m-2-2 8.5-8.5M3 21h12M12 3l6 6-3 3-6-6 3-3Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="stat">
      <strong>{new Intl.NumberFormat("en", { notation: value > 999 ? "compact" : "standard" }).format(value)}</strong>
      <span>{label}</span>
    </div>
  );
}

function LoadingAct({
  messageIndex,
  messages,
  battleMode,
}: {
  messageIndex: number;
  messages: string[];
  battleMode: boolean;
}) {
  return (
    <motion.section
      className="loading-act"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      aria-live="polite"
      aria-label={battleMode ? "Preparing roast battle" : "Preparing roast"}
    >
      <div className="loading-spotlight" />
      <div className="mic-wrap" aria-hidden="true">
        <div className="sound-wave wave-left" />
        <div className="mic">
          <span className="mic-grid" />
          <span className="mic-stem" />
          <span className="mic-base" />
        </div>
        <div className="sound-wave wave-right" />
      </div>
      <div className="loading-kicker">{battleMode ? "The fighters are under review" : "The investigation is underway"}</div>
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.32 }}
        >
          {messages[messageIndex]}
        </motion.p>
      </AnimatePresence>
      <div className="progress-track"><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 8, ease: "easeInOut" }} /></div>
      <span className="loading-note">{battleMode ? "Two profiles entered. Their READMEs may not leave intact." : "No repositories were harmed. Their dignity is another matter."}</span>
    </motion.section>
  );
}

function EvidenceBoard({
  evidence,
  reduceMotion,
}: {
  evidence: RoastResult["evidence"];
  reduceMotion: boolean;
}) {
  const topLanguageCount = evidence.languageBreakdown[0]?.count ?? 0;
  const cards = [
    {
      label: "Public repos",
      value: evidence.publicRepos,
      note: `${evidence.reposAnalyzed} inspected`,
    },
    {
      label: "Top language",
      value: evidence.topLanguage,
      note: topLanguageCount ? `${topLanguageCount} primary-language repos` : "No language declared",
    },
    {
      label: "Stale repos",
      value: evidence.staleRepos,
      note: "No push in 180+ days",
      danger: evidence.staleRepos > 0,
    },
    {
      label: "Missing READMEs",
      value: evidence.missingReadmes,
      note: `Of ${evidence.readmesChecked} checked`,
      danger: evidence.missingReadmes > 0,
    },
    {
      label: "Total stars",
      value: evidence.totalStars,
      note: "Across inspected repos",
    },
    {
      label: "Portfolio energy",
      value: `${evidence.portfolioEnergyScore}/100`,
      note: "For comedy use only",
      energy: true,
    },
  ];

  return (
    <section className="evidence-board" aria-labelledby="evidence-board-title">
      <div className="evidence-board-light" aria-hidden="true" />
      <div className="evidence-board-heading">
        <span className="evidence-pin" aria-hidden="true" />
        <div>
          <p>Evidence locker · Intake complete</p>
          <h3 id="evidence-board-title">Evidence Board</h3>
        </div>
        <span className="evidence-case-number">Case #{String(evidence.publicRepos).padStart(3, "0")}</span>
      </div>
      <div className="evidence-grid" role="list">
        {cards.map((card, index) => (
          <motion.article
            className={`evidence-card${card.danger ? " evidence-card-danger" : ""}${card.energy ? " evidence-card-energy" : ""}`}
            key={card.label}
            role="listitem"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18, rotate: reduceMotion ? 0 : index % 2 ? 0.7 : -0.7 }}
            animate={{ opacity: 1, y: 0, rotate: index % 2 ? 0.35 : -0.35 }}
            transition={{ delay: reduceMotion ? 0 : 0.42 + index * 0.08, duration: reduceMotion ? 0 : 0.38 }}
          >
            <span className="tag-hole" aria-hidden="true" />
            <small>Evidence {String(index + 1).padStart(2, "0")}</small>
            <strong>{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</strong>
            <p>{card.label}</p>
            <em>{card.note}</em>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function RoastReveal({
  result,
  onShare,
  onCopy,
  isGenerating,
}: {
  result: RoastResult;
  onShare: () => void;
  onCopy: () => void;
  isGenerating: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const lineTransition = (index: number) => ({
    duration: reduceMotion ? 0 : 0.45,
    delay: reduceMotion ? 0 : 0.3 + index * 0.14,
  });
  const allLines = [...result.roast.lines, ...result.roast.savageLines];

  return (
    <motion.section
      className="reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      aria-label={`Roast for ${result.profile.username}`}
    >
      <div className="reveal-heading">
        <span className="rule" />
        <span className="eyebrow"><span className="live-dot" /> The verdict is in</span>
        <span className="rule" />
      </div>

      <div className="profile-stage">
        <div className="spotlight-cone" aria-hidden="true" />
        <motion.div
          className="avatar-frame"
          initial={{ opacity: 0, scale: 0.76, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.15 }}
        >
          <Image src={result.profile.avatarUrl} alt={`${result.profile.username}'s GitHub avatar`} width={144} height={144} priority />
          <span className="evidence-tag">Exhibit A</span>
        </motion.div>
        <motion.div className="profile-copy" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <p>Defendant</p>
          <h2>@{result.profile.username}</h2>
          {result.profile.name && <span className="real-name">also known as {result.profile.name}</span>}
          {result.profile.bio && <blockquote>“{result.profile.bio}”</blockquote>}
        </motion.div>
        <motion.div className="stats-strip" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <Stat value={result.profile.publicRepos} label="Public repos" />
          <Stat value={result.profile.followers} label="Followers" />
          <Stat value={result.profile.following} label="Following" />
          <div className="language-stat">
            <span>Known weapons</span>
            <strong>{result.profile.topLanguages.slice(0, 3).join(" · ") || "Undisclosed"}</strong>
          </div>
        </motion.div>
      </div>

      <EvidenceBoard evidence={result.evidence} reduceMotion={Boolean(reduceMotion)} />

      <div className="roast-card">
        <div className="card-corner corner-one" />
        <div className="card-corner corner-two" />
        <div className="transcript-label">Official court transcript</div>
        <motion.p
          className="intro-line"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={lineTransition(0)}
        >
          {result.roast.intro}
        </motion.p>

        <div className="roast-lines">
          {result.roast.lines.map((line, index) => (
            <motion.div
              className="roast-line"
              key={`${line}-${index}`}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={lineTransition(index + 1)}
            >
              <span className="line-number">{String(index + 1).padStart(2, "0")}</span>
              <p>{line}</p>
            </motion.div>
          ))}
        </div>

        <div className="savage-section">
          <div className="savage-heading"><FlameIcon /> No mercy round</div>
          {result.roast.savageLines.map((line, index) => (
            <motion.p
              className="savage-line"
              key={`${line}-${index}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={lineTransition(result.roast.lines.length + index + 1)}
            >
              “{line}”
            </motion.p>
          ))}
        </div>

        <motion.div
          className="verdict"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={lineTransition(allLines.length + 1)}
        >
          <div className="score-seal">
            <span>Roastability</span>
            <strong>{result.roast.score}</strong>
            <small>/ 100</small>
          </div>
          <div className="verdict-copy">
            <span>Final verdict</span>
            <p>{result.roast.verdict}</p>
          </div>
          <div className="case-stamp">Case<br />closed</div>
        </motion.div>
      </div>

      <motion.div className="reveal-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduceMotion ? 0 : 1.2 }}>
        <button type="button" className="share-button" onClick={onShare} disabled={isGenerating}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 12v7a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {isGenerating ? "Developing Evidence…" : "Share the Shame"}
        </button>
        <button type="button" className="copy-button" onClick={onCopy}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Copy Roast Text
        </button>
        <a className="github-link" href={result.profile.githubUrl} target="_blank" rel="noreferrer">View the crime scene ↗</a>
      </motion.div>
    </motion.section>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"solo" | "battle">("solo");
  const [username, setUsername] = useState("");
  const [usernameA, setUsernameA] = useState("");
  const [usernameB, setUsernameB] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [error, setError] = useState("");
  const [developerError, setDeveloperError] = useState("");
  const [result, setResult] = useState<RoastResult | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResultData | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [isGeneratingBattleCard, setIsGeneratingBattleCard] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const outcomeRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const battleShareCardRef = useRef<HTMLDivElement>(null);
  const activeLoadingMessages = mode === "battle" ? battleLoadingMessages : soloLoadingMessages;

  useEffect(() => {
    if (!isLoading) return;
    const interval = window.setInterval(() => {
      setLoadingIndex((current) => (current + 1) % activeLoadingMessages.length);
    }, 1650);
    return () => window.clearInterval(interval);
  }, [activeLoadingMessages.length, isLoading]);

  useEffect(() => {
    if ((isLoading || result || battleResult || error) && outcomeRef.current) {
      const timer = window.setTimeout(() => outcomeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      return () => window.clearTimeout(timer);
    }
  }, [isLoading, result, battleResult, error]);

  function changeMode(nextMode: "solo" | "battle") {
    if (isLoading || nextMode === mode) return;
    setMode(nextMode);
    setError("");
    setDeveloperError("");
    setResult(null);
    setBattleResult(null);
    setToastMessage("");
    setLoadingIndex(0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = username.trim().replace(/^@/, "");
    const trimmedA = usernameA.trim().replace(/^@/, "");
    const trimmedB = usernameB.trim().replace(/^@/, "");

    if (mode === "solo" && !trimmed) {
      setError("Enter a username first. The witness stand is currently empty.");
      setDeveloperError("");
      setResult(null);
      return;
    }
    if (mode === "battle" && (!trimmedA || !trimmedB)) {
      setError("Two suspects are required. A battle with one fighter is just a monologue.");
      setDeveloperError("");
      setBattleResult(null);
      return;
    }
    if (mode === "battle" && trimmedA.toLowerCase() === trimmedB.toLowerCase()) {
      setError("A profile cannot fight itself. That is called debugging.");
      setDeveloperError("");
      setBattleResult(null);
      return;
    }

    if (mode === "solo") setUsername(trimmed);
    else {
      setUsernameA(trimmedA);
      setUsernameB(trimmedB);
    }
    setError("");
    setDeveloperError("");
    setResult(null);
    setBattleResult(null);
    setToastMessage("");
    setLoadingIndex(0);
    setIsLoading(true);

    try {
      const isBattle = mode === "battle";
      const response = await fetch(isBattle ? "/api/battle" : "/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isBattle
            ? { usernameA: trimmedA, usernameB: trimmedB }
            : { username: trimmed },
        ),
      });
      const data = (await response.json()) as RoastResult | BattleResultData | ApiError;

      const hasExpectedResult = isBattle ? "battle" in data : "roast" in data;
      if (!response.ok || !hasExpectedResult) {
        const apiError = data as ApiError;
        const code = apiError.code ?? "GROQ_ERROR";
        const funnyBattleError =
          code === "GROQ_ERROR"
            ? "The ringside comedian dropped the mic on their own foot. Try again."
            : apiError.error;
        setError(
          isBattle
            ? funnyBattleError ?? errorMessages[code] ?? errorMessages.GITHUB_ERROR
            : errorMessages[code] ?? errorMessages.GROQ_ERROR,
        );
        if (process.env.NODE_ENV === "development") {
          const detail = apiError.developerError ?? apiError.error ?? `API returned HTTP ${response.status}`;
          const raw = apiError.rawGroqText ? `\n\nRaw Groq text:\n${apiError.rawGroqText}` : "";
          setDeveloperError(`${detail}${raw}`);
        }
        return;
      }

      if (isBattle) setBattleResult(data as BattleResultData);
      else setResult(data as RoastResult);
    } catch (requestError) {
      setError(
        mode === "battle"
          ? "The ringside comedian dropped the mic on their own foot. Try again."
          : errorMessages.GROQ_ERROR,
      );
      if (process.env.NODE_ENV === "development") {
        setDeveloperError(requestError instanceof Error ? requestError.message : String(requestError));
      }
    } finally {
      setIsLoading(false);
    }
  }

  function getRoastText() {
    if (!result) return;
    return [
      `GitHub Roaster put @${result.profile.username} on trial:`,
      result.roast.intro,
      ...result.roast.lines,
      ...result.roast.savageLines,
      `VERDICT: ${result.roast.verdict}`,
      `Roastability: ${result.roast.score}/100`,
      `Evidence: ${result.evidence.staleRepos} stale repos, ${result.evidence.missingReadmes} missing READMEs, ${result.evidence.totalStars} stars, ${result.evidence.portfolioEnergyScore}/100 portfolio energy.`,
    ].join("\n\n");
  }

  function showToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 2400);
  }

  async function handleCopyRoast() {
    const text = getRoastText();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast("Roast text copied to clipboard");
    } catch {
      setError("The clipboard pleaded the fifth. Copy the roast manually.");
    }
  }

  async function handleCopyBattle() {
    if (!battleResult) return;
    const battle = battleResult.battle;
    const text = [
      `${battle.title}: @${battle.fighterA.username} vs @${battle.fighterB.username}`,
      `@${battle.fighterA.username} — ${battle.fighterA.biggestCrime} (${battle.fighterA.score}/100 damage)`,
      ...battle.fighterA.roastLines,
      `@${battle.fighterB.username} — ${battle.fighterB.biggestCrime} (${battle.fighterB.score}/100 damage)`,
      ...battle.fighterB.roastLines,
      ...battle.battleLines,
      `WINNER: @${battle.winner.username}`,
      `FINISHING MOVE: ${battle.winner.finishingMove}`,
      `VERDICT: ${battle.verdict}`,
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      showToast("Battle result copied to clipboard");
    } catch {
      setError("The clipboard left the arena before the final bell.");
    }
  }

  async function handleCopyBattleVerdict() {
    if (!battleResult) return;
    const { winner, verdict } = battleResult.battle;
    const text = [
      `WINNER: @${winner.username}`,
      `FINISHING MOVE: ${winner.finishingMove}`,
      `VERDICT: ${verdict}`,
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      showToast("Battle verdict copied to clipboard");
    } catch {
      setError("The clipboard left the arena before the final bell.");
    }
  }

  function handleBattleAgain() {
    setBattleResult(null);
    setError("");
    setDeveloperError("");
    setToastMessage("");
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => document.getElementById("usernameA")?.focus(), 350);
  }

  async function handleDownloadShareCard() {
    const card = shareCardRef.current;
    if (!card || !result || isGeneratingCard) return;

    setIsGeneratingCard(true);
    try {
      await document.fonts.ready;
      const images = Array.from(card.querySelectorAll("img"));
      await Promise.all(
        images.map(
          (image) =>
            image.complete ||
            new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
        ),
      );

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(card, {
        width: 1200,
        height: 675,
        canvasWidth: 1200,
        canvasHeight: 675,
        pixelRatio: 1,
        cacheBust: true,
        skipFonts: true,
        backgroundColor: "#090807",
      });

      const download = document.createElement("a");
      download.download = `github-roast-${result.profile.username}.png`;
      download.href = dataUrl;
      download.click();
      showToast("Roast card downloaded");
    } catch (generationError) {
      console.error("Share card generation failed:", generationError);
      showToast("The photo lab fumbled the evidence. Try again.");
    } finally {
      setIsGeneratingCard(false);
    }
  }

  async function handleDownloadBattleCard() {
    const card = battleShareCardRef.current;
    if (!card || !battleResult || isGeneratingBattleCard) return;

    setIsGeneratingBattleCard(true);
    try {
      await document.fonts.ready;
      const images = Array.from(card.querySelectorAll("img"));
      await Promise.all(
        images.map(
          (image) =>
            image.complete ||
            new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
        ),
      );

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(card, {
        width: 1080,
        height: 1350,
        canvasWidth: 1080,
        canvasHeight: 1350,
        pixelRatio: 1,
        cacheBust: true,
        skipFonts: true,
        backgroundColor: "#090807",
      });

      const fighterA = battleResult.profiles.A.username;
      const fighterB = battleResult.profiles.B.username;
      const download = document.createElement("a");
      download.download = `github-roast-battle-${fighterA}-vs-${fighterB}.png`;
      download.href = dataUrl;
      download.click();
      showToast("Battle card downloaded");
    } catch (generationError) {
      console.error("Battle card generation failed:", generationError);
      showToast("The fight photographer missed the knockout. Try again.");
    } finally {
      setIsGeneratingBattleCard(false);
    }
  }

  return (
    <main className="site-shell">
      <div className="ambient-glow" aria-hidden="true" />
      <div className="curtain curtain-left" aria-hidden="true" />
      <div className="curtain curtain-right" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="GitHub Roaster home">
          <span className="brand-mark"><GithubMark /><FlameIcon /></span>
          <span>GitHub <strong>Roaster</strong></span>
        </a>
        <div className="show-badge"><span /> Live on the main stage</div>
      </header>

      <section className="hero" id="top">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <div className="hero-kicker"><span /> {mode === "battle" ? "Tonight’s double-header" : "Tonight’s main event"} <span /></div>
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h1>{mode === "battle" ? <>Put two profiles<br /><em>in the ring.</em></> : <>Put a GitHub profile<br /><em>on trial.</em></>}</h1>
              <p className="subheadline">{mode === "battle" ? "Two usernames enter. We compare the code crimes, call every abandoned side project, and let Groq decide who survives." : "Drop a username. We’ll inspect the repos, count the abandoned dreams, and let AI roast the evidence."}</p>
            </motion.div>
          </AnimatePresence>

          <motion.form
            className="warrant"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.55 }}
            noValidate
          >
            <div className="warrant-topline">
              <span>Case no. {mode === "battle" ? "VS" : "GH"}-{new Date().getFullYear()}</span>
              <strong>{mode === "battle" ? "Battle docket" : "Search warrant"}</strong>
              <span>{mode === "battle" ? "Roast combat division" : "Code crimes division"}</span>
            </div>
            <div className="mode-switch" role="tablist" aria-label="Roast mode">
              <button type="button" role="tab" aria-selected={mode === "solo"} className={mode === "solo" ? "active" : ""} onClick={() => changeMode("solo")} disabled={isLoading}>
                <span>01</span> Solo Roast
              </button>
              <button type="button" role="tab" aria-selected={mode === "battle"} className={mode === "battle" ? "active" : ""} onClick={() => changeMode("battle")} disabled={isLoading}>
                <span>02</span> Battle Mode
              </button>
            </div>

            {mode === "solo" ? (
              <>
                <label htmlFor="username">Name the accused</label>
                <div className="input-row">
                  <div className="username-field">
                    <GithubMark />
                    <span>github.com/</span>
                    <input id="username" name="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="username" autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={isLoading} aria-describedby="search-disclaimer" />
                  </div>
                  <button type="submit" className="roast-button" disabled={isLoading}>
                    <GavelIcon />{isLoading ? "Building the case…" : "Roast Them"}
                  </button>
                </div>
              </>
            ) : (
              <div className="battle-form">
                <div className="battle-inputs">
                  <label className="battle-suspect" htmlFor="usernameA">
                    <span><b>A</b> Suspect A</span>
                    <div className="username-field">
                      <GithubMark /><span>github.com/</span>
                      <input id="usernameA" name="usernameA" value={usernameA} onChange={(event) => setUsernameA(event.target.value)} placeholder="first-fighter" autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={isLoading} aria-describedby="search-disclaimer" />
                    </div>
                  </label>
                  <div className="form-vs" aria-hidden="true"><strong>VS</strong><small>Face-off</small></div>
                  <label className="battle-suspect" htmlFor="usernameB">
                    <span><b>B</b> Suspect B</span>
                    <div className="username-field">
                      <GithubMark /><span>github.com/</span>
                      <input id="usernameB" name="usernameB" value={usernameB} onChange={(event) => setUsernameB(event.target.value)} placeholder="second-fighter" autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={isLoading} aria-describedby="search-disclaimer" />
                    </div>
                  </label>
                </div>
                <button type="submit" className="roast-button battle-submit" disabled={isLoading}>
                  <GavelIcon />{isLoading ? "Calling the fighters…" : "Start Roast Battle"}
                </button>
              </div>
            )}
            <div className="warrant-footer">
              <span className="fingerprint" aria-hidden="true">◎</span>
              <p id="search-disclaimer">Public GitHub data only. {mode === "battle" ? "The fight stays inside the repos, READMEs, and commit history." : "Roasts stay about code, repos, and profile choices."}</p>
              <span className="approved-stamp">No personal<br />low blows</span>
            </div>
          </motion.form>

          <div className="trust-row">
            <span><i>✓</i> Public evidence only</span>
            <span><i>✓</i> No data stored</span>
            <span><i>✓</i> Ego not included</span>
          </div>
        </motion.div>
      </section>

      <div ref={outcomeRef} className="outcome-anchor">
        <AnimatePresence mode="wait">
          {isLoading && (
            <LoadingAct
              key="loading"
              messageIndex={loadingIndex}
              messages={activeLoadingMessages}
              battleMode={mode === "battle"}
            />
          )}
          {!isLoading && error && (
            <motion.div className="error-card" key="error" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert">
              <span>Case dismissed</span>
              <p>{error}</p>
              {process.env.NODE_ENV === "development" && developerError && (
                <div className="developer-error">
                  <strong>DEV · API DETAIL</strong>
                  <code>{developerError}</code>
                </div>
              )}
              <button type="button" onClick={() => { setError(""); setDeveloperError(""); document.getElementById(mode === "battle" ? "usernameA" : "username")?.focus(); }}>{mode === "battle" ? "Return to the weigh-in" : "Try another suspect"}</button>
            </motion.div>
          )}
          {!isLoading && result && (
            <RoastReveal
              key={result.profile.username}
              result={result}
              onShare={handleDownloadShareCard}
              onCopy={handleCopyRoast}
              isGenerating={isGeneratingCard}
            />
          )}
          {!isLoading && battleResult && (
            <BattleResult
              key={`${battleResult.profiles.A.username}-${battleResult.profiles.B.username}`}
              result={battleResult}
              onAgain={handleBattleAgain}
              onCopy={handleCopyBattle}
              onCopyVerdict={handleCopyBattleVerdict}
              onDownload={handleDownloadBattleCard}
              isGeneratingCard={isGeneratingBattleCard}
            />
          )}
        </AnimatePresence>
      </div>

      {result && (
        <RoastShareCard
          ref={shareCardRef}
          avatar_url={result.profile.avatarUrl}
          username={result.profile.username}
          score={result.roast.score}
          savageLines={result.roast.savageLines}
        />
      )}

      {battleResult && (
        <BattleShareCard
          ref={battleShareCardRef}
          fighterAAvatar={battleResult.profiles.A.avatar_url}
          fighterAUsername={battleResult.profiles.A.username}
          fighterAScore={battleResult.battle.fighterA.score}
          fighterABiggestCrime={battleResult.battle.fighterA.biggestCrime}
          fighterATopRoastLine={battleResult.battle.fighterA.roastLines[0] ?? "The repository evidence declined to comment."}
          fighterBAvatar={battleResult.profiles.B.avatar_url}
          fighterBUsername={battleResult.profiles.B.username}
          fighterBScore={battleResult.battle.fighterB.score}
          fighterBBiggestCrime={battleResult.battle.fighterB.biggestCrime}
          fighterBTopRoastLine={battleResult.battle.fighterB.roastLines[0] ?? "The repository evidence declined to comment."}
          winnerUsername={battleResult.battle.winner.username}
          winnerReason={battleResult.battle.winner.reason}
          winnerFinishingMove={battleResult.battle.winner.finishingMove}
          finalVerdict={battleResult.battle.verdict}
        />
      )}

      <AnimatePresence>
        {toastMessage && (
          <motion.div className="toast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} role="status">
            <span>✓</span> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <footer>
        <span>GitHub Roaster</span>
        <p>Built with public data, artificial intelligence, and natural disrespect.</p>
        <span>Est. after one bad README</span>
      </footer>
    </main>
  );
}
