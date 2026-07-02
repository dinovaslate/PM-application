const DEFAULT_MODEL = "gpt-5.4-mini";
const MAX_SNAPSHOT_BYTES = 18000;

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
    return jsonResponse(403, { error: "Origin is not allowed for this AI proxy." }, headers);
  }

  if (!process.env.OPENAI_API_KEY) {
    return jsonResponse(
      501,
      {
        error: "OPENAI_API_KEY is not configured.",
        setup: "Set OPENAI_API_KEY in Netlify environment variables to enable AI Brief.",
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

  const snapshot = sanitizeSnapshot(payload.snapshot);
  const snapshotText = JSON.stringify(snapshot);
  if (new TextEncoder().encode(snapshotText).length > MAX_SNAPSHOT_BYTES) {
    return jsonResponse(413, { error: "Dashboard snapshot is too large." }, headers);
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_output_tokens: 900,
        input: [
          {
            role: "system",
            content:
              "You are a PMO portfolio analyst. Return valid compact JSON only with keys: summary, actions, questions. Keep it practical, concise, and based only on the provided dashboard snapshot.",
          },
          {
            role: "user",
            content: `Analyze this PMO dashboard snapshot and produce an Indonesian executive action brief. JSON schema: {"summary":"string","actions":[{"priority":"Critical|High|Medium","title":"string","detail":"string"}],"questions":["string"]}. Snapshot: ${snapshotText}`,
          },
        ],
      }),
    });

    const upstreamBody = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return jsonResponse(
        upstream.status,
        {
          error: upstreamBody.error?.message || "OpenAI request failed.",
        },
        headers,
      );
    }

    const outputText = extractOutputText(upstreamBody);
    const brief = parseBrief(outputText);
    return jsonResponse(
      200,
      {
        provider: "openai",
        model,
        brief,
      },
      headers,
    );
  } catch (error) {
    return jsonResponse(502, { error: error.message || "AI proxy failed." }, headers);
  }
}

function sanitizeSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return {};
  return {
    generatedAt: snapshot.generatedAt,
    source: String(snapshot.source || "").slice(0, 180),
    kpis: snapshot.kpis || {},
    dataQuality: snapshot.dataQuality || {},
    healthByBu: limitRows(snapshot.healthByBu, 8),
    scheduleDistribution: limitRows(snapshot.scheduleDistribution, 8),
    topPriorityProjects: limitRows(snapshot.topPriorityProjects, 8),
    topRiskyPms: limitRows(snapshot.topRiskyPms, 8),
    topCostPms: limitRows(snapshot.topCostPms, 8),
  };
}

function limitRows(rows, limit) {
  return Array.isArray(rows) ? rows.slice(0, limit) : [];
}

function extractOutputText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  const chunks = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

function parseBrief(text) {
  const fallback = {
    summary: text || "AI tidak mengembalikan ringkasan.",
    actions: [],
    questions: [],
  };

  if (!text) return fallback;

  try {
    const parsed = JSON.parse(text);
    return normalizeBrief(parsed);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    try {
      return normalizeBrief(JSON.parse(match[0]));
    } catch {
      return fallback;
    }
  }
}

function normalizeBrief(brief) {
  return {
    summary: String(brief.summary || "").slice(0, 700),
    actions: Array.isArray(brief.actions)
      ? brief.actions.slice(0, 5).map((action) => ({
          priority: String(action.priority || "Medium").slice(0, 20),
          title: String(action.title || "").slice(0, 120),
          detail: String(action.detail || "").slice(0, 260),
        }))
      : [],
    questions: Array.isArray(brief.questions) ? brief.questions.slice(0, 4).map((question) => String(question).slice(0, 180)) : [],
  };
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
