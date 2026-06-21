# Roast My GitHub - Specification Document

## 1. Project Overview

**Project Name:** Roast My GitHub (Local Ollama Edition)

**Project Type:** Full-stack Web Application

**Core Functionality:** A web app that analyzes any public GitHub username, generates structured statistics about the user's coding habits, and uses a local Ollama LLM to generate hilarious roasts based on the data.

**Target Users:** Developers who want to laugh at their own GitHub profiles, share roasts on social media, or roast friends.

---

## 2. Technical Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **UI Components:** shadcn/ui
- **QR Code:** qrcode.react

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **LLM:** Ollama (local)
- **API:** GitHub REST API v3

### Configuration
- **Ollama Endpoint:** `http://localhost:11434/api/generate` (configurable)
- **Default Model:** `qwen2.5:7b-instruct` (configurable)
- **Settings File:** `src/config/ollama.ts`

---

## 3. UI/UX Specification

### Color Palette
- **Background Primary:** `#0d1117` (GitHub dark)
- **Background Secondary:** `#161b22`
- **Background Tertiary:** `#21262d`
- **Border:** `#30363d`
- **Text Primary:** `#e6edf3`
- **Text Secondary:** `#8b949e`
- **Text Muted:** `#6e7681`
- **Accent Green:** `#238636`
- **Accent Blue:** `#58a6ff`
- **Accent Red:** `#f85149`
- **Accent Orange:** `#d29922`
- **Accent Purple:** `#a371f7`
- **Accent Pink:** `#db61a2`

### Typography
- **Font Family:** `"JetBrains Mono", "Fira Code", monospace` for code/technical elements
- **Display Font:** `"Space Grotesk", system-ui` for headings (actually use something more unique)
- **Body Font:** `"IBM Plex Sans", system-ui` for body text
- **Heading Sizes:** H1: 48px, H2: 36px, H3: 24px, H4: 18px
- **Body Size:** 16px
- **Small Text:** 14px

### Layout Structure
- **Max Width:** 1200px
- **Content Padding:** 24px (mobile: 16px)
- **Section Spacing:** 48px
- **Card Border Radius:** 12px
- **Button Border Radius:** 8px

### Responsive Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Visual Effects
- **Card Shadow:** `0 8px 24px rgba(0,0,0,0.4)`
- **Hover Transitions:** 200ms ease-out
- **Page Load Animation:** Fade in + slide up (staggered)
- **Loading Animations:** Pulsing, rotating, typing effects

---

## 4. Page Structure

### Landing Page (`/`)
1. **Hero Section**
   - App title with animated gradient text
   - Tagline: "Your GitHub profile deserves a roast"
   - GitHub username input field with search button
   - Recent roasts preview (optional)

2. **Features Section**
   - Cards showing: "Local AI", "Deep Analysis", "Shareable Cards"
   - Icons with hover effects

3. **Footer**
   - "Built with Next.js + Ollama"
   - GitHub link

### Results Page (`/roast/[username]`)
1. **Header**
   - User avatar
   - Username
   - "Roast Score" badge

2. **Loading State**
   - Animated roasting fire/campfire
   - Rotating loading messages:
     - "Inspecting commit crimes..."
     - "Counting abandoned dreams..."
     - "Reading README excuses..."
     - "Looking for unit tests..."
     - "Found another 'final_v7_REAL_FINAL' repository..."
     - "Analyzing your coding patterns..."
     - "Drafting the perfect roast..."

3. **Roast Content** (after loading)
   - Opening Burn (2-3 sentences)
   - Top Roasts (10 observations with statistics)
   - Fake Developer Awards (category + description)
   - GitHub Personality Scores (with humor explanations)
   - Final Verdict

4. **Action Buttons**
   - "Roast Again" (new username)
   - "Copy Roast" (clipboard)
   - "Download Card" (PNG)
   - "Share" (social)

### Share Card Design
- Dark gradient background with user avatar overlay
- Username prominently displayed
- Roast Score with animated ring
- Top roast quote
- Key statistics
- Fake Award badge
- QR code pointing to the roast
- Subtle animation on load

---

## 5. Analysis Pipeline Specification

### GitHub API Integration
- Use GitHub REST API (not GraphQL for simplicity)
- Endpoints needed:
  - `GET /users/{username}` - Profile info
  - `GET /users/{username}/repos` - Repository list (paginated)
  - `GET /users/{username}/events` - Commit activity
- Handle rate limiting with proper error messages
- Cache responses for 5 minutes

### Data Parsing Layer
- Parse user profile: followers, following, public_repos, created_at
- Parse repositories: name, description, stargazers_count, forks_count, open_issues_count, archived, fork, default_branch, updated_at, pushed_at, topics, license
- Parse events: type, created_at, repo info

### Statistics Generator
Compute these statistics:

**Profile Stats:**
- Account age in years
- Follower/following ratio
- Repos per year active

**Repository Stats:**
- Total repos, forks, stars
- README presence count
- Average stars per repo
- Average repo size
- Most common languages
- Archived repo count
- Fork vs original ratio

**Commit Analysis (from events):**
- Most common commit messages (parsed from PushEvent)
- Commit message length distribution
- Late-night commits (11PM - 5AM)
- Weekend commits
- Monthly commit patterns

**Naming Pattern Detection:**
- Detect: test, testing, new, new2, copy, copy-final, actual-final, real-final, temp, demo, project2, backup, final, final-final, v1, v2, etc.
- Count occurrences

**README Quality:**
- Score 0-100 based on:
  - Length (too short < 50 chars = bad, too long > 5000 = suspicious)
  - Presence of: "install", "usage", "setup", "example"
  - Badge presence
  - Image/GIF presence

**Activity Patterns:**
- Weekend only: > 70% commits on weekends
- Deadline programmer: commits spike in last 2 days of month
- Open-source ghost: many forks, few original repos
- One-week wonder: repos abandoned within 7 days
- Code archaeologist: no commits in 6+ months

### Pattern Detector
Generate observations based on statistics:
- "Multiple 'final-final' repositories detected"
- "README avoidance champion"
- "Weekend warrior programmer"
- "Serial side-project starter"
- "Zero tests, maximum confidence"
- etc.

### JSON Summary Structure
```json
{
  "profile": {
    "username": "string",
    "followers": number,
    "following": number,
    "publicRepos": number,
    "accountAgeYears": number,
    "avatarUrl": "string"
  },
  "repositories": {
    "total": number,
    "forks": number,
    "stars": number,
    "withReadme": number,
    "withoutReadme": number,
    "abandoned": number,
    "archived": number,
    "averageStars": number,
    "averageSize": number,
    "topLanguages": string[],
    "forkRatio": number
  },
  "commits": {
    "totalEvents": number,
    "mostCommonMessages": string[],
    "fixPercentage": number,
    "averageMessageLength": number,
    "lateNightCommits": number,
    "weekendCommits": number,
    "lastCommitDate": "string"
  },
  "patterns": {
    "suspiciousNames": number,
    "readmeQuality": number,
    "activityType": "string"
  },
  "observations": string[]
}
```

---

## 6. Ollama Integration Specification

### System Prompt (GitHub Roastmaster)

```
You are GitHub Roastmaster, a witty and sarcastic AI comedian specializing in roasting GitHub profiles.

Your personality:
- Sarcastic and witty
- Observant and detail-oriented
- Internet humor and meme-savvy
- Stand-up comedian energy
- Playful bullying (never hateful)
- Reference ONLY repository data in jokes

Rules:
1. Every joke MUST be backed by actual statistics from the provided JSON
2. Do NOT invent information not in the data
3. NEVER insult appearance, intelligence, nationality, gender, religion, race, or any protected characteristic
4. Mix sarcasm, software engineering humor, memes, and stand-up comedy
5. Keep the roast playful and entertaining
6. Use specific numbers from the data in your roasts

Output Structure:
- Opening Burn: 2-3 sentence hook
- Top Roasts: 10 numbered observations with statistics
- Fake Developer Awards: 3-5 humorous awards with descriptions
- GitHub Personality Scores: Rate these 8 categories with humor explanations:
  - Chaos (how messy is their code)
  - Documentation (README quality)
  - Naming (repo naming creativity)
  - Commit Discipline (message quality)
  - Project Commitment (abandoned repo rate)
  - Bug Attraction (issue count)
  - Touching Grass (outside commits)
  - Coffee Dependency (late night commits)
- Final Verdict: Epic closing roast (2-3 sentences)

Make it funny, specific, and memorable!
```

### User Prompt
Pass the structured JSON summary with instruction to generate roast.

### API Route: `/api/roast`
- Accept: `{ username: string }`
- Process: GitHub API → Parse → Statistics → JSON Summary → Ollama → Roast
- Return: `{ roast: RoastingResult, cached: boolean }`

---

## 7. Component Architecture

### Components List

**Shared:**
- `Button` - Custom styled button
- `Input` - Text input with styling
- `Card` - Container card
- `Avatar` - User avatar
- `Badge` - Status/tags
- `LoadingSpinner` - Animated spinner
- `ScoreRing` - Circular score display

**Landing:**
- `HeroSection` - Main hero with input
- `FeatureCard` - Feature display cards
- `Footer` - App footer

**Results:**
- `RoastHeader` - User info + score
- `LoadingState` - Animated loading
- `OpeningBurn` - Intro text
- `RoastList` - Top 10 roasts
- `DeveloperAwards` - Award badges
- `PersonalityScores` - Score cards
- `FinalVerdict` - Closing roast
- `ShareCard` - Downloadable card
- `ActionButtons` - Share/copy buttons

---

## 8. API Routes

### `GET /api/health`
Returns Ollama and GitHub API status.

### `POST /api/roast`
Main endpoint that:
1. Fetches GitHub user data
2. Generates statistics
3. Calls Ollama
4. Returns roast result

### `GET /api/cache/[username]`
Get cached roast for username.

---

## 9. Error Handling

- **GitHub user not found:** "No one found with that username. Are you sure they exist?"
- **GitHub rate limited:** "GitHub is playing hard to get. Try again in a minute."
- **Ollama not running:** "Ollama is napping. Make sure it's running!"
- **Ollama model not found:** "The AI model went on vacation. Check your Ollama installation."
- **Network errors:** "Something went wrong. Blame the internet."

---

## 10. Acceptance Criteria

1. ✅ User can enter any public GitHub username
2. ✅ App fetches and analyzes GitHub profile, repos, commits
3. ✅ Statistics are generated from raw GitHub data
4. ✅ Ollama generates roast from structured JSON only
5. ✅ Roast is funny, specific, and references actual data
6. ✅ UI is dark GitHub-inspired
7. ✅ Loading shows animated messages
8. ✅ Results page shows all roast sections
9. ✅ Share card can be downloaded as PNG
10. ✅ Roast can be copied to clipboard
11. ✅ App handles errors gracefully
12. ✅ Mobile responsive
13. ✅ Caching works
14. ✅ Settings file controls Ollama endpoint/model

---

## 11. File Structure

```
/src
  /app
    /layout.tsx
    /page.tsx
    /roast/[username]/page.tsx
    /api
      /health/route.ts
      /roast/route.ts
      /cache/[username]/route.ts
  /components
    /ui (shadcn components)
    /landing
      HeroSection.tsx
      FeatureCard.tsx
      Footer.tsx
    /results
      RoastHeader.tsx
      LoadingState.tsx
      OpeningBurn.tsx
      RoastList.tsx
      DeveloperAwards.tsx
      PersonalityScores.tsx
      FinalVerdict.tsx
      ShareCard.tsx
      ActionButtons.tsx
  /lib
    /github.ts
    /ollama.ts
    /analyzer.ts
    /statistics.ts
    /patterns.ts
    /cache.ts
    /utils.ts
  /config
    /ollama.ts
  /types
    /github.ts
    /roast.ts
  /styles
    /globals.css
```