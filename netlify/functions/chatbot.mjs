const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const MAX_SNAPSHOT_BYTES = 70000;
const MAX_QUESTION_CHARS = 1200;
const MAX_HISTORY_ITEMS = 10;
const MAX_IMAGE_BYTES = 2_500_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const SYSTEM_PROMPT =
  "You are a PMO portfolio analyst chatbot for a React dashboard. Answer in Indonesian. Use only the provided dashboard snapshot and conversation history. If the data is missing, say what is missing instead of guessing. Be concise, practical, and explicit about proxy metrics such as active-project workload.";

export async function handler(event) {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const headers = getCorsHeaders(origin);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" }, headers);
  }

  if (!isOriginAllowed(origin)) {
    return jsonResponse(403, { error: "Origin is not allowed for this chatbot proxy." }, headers);
  }

  if (!process.env.GEMINI_API_KEY) {
    return jsonResponse(
      501,
      {
        error: "GEMINI_API_KEY is not configured.",
        setup: "Set GEMINI_API_KEY in Vercel or Netlify environment variables to enable PMO Chat.",
      },
      headers,
    );
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body." }, headers);
  }

  const question = String(payload.message || "").trim().slice(0, MAX_QUESTION_CHARS);
  if (!question) {
    return jsonResponse(400, { error: "Message is required." }, headers);
  }

  const snapshot = sanitizeSnapshot(payload.snapshot);
  const snapshotText = JSON.stringify(snapshot);
  if (new TextEncoder().encode(snapshotText).length > MAX_SNAPSHOT_BYTES) {
    return jsonResponse(413, { error: "Dashboard snapshot is too large for chat." }, headers);
  }

  const history = sanitizeHistory(payload.history);
  let image = null;
  try {
    image = sanitizeImage(payload.image);
  } catch (error) {
    return jsonResponse(error.statusCode || 400, { error: error.message || "Invalid image." }, headers);
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  try {
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "x-goog-api-key": process.env.GEMINI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        system_instruction: SYSTEM_PROMPT,
        input: buildChatInput(snapshotText, history, question, image),
        generation_config: {
          temperature: 0.25,
          thinking_level: "low",
        },
      }),
    });

    const upstreamBody = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return jsonResponse(
        upstream.status,
        {
          error: upstreamBody.error?.message || "Gemini request failed.",
        },
        headers,
      );
    }

    const answer = normalizeAnswer(extractOutputText(upstreamBody));
    return jsonResponse(
      200,
      {
        provider: "gemini",
        model,
        answer,
      },
      headers,
    );
  } catch (error) {
    return jsonResponse(502, { error: error.message || "Gemini chatbot proxy failed." }, headers);
  }
}

function buildChatInput(snapshotText, history, question, image) {
  const conversation = history.length
    ? history.map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.content}`).join("\n")
    : "No prior conversation.";

  const prompt = [
    "Dashboard snapshot:",
    snapshotText,
    "",
    "Recent conversation:",
    conversation,
    "",
    `User question: ${question}`,
    image ? `Attached image: ${image.name || "image"} (${image.mime_type}). Use it together with the dashboard snapshot.` : "",
    "",
    "Answer rules: Indonesian only. Keep the answer under 8 short bullet points or 2 short paragraphs. Mention exact numbers when available. Do not invent project details outside the snapshot. Prefer clean plain Markdown bullets and bold labels when useful.",
  ]
    .filter(Boolean)
    .join("\n");

  const input = [{ type: "text", text: prompt }];
  if (image) {
    input.push({
      type: "image",
      data: image.data,
      mime_type: image.mime_type,
    });
  }
  return input;
}

function sanitizeSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return {};
  return {
    generatedAt: snapshot.generatedAt,
    source: String(snapshot.source || "").slice(0, 180),
    kpis: snapshot.kpis || {},
    dataQuality: snapshot.dataQuality || {},
    healthDistribution: limitRows(snapshot.healthDistribution, 8),
    scheduleDistribution: limitRows(snapshot.scheduleDistribution, 8),
    dueDistribution: limitRows(snapshot.dueDistribution, 8),
    issueByType: limitRows(snapshot.issueByType, 12),
    resourceDistribution: limitRows(snapshot.resourceDistribution, 10),
    costDistribution: limitRows(snapshot.costDistribution, 10),
    workloadTrend: limitRows(snapshot.workloadTrend, 12),
    costTrend: limitRows(snapshot.costTrend, 12),
    pmPortfolioSummary: limitRows(snapshot.pmPortfolioSummary, 120),
    pmRiskList: limitRows(snapshot.pmRiskList, 120),
    topPriorityProjects: limitRows(snapshot.topPriorityProjects, 25),
    highValueProjects: limitRows(snapshot.highValueProjects, 15),
  };
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && (item.role === "user" || item.role === "assistant"))
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item.role,
      content: String(item.content || "").slice(0, 1000),
    }))
    .filter((item) => item.content.trim());
}

function sanitizeImage(image) {
  if (!image || typeof image !== "object") return null;
  const mimeType = String(image.mimeType || image.mime_type || "").toLowerCase();
  const data = String(image.data || "").replace(/^data:[^;]+;base64,/, "");
  if (!mimeType || !data) return null;
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    const error = new Error("Unsupported image type. Use JPG, PNG, WEBP, or GIF.");
    error.statusCode = 400;
    throw error;
  }

  let byteLength = 0;
  try {
    byteLength = Buffer.byteLength(data, "base64");
  } catch {
    const error = new Error("Invalid image data.");
    error.statusCode = 400;
    throw error;
  }

  if (byteLength > MAX_IMAGE_BYTES) {
    const error = new Error("Image is too large. Use an image under 2.5 MB.");
    error.statusCode = 413;
    throw error;
  }

  return {
    name: String(image.name || "image").slice(0, 120),
    mime_type: mimeType,
    data,
  };
}

function limitRows(rows, limit) {
  return Array.isArray(rows) ? rows.slice(0, limit) : [];
}

function extractOutputText(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) return response.output_text;
  const chunks = [];

  for (const step of response.steps || []) {
    if (step.type && step.type !== "model_output") continue;
    collectTextContent(step.content, chunks);
  }

  for (const item of response.output || []) {
    collectTextContent(item.content, chunks);
  }

  for (const candidate of response.candidates || []) {
    collectTextContent(candidate.content, chunks);
  }

  return chunks.join("\n").trim();
}

function collectTextContent(content, chunks) {
  if (!content) return;
  if (typeof content === "string") {
    chunks.push(content);
    return;
  }
  if (Array.isArray(content)) {
    content.forEach((item) => collectTextContent(item, chunks));
    return;
  }
  if (typeof content.text === "string") {
    chunks.push(content.text);
  }
  if (Array.isArray(content.parts)) {
    content.parts.forEach((part) => collectTextContent(part, chunks));
  }
  if (Array.isArray(content.content)) {
    content.content.forEach((item) => collectTextContent(item, chunks));
  }
}

function normalizeAnswer(answer) {
  const text = String(answer || "").trim();
  return text || "Gemini tidak mengembalikan jawaban.";
}

function getCorsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(origin),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

function getAllowedOrigin(origin) {
  if (!origin) return "*";
  const allowed = getAllowedOrigins();
  return !allowed.length || allowed.includes(origin) ? origin : allowed[0];
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  const allowed = getAllowedOrigins();
  return !allowed.length || allowed.includes(origin);
}

function getAllowedOrigins() {
  return String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function jsonResponse(statusCode, body, headers) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}
