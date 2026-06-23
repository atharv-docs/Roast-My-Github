# GitHub Roaster

A dark comedy-club-style GitHub profile roaster built with Next.js, TypeScript, Tailwind CSS, Framer Motion, GitHub REST, and Groq.

## Run locally

```bash
npm install
cp .env.example .env.local
# Add your GROQ_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`GITHUB_TOKEN` is optional, but recommended if you expect enough requests to hit GitHub's unauthenticated API rate limit.
