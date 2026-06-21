"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Copy,
  Download,
  Home,
  Share2,
  Flame,
  Award,
  GitCommit,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import type { RoastResponse, RoastResult, GitHubAnalysis } from "@/types/roast";
import { formatNumber } from "@/lib/utils";

// Loading messages for animation
const LOADING_MESSAGES = [
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
];

export default function RoastPage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const [roast, setRoast] = useState<RoastResult | null>(null);
  const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2000);

    async function fetchRoast() {
      try {
        const response = await fetch("/api/roast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to generate roast");
        }

        const data: RoastResponse = await response.json();
        setRoast(data.roast);
        setAnalysis(data.analysis);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        clearInterval(messageInterval);
        setLoading(false);
      }
    }

    fetchRoast();

    return () => clearInterval(messageInterval);
  }, [username]);

  const handleCopy = () => {
    if (!roast) return;
    const text = `${roast.openingBurn.text}

${roast.topRoasts.map((r) => `${r.number}. ${r.text}`).join("\n")}

🏆 Awards:
${roast.developerAwards.map((a) => `${a.icon} ${a.title}: ${a.description}`).join("\n")}

Final: ${roast.finalVerdict.text}

#RoastMyGitHub`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return "text-red-500";
    if (score < 60) return "text-orange-500";
    return "text-green-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Animated fire icon */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Flame className="w-24 h-24 text-orange-500" />
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 0.2, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute inset-0 blur-xl bg-orange-500/30 rounded-full"
            />
          </div>

          <h2 className="text-2xl font-bold text-[#e6edf3] mb-2 font-['Space_Grotesk']">
            Roasting @{username}
          </h2>
          <p className="text-[#8b949e] loading-dots">{loadingMessage}</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center px-6"
        >
          <Flame className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#e6edf3] mb-2">Oops!</h2>
          <p className="text-red-400 mb-8">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="btn btn-primary"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <header className="border-b border-[#30363d] sticky top-0 bg-[#0d1117]/95 backdrop-blur z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#8b949e] hover:text-[#e6edf3] transition"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="btn btn-secondary px-4 py-2 text-sm"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="btn btn-primary px-4 py-2 text-sm"
            >
              <Flame className="w-4 h-4" />
              Roast Another
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* User Info & Score */}
        {analysis && roast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 mb-12"
          >
            <div className="relative">
              <Image
                src={analysis.profile.avatarUrl}
                alt={username}
                width={100}
                height={100}
                className="rounded-full border-4 border-[#30363d]"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3] font-['Space_Grotesk']">
                @{username}
              </h1>
              {analysis.profile.name && (
                <p className="text-[#8b949e]">{analysis.profile.name}</p>
              )}
              <div className="flex gap-4 mt-2 text-sm text-[#8b949e]">
                <span>{formatNumber(analysis.profile.followers)} followers</span>
                <span>•</span>
                <span>{formatNumber(analysis.profile.publicRepos)} repos</span>
                <span>•</span>
                <span>{analysis.profile.accountAgeYears} years</span>
              </div>
            </div>

            <div className="ml-auto">
              <div className="text-center">
                <div
                  className={`text-5xl font-bold ${getScoreColor(roast.roastScore)} font-['Space_Grotesk']`}
                >
                  {roast.roastScore}
                </div>
                <div className="text-[#6e7681] text-sm">Roast Score</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Opening Burn */}
        {roast && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="card p-8 border-orange-500/30">
              <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Opening Burn
              </h2>
              <p className="text-2xl md:text-3xl text-[#e6edf3] font-['Space_Grotesk'] leading-relaxed">
                {roast.openingBurn.text}
              </p>
            </div>
          </motion.section>
        )}

        {/* Top Roasts */}
        {roast && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-6 flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-[#58a6ff]" />
              Top Roasts
            </h2>
            <div className="space-y-3">
              {roast.topRoasts.map((roastItem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="card p-5 flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#21262d] flex items-center justify-center text-[#58a6ff] font-bold">
                    {roastItem.number}
                  </div>
                  <p className="text-[#e6edf3]">{roastItem.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Developer Awards */}
        {roast && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#d29922]" />
              Fake Developer Awards
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {roast.developerAwards.map((award, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="card p-5 border-[#d29922]/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{award.icon}</span>
                    <div>
                      <h3 className="font-semibold text-[#e6edf3]">{award.title}</h3>
                      <p className="text-sm text-[#8b949e] mt-1">{award.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Personality Scores */}
        {roast && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#a371f7]" />
              GitHub Personality Scores
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {roast.personalityScores.map((score, index) => (
                <motion.div
                  key={score.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="card p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#e6edf3] font-medium">{score.name}</span>
                    <span className="text-[#8b949e]">
                      {score.score}/{score.maxScore}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(score.score / score.maxScore) * 100}%` }}
                      transition={{ delay: 0.8 + index * 0.05, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        score.score / score.maxScore > 0.7
                          ? "bg-green-500"
                          : score.score / score.maxScore > 0.3
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                  <p className="text-sm text-[#8b949e] mt-2">{score.explanation}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Final Verdict */}
        {roast && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="card p-8 border-purple-500/30">
              <h2 className="text-sm font-semibold text-purple-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Final Verdict
              </h2>
              <p className="text-xl text-[#e6edf3] font-['Space_Grotesk'] leading-relaxed">
                {roast.finalVerdict.text}
              </p>
            </div>
          </motion.section>
        )}

        {/* Share Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center"
        >
          <p className="text-[#6e7681] mb-4">
            Want to share your roast? Copy it or take a screenshot!
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleCopy}
              className="btn btn-secondary"
            >
              <Copy className="w-5 h-5" />
              Copy to Clipboard
            </button>
            <button
              onClick={() => router.push("/")}
              className="btn btn-primary"
            >
              <Share2 className="w-5 h-5" />
              Roast Another
            </button>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-8 mt-12">
        <div className="text-center text-[#6e7681] text-sm">
          <p>Roast generated by Roast My GitHub • Powered by Ollama</p>
        </div>
      </footer>
    </div>
  );
}