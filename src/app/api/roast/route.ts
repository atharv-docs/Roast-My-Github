import { NextRequest, NextResponse } from "next/server";
import { analyzeGitHub } from "@/lib/analyzer";
import { checkOllamaHealth } from "@/lib/ollama";
import { z } from "zod";

const roastRequestSchema = z.object({
  username: z.string().min(1).max(100).regex(/^[a-zA-Z0-9-_]+$/),
});

export async function POST(request: NextRequest) {
  try {
    // Validate request
    const body = await request.json();
    const { username } = roastRequestSchema.parse(body);

    // Check if Ollama is running
    const ollamaHealth = await checkOllamaHealth();
    if (!ollamaHealth.healthy) {
      return NextResponse.json(
        {
          error: "Ollama is not running. Please start Ollama and try again.",
          code: "OLLAMA_NOT_RUNNING",
        },
        { status: 503 }
      );
    }

    // Analyze and generate roast
    const result = await analyzeGitHub(username);

    return NextResponse.json({
      ...result,
      ollamaModel: ollamaHealth.model,
    });
  } catch (error) {
    console.error("Roast generation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid username. Use only letters, numbers, hyphens, and underscores.",
          code: "INVALID_USERNAME",
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      const message = error.message;
      if (message.includes("not found") || message.includes("exist")) {
        return NextResponse.json(
          { error: message, code: "USER_NOT_FOUND" },
          { status: 404 }
        );
      }
      if (message.includes("rate limited")) {
        return NextResponse.json(
          { error: message, code: "RATE_LIMITED" },
          { status: 429 }
        );
      }
      if (message.includes("not found") && message.includes("Ollama")) {
        return NextResponse.json(
          { error: message, code: "MODEL_NOT_FOUND" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}