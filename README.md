# 🔥 Roast My GitHub

> Your GitHub profile deserves a roast.

A full-stack web application that analyzes any public GitHub username and generates hilarious AI-powered roasts based on their repositories, commits, and coding habits. Everything runs locally except GitHub API requests.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan)
![Ollama](https://img.shields.io/badge/Ollama-Local-orange)

## ✨ Features

- **Local AI Power** - Uses [Ollama](https://ollama.com/) to roast your GitHub locally. Your data never leaves your machine.
- **Deep Analysis** - Analyzes repositories, commits, naming patterns, README quality, and more.
- **Shareable Roasts** - Generate beautiful roast cards to share on social media.
- **Activity Detection** - Detects patterns like weekend warriors, code archaeologists, and one-week wonders.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- [Ollama](https://ollama.com/) installed with a model

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/roast-my-github.git
cd roast-my-github

# Install dependencies
npm install

# Start Ollama (in a separate terminal)
ollama serve

# Pull a model (if not already installed)
ollama pull qwen2.5:7b-instruct
# or
ollama pull llama3.1

# Start the development server
npm run dev
```

### Configuration

Edit `.env.local` to change the Ollama model:

```bash
OLLAMA_MODEL=llama3.1
# or
OLLAMA_MODEL=qwen2.5:7b-instruct
```

Other configurable options:
- `OLLAMA_ENDPOINT` - Ollama API URL (default: `http://localhost:11434/api/generate`)

## 🎯 How It Works

1. **Enter a GitHub username** on the landing page
2. **Fetch GitHub data** - Profile, repositories, and commit events
3. **Analyze** - Generate statistics about repo quality, commit patterns, naming conventions
4. **Roast** - Send structured JSON to Ollama and get a hilarious roast
5. **Share** - Copy to clipboard or take a screenshot

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── health/      # Health check endpoint
│   │   └── roast/       # Main roast generation endpoint
│   ├── roast/[username]/ # Results page
│   ├── layout.tsx       # Root layout
│   └── page.tsx        # Landing page
├── components/         # UI components
├── config/
│   └── ollama.ts       # Ollama configuration
├── lib/
│   ├── analyzer.ts     # Main analysis logic
│   ├── github.ts       # GitHub API client
│   ├── ollama.ts      # Ollama API client
│   ├── patterns.ts    # Pattern detection
│   ├── statistics.ts  # Statistics generator
│   └── cache.ts       # In-memory caching
├── styles/
│   └── globals.css    # Global styles
└── types/
    ├── github.ts      # GitHub API types
    └── roast.ts       # Roast result types
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **LLM:** Ollama (local)
- **API:** GitHub REST API v3

## 📝 License

MIT

---
