export class GroqRequestError extends Error {
  status: number;
  rawText?: string;

  constructor(message: string, status = 502, rawText?: string) {
    super(message);
    this.name = "GroqRequestError";
    this.status = status;
    this.rawText = rawText;
  }
}

function parseJsonObject(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Find a balanced JSON object if the model added prose around it.
  }

  for (let start = cleaned.indexOf("{"); start !== -1; start = cleaned.indexOf("{", start + 1)) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < cleaned.length; index += 1) {
      const character = cleaned[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') inString = true;
      else if (character === "{") depth += 1;
      else if (character === "}") {
        depth -= 1;
        if (depth === 0) {
          try {
            return JSON.parse(cleaned.slice(start, index + 1));
          } catch {
            break;
          }
        }
      }
    }
  }

  throw new GroqRequestError(
    "Groq returned text without a valid JSON object",
    502,
    text,
  );
}

function upstreamError(rawText: string) {
  try {
    const parsed = JSON.parse(rawText) as {
      error?: { message?: string } | string;
      message?: string;
    };
    if (typeof parsed.error === "string") return parsed.error;
    if (parsed.error && typeof parsed.error.message === "string") {
      return parsed.error.message;
    }
    if (typeof parsed.message === "string") return parsed.message;
  } catch {
    // A non-JSON upstream error is still useful in development.
  }
  return rawText.trim() || "No response body";
}

export async function requestGroqJson({
  systemPrompt,
  userPrompt,
  logPrefix,
  temperature = 0.82,
  maxCompletionTokens = 1200,
}: {
  systemPrompt: string;
  userPrompt: string;
  logPrefix: string;
  temperature?: number;
  maxCompletionTokens?: number;
}) {
  console.info(`${logPrefix} Starting Groq request`);
  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature,
        max_completion_tokens: maxCompletionTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      cache: "no-store",
    });
  } catch (error) {
    throw new GroqRequestError(
      error instanceof Error ? error.message : String(error),
    );
  }

  console.info(`${logPrefix} Groq response status:`, response.status);
  const rawResponse = await response.text();
  if (!response.ok) {
    throw new GroqRequestError(
      `Groq API returned ${response.status}: ${upstreamError(rawResponse)}`,
      502,
    );
  }

  let completion: { choices?: Array<{ message?: { content?: string } }> };
  try {
    completion = JSON.parse(rawResponse) as typeof completion;
  } catch {
    throw new GroqRequestError(
      "Groq returned an invalid response envelope",
      502,
      rawResponse,
    );
  }

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    throw new GroqRequestError(
      "Groq returned no message content",
      502,
      rawResponse,
    );
  }

  return { data: parseJsonObject(content), rawText: content };
}

export async function requestGroqText({
  systemPrompt,
  userPrompt,
  logPrefix,
  temperature = 0.7,
  maxCompletionTokens = 1800,
}: {
  systemPrompt: string;
  userPrompt: string;
  logPrefix: string;
  temperature?: number;
  maxCompletionTokens?: number;
}) {
  console.info(`${logPrefix} Starting Groq request`);
  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature,
        max_completion_tokens: maxCompletionTokens,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      cache: "no-store",
    });
  } catch (error) {
    throw new GroqRequestError(
      error instanceof Error ? error.message : String(error),
    );
  }

  console.info(`${logPrefix} Groq response status:`, response.status);
  const rawResponse = await response.text();
  if (!response.ok) {
    throw new GroqRequestError(
      `Groq API returned ${response.status}: ${upstreamError(rawResponse)}`,
      502,
      rawResponse,
    );
  }

  let completion: { choices?: Array<{ message?: { content?: string } }> };
  try {
    completion = JSON.parse(rawResponse) as typeof completion;
  } catch {
    throw new GroqRequestError(
      "Groq returned an invalid response envelope",
      502,
      rawResponse,
    );
  }

  const raw = completion.choices?.[0]?.message?.content ?? "";
  if (!raw) {
    throw new GroqRequestError(
      "Groq returned no message content",
      502,
      rawResponse,
    );
  }

  return raw;
}
