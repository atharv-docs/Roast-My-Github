"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Sparkles, Flame, Share2, Search, Zap, Terminal } from "lucide-react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");

    try {
      router.push(`/roast/${username.trim()}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Terminal,
      title: "Local AI Power",
      description: "Uses Ollama to roast your GitHub locally. Your data never leaves your machine.",
    },
    {
      icon: Flame,
      title: "Deep Analysis",
      description: "We analyze your repos, commits, naming patterns, README quality, and more.",
    },
    {
      icon: Share2,
      title: "Shareable Roasts",
      description: "Generate beautiful shareable cards to flex your roasted profile on social media.",
    },
    {
      icon: Zap,
      title: "Instant Insights",
      description: "Our algorithm detects patterns like weekend warriors, code archaeologists, and more.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(88, 166, 255, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 50%, rgba(210, 153, 34, 0.15) 0%, transparent 50%)`,
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 py-32">
          {/* Logo/Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <Flame className="w-12 h-12 text-orange-500" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
              </div>
              <span className="text-2xl font-bold text-[#e6edf3] font-['Space_Grotesk']">
                Roast My GitHub
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-['Space_Grotesk']">
              <span className="text-gradient animate-gradient">Your GitHub Profile</span>
              <br />
              <span className="text-[#e6edf3]">Deserves a Roast</span>
            </h1>

            <p className="text-xl text-[#8b949e] max-w-2xl mx-auto mb-12">
              Enter any public GitHub username and get a hilarious AI-generated roast based on their
              repositories, commits, and coding habits.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7681]">
                  <Github className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter GitHub username..."
                  className="input pl-14 pr-36"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary px-6 py-2.5 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="loading-dots">Roasting</span>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Roast
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-center mt-4"
              >
                {error}
              </motion.p>
            )}

            <p className="text-[#6e7681] text-center mt-4 text-sm">
              Powered by local Ollama • Your data stays private
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-[#30363d]">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#e6edf3] mb-4 font-['Space_Grotesk']">
              How It Works
            </h2>
            <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">
              Our AI analyzes every aspect of a GitHub profile and generates a personalized roast
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-[#21262d] flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#58a6ff]" />
                </div>
                <h3 className="text-lg font-semibold text-[#e6edf3] mb-2">{feature.title}</h3>
                <p className="text-[#8b949e] text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#d29922]" />
            <span className="text-[#8b949e]">Built with Next.js + Ollama</span>
          </div>
          <p className="text-[#6e7681] text-sm">
            Roasting GitHub profiles since 2024 • All roasts are generated by AI
          </p>
        </div>
      </footer>
    </div>
  );
}