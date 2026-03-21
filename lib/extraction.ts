import { extractionResultSchema, type ExtractionResult } from "@/lib/validations";

const SYSTEM = `You are a mining M&A document analyst. Extract structured data from the provided text into JSON only.
Return a single JSON object matching this shape (use null for unknown numbers/strings):
{
  "reservesMt": number | null,
  "measuredMt": number | null,
  "indicatedMt": number | null,
  "inferredMt": number | null,
  "coalGarAvg": number | null,
  "cashCostEstimate": number | null,
  "annualRevenue": number | null,
  "ebitda": number | null,
  "netAssets": number | null,
  "iupStatus": string | null,
  "environmentalStatus": string | null,
  "complianceFlags": {
    "iupValid": boolean,
    "certClean": boolean,
    "amdal": boolean,
    "ppa": boolean,
    "dmb": boolean
  },
  "confidence": number
}
No markdown, no prose — JSON only.`;

export async function runGroqExtraction(documentText: string): Promise<ExtractionResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Document text:\n\n${documentText.slice(0, 12000)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  const slice = jsonStart >= 0 && jsonEnd >= jsonStart ? raw.slice(jsonStart, jsonEnd + 1) : raw;
  const parsed = JSON.parse(slice);
  return extractionResultSchema.parse(parsed);
}
