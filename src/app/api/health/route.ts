import { NextResponse } from "next/server";
import { checkOllamaHealth } from "@/lib/ollama";
import { checkGitHubHealth } from "@/lib/github";

export async function GET() {
  const [ollama, github] = await Promise.all([
    checkOllamaHealth(),
    checkGitHubHealth(),
  ]);

  const healthy = ollama.healthy && github;

  return NextResponse.json({
    status: healthy ? "healthy" : "unhealthy",
    services: {
      ollama: {
        healthy: ollama.healthy,
        model: ollama.model,
      },
      github: {
        healthy: github,
      },
    },
    timestamp: new Date().toISOString(),
  });
}