import { ollamaConfig, systemPrompt } from "@/config/ollama";
import type { GitHubAnalysis, RoastResult, TopRoast, DeveloperAward, PersonalityScore } from "@/types/roast";

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export async function checkOllamaHealth(): Promise<{ healthy: boolean; model: string }> {
  try {
    const response = await fetch(ollamaConfig.endpoint.replace("/api/generate", "/api/tags"), {
      method: "GET",
    });

    if (!response.ok) {
      return { healthy: false, model: "" };
    }

    const data = await response.json();
    const models = data.models || [];
    const hasModel = models.some((m: { name: string }) => m.name.includes(ollamaConfig.model.split(":")[0]));

    return { healthy: true, model: hasModel ? ollamaConfig.model : "" };
  } catch {
    return { healthy: false, model: "" };
  }
}

export async function generateRoast(analysis: GitHubAnalysis): Promise<RoastResult> {
  const userPrompt = `Now generate a hilarious roast based on this GitHub profile data:

${JSON.stringify(analysis, null, 2)}

Remember:
- Every joke MUST be backed by actual statistics from the JSON
- Use specific numbers and data points
- NEVER insult the person - only roast their coding habits
- Be specific about their actual repos, commits, and activity

${systemPrompt}`;

  const response = await fetch(ollamaConfig.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaConfig.model,
      prompt: userPrompt,
      stream: false,
      options: {
        temperature: ollamaConfig.temperature,
        num_predict: ollamaConfig.maxTokens,
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Model "${ollamaConfig.model}" not found. Please check your Ollama installation.`);
    }
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data: OllamaResponse = await response.json();
  const roastText = data.response;

  return parseRoastResponse(roastText);
}

function parseRoastResponse(text: string): RoastResult {
  const lines = text.split("\n");
  let currentSection = "";
  const sections: Record<string, string[]> = {};

  for (const line of lines) {
    if (line.startsWith("## ")) {
      currentSection = line.replace("## ", "").trim();
      sections[currentSection] = [];
    } else if (currentSection && line.trim()) {
      sections[currentSection].push(line.trim());
    }
  }

  // Parse Opening Burn
  const openingBurnSection = sections["Opening Burn"] || [];
  const openingBurn = openingBurnSection.join(" ").slice(0, 300);

  // Parse Top Roasts
  const topRoastsSection = sections["Top Roasts"] || [];
  const topRoasts: TopRoast[] = [];
  for (const line of topRoastsSection) {
    const match = line.match(/^(\d+)[.)\s]+(.+)/);
    if (match) {
      topRoasts.push({
        number: parseInt(match[1]),
        text: match[2].slice(0, 200),
        data: extractDataFromRoast(match[2]),
      });
    }
  }

  // If no structured roasts, create them from raw text
  if (topRoasts.length === 0) {
    const fallbackRoasts = createFallbackRoasts(text);
    topRoasts.push(...fallbackRoasts);
  }

  // Parse Awards
  const awardsSection = sections["Fake Developer Awards"] || [];
  const developerAwards: DeveloperAward[] = [];
  for (const line of awardsSection) {
    if (line.includes("🏆")) {
      const match = line.match(/🏆\s*(.+?):\s*(.+)/);
      if (match) {
        developerAwards.push({
          icon: "🏆",
          title: match[1].trim(),
          description: match[2].trim().slice(0, 150),
        });
      }
    }
  }

  // Fallback awards
  if (developerAwards.length === 0) {
    developerAwards.push(...createFallbackAwards());
  }

  // Parse Personality Scores
  const scoresSection = sections["GitHub Personality Scores"] || [];
  const personalityScores: PersonalityScore[] = [];
  for (const line of scoresSection) {
    const match = line.match(/^-\s*(\w+):\s*(\d+)\/(\d+)\s*-\s*(.+)/);
    if (match) {
      personalityScores.push({
        name: match[1].trim(),
        score: parseInt(match[2]),
        maxScore: parseInt(match[3]),
        explanation: match[4].trim().slice(0, 150),
      });
    }
  }

  if (personalityScores.length === 0) {
    personalityScores.push(...createFallbackScores());
  }

  // Parse Final Verdict
  const verdictSection = sections["Final Verdict"] || [];
  const finalVerdict = verdictSection.join(" ").slice(0, 300);

  // Parse Roast Score
  let roastScore = 50;
  const scoreSection = sections["Roast Score"] || [];
  for (const line of scoreSection) {
    const match = line.match(/(\d+)/);
    if (match) {
      const score = parseInt(match[1]);
      if (score >= 0 && score <= 100) {
        roastScore = score;
        break;
      }
    }
  }

  return {
    openingBurn: { text: openingBurn || "Your GitHub profile is... something else." },
    topRoasts: topRoasts.slice(0, 10),
    developerAwards: developerAwards.slice(0, 5),
    personalityScores,
    finalVerdict: { text: finalVerdict || "You're roasted. Accept it. Improve. Or don't. Honestly, at this point, I'm impressed you made it this far." },
    roastScore,
    generatedAt: new Date().toISOString(),
  };
}

function extractDataFromRoast(text: string): string {
  const numbers = text.match(/\d+/g);
  const words = text.match(/(?:has|have|is|are|with|only|over|under)/gi);
  return [numbers?.slice(0, 3).join(", "), words?.slice(0, 4).join(" ")]
    .filter(Boolean)
    .join(" | ");
}

function createFallbackRoasts(text: string): TopRoast[] {
  const sentences = text
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 200);

  return sentences.slice(0, 10).map((text, i) => ({
    number: i + 1,
    text: text.slice(0, 200),
    data: "",
  }));
}

function createFallbackAwards(): DeveloperAward[] {
  return [
    {
      icon: "🏆",
      title: "Professional Procrastinator",
      description: "Your commit history shows you work best at 3am on a Tuesday",
    },
    {
      icon: "🏆",
      title: "README Avoidance Champion",
      description: "Every good project needs docs. Your repos said no.",
    },
    {
      icon: "🏆",
      title: "Serial Side Project Starter",
      description: "You've started more repos than most people will ever see",
    },
    {
      icon: "🏆",
      title: "Merge Conflict Collector",
      description: "Your git history is a museum of conflict resolutions",
    },
    {
      icon: "🏆",
      title: "Works On My Machine Engineer",
      description: "Your debugging skills are unmatched - too bad about the tests",
    },
  ];
}

function createFallbackScores(): PersonalityScore[] {
  return [
    {
      name: "Chaos",
      score: 7,
      maxScore: 10,
      explanation: "Your code organization is held together with digital duct tape",
    },
    {
      name: "Documentation",
      score: 2,
      maxScore: 10,
      explanation: "Your README files are an endangered species",
    },
    {
      name: "Naming",
      score: 4,
      maxScore: 10,
      explanation: "'final-final-v2' tells me everything I need to know",
    },
    {
      name: "Commit Discipline",
      score: 5,
      maxScore: 10,
      explanation: "At least your commits exist - that's something",
    },
    {
      name: "Project Commitment",
      score: 3,
      maxScore: 10,
      explanation: "Your abandoned repos could start a digital graveyard",
    },
    {
      name: "Bug Attraction",
      score: 8,
      maxScore: 10,
      explanation: "Bugs find you. It's a gift, really.",
    },
    {
      name: "Touching Grass",
      score: 2,
      maxScore: 10,
      explanation: "Your commit times suggest you've never seen sunlight",
    },
    {
      name: "Coffee Dependency",
      score: 9,
      maxScore: 10,
      explanation: "Your late-night commits powered by pure caffeine",
    },
  ];
}