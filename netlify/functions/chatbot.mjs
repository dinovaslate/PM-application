const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const MAX_SNAPSHOT_BYTES = 70000;
const MAX_QUESTION_CHARS = 1200;
const MAX_HISTORY_ITEMS = 10;
const MAX_IMAGE_BYTES = 2_500_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const CHART_SPEC_DATASETS = [
  "healthDistribution",
  "scheduleDistribution",
  "dueDistribution",
  "issueByType",
  "resourceDistribution",
  "costDistribution",
  "workloadTrend",
  "costTrend",
  "pmPortfolioSummary",
  "pmRiskList",
  "topPriorityProjects",
  "highValueProjects",
  "healthByBu",
  "workloadByBu",
  "projectCountByPm",
  "pmStatusDistribution",
];
const SYSTEM_PROMPT = [
  "You are a senior PMO portfolio analyst chatbot for a React dashboard.",
  "Answer in Indonesian with a direct, operational tone.",
  "Use only the provided dashboard snapshot, conversation history, and attached image when present.",
  "The Excel source can be flexible: columns may be renamed, missing, partial, duplicated, or normalized by the app before this snapshot is produced.",
  "Before making recommendations, inspect dataQuality and call out missing or low-coverage fields that affect confidence.",
  "Separate observed facts from interpretation; never invent project names, PM names, costs, dates, or statuses that are not in the snapshot.",
  "When workload, cost exposure, schedule, or due status are proxy metrics, state the proxy plainly.",
  "Prioritize action using PMO logic: unhealthy/overdue/delayed/high-cost projects and overloaded PMs are riskier than healthy on-time projects.",
].join(" ");

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
  const mode = payload.mode === "chart" ? "chart" : payload.mode === "chartSpec" ? "chartSpec" : "chat";
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
        input: buildChatInput(snapshotText, history, question, image, mode),
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

    const outputText = extractOutputText(upstreamBody);
    const parsed =
      mode === "chart"
        ? parseChartResponse(outputText)
        : mode === "chartSpec"
          ? parseChartSpecResponse(outputText)
          : { answer: normalizeAnswer(outputText), chart: null, chartSpec: null };
    return jsonResponse(
      200,
      {
        provider: "gemini",
        model,
        answer: parsed.answer,
        chart: parsed.chart || null,
        chartSpec: parsed.chartSpec || null,
      },
      headers,
    );
  } catch (error) {
    return jsonResponse(502, { error: error.message || "Gemini chatbot proxy failed." }, headers);
  }
}

function buildChatInput(snapshotText, history, question, image, mode) {
  const conversation = history.length
    ? history.map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.content}`).join("\n")
    : "No prior conversation.";
  const answerRules =
    mode === "chart"
      ? [
          'Return valid compact JSON only. Schema: {"answer":"short Indonesian explanation","chart":{"title":"string","type":"bar|line","xKey":"name","series":[{"key":"string","label":"string"}],"data":[{"name":"string","Series Key":123}],"valueFormat":"currency|count|number|percent"}}.',
          "Use only datasets present in the snapshot. If the requested chart cannot be supported by available data, set chart to null and explain the missing field in answer.",
          "Prefer chart types that match the data: bar for category comparison, line for monthly trends.",
          "Limit charts to 12 rows and 3 series. Keep labels short. No markdown fences.",
        ].join(" ")
      : mode === "chartSpec"
        ? [
            'Return valid compact JSON only. Schema: {"answer":"short Indonesian explanation","chartSpec":{"title":"string","description":"string","type":"bar|line","dataset":"string","xKey":"string","series":[{"key":"string","label":"string"}],"valueFormat":"currency|count|number|percent","limit":10,"sort":"desc|asc|none"}}.',
            "Do not return chart.data and do not calculate chart rows. The frontend will calculate rows from the selected dataset whenever Excel changes.",
            `Allowed dataset ids: ${CHART_SPEC_DATASETS.join(", ")}.`,
            "Use metric keys that exist in the chosen dataset from the snapshot. Choose metrics with the same unit when possible.",
            "Prefer line for workloadTrend or costTrend. Prefer bar for category, PM, BU, and project rankings.",
            "If the request cannot be supported, set chartSpec to null and explain what source data is missing in answer.",
            "No markdown fences.",
          ].join(" ")
      : [
          "Answer rules: Indonesian only.",
          "Keep the answer under 8 short bullet points or 2 short paragraphs unless the user explicitly asks for an audit.",
          "Start with the most decision-useful facts, using exact numbers when available.",
          "Mention data-quality limitations only when they affect the answer; say which metric/field is missing rather than guessing.",
          "For flexible Excel formats, explain what the dashboard appears to have recognized and what still needs confirmation.",
          "Prefer clean plain Markdown bullets and bold labels when useful.",
        ].join(" ");

  const prompt = [
    "Dashboard snapshot:",
    snapshotText,
    "",
    "Interpretation policy:",
    "Unknown health/status means the source data did not provide a recognized value. Unassigned PM/BU means the app could not map that source field. Cost exposure is the sum of recognized cost/value fields only. Active-project workload is a proxy unless explicit monthly workload values are present.",
    "",
    "Recent conversation:",
    conversation,
    "",
    `User question: ${question}`,
    image ? `Attached image: ${image.name || "image"} (${image.mime_type}). Use it together with the dashboard snapshot.` : "",
    "",
    answerRules,
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
    healthByBu: limitRows(snapshot.healthByBu, 12),
    workloadByBu: limitRows(snapshot.workloadByBu, 12),
    projectCountByPm: limitRows(snapshot.projectCountByPm, 12),
    pmStatusDistribution: limitRows(snapshot.pmStatusDistribution, 8),
    workloadTrend: limitRows(snapshot.workloadTrend, 12),
    costTrend: limitRows(snapshot.costTrend, 12),
    pmPortfolioSummary: limitRows(snapshot.pmPortfolioSummary, 120),
    pmRiskList: limitRows(snapshot.pmRiskList, 120),
    topPriorityProjects: limitRows(snapshot.topPriorityProjects, 25),
    highValueProjects: limitRows(snapshot.highValueProjects, 15),
    availableChartDatasets: limitRows(snapshot.availableChartDatasets, 20),
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

function parseChartResponse(text) {
  const fallback = { answer: normalizeAnswer(text), chart: null };
  if (!text) return fallback;

  const raw = String(text).trim();
  const jsonText = raw.startsWith("{") ? raw : raw.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) return fallback;

  try {
    const parsed = JSON.parse(jsonText);
    return {
      answer: normalizeAnswer(parsed.answer || parsed.summary || ""),
      chart: normalizeChart(parsed.chart),
    };
  } catch {
    return fallback;
  }
}

function parseChartSpecResponse(text) {
  const fallback = { answer: normalizeAnswer(text), chart: null, chartSpec: null };
  if (!text) return fallback;

  const raw = String(text).trim();
  const jsonText = raw.startsWith("{") ? raw : raw.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) return fallback;

  try {
    const parsed = JSON.parse(jsonText);
    return {
      answer: normalizeAnswer(parsed.answer || parsed.summary || ""),
      chart: null,
      chartSpec: normalizeChartSpec(parsed.chartSpec || parsed.chart_spec || parsed.spec),
    };
  } catch {
    return fallback;
  }
}

function normalizeChart(chart) {
  if (!chart || typeof chart !== "object") return null;
  const type = chart.type === "line" ? "line" : "bar";
  const xKey = String(chart.xKey || "name").slice(0, 40);
  const series = Array.isArray(chart.series)
    ? chart.series
        .slice(0, 3)
        .map((item) => ({
          key: String(item.key || item.label || "").slice(0, 80),
          label: String(item.label || item.key || "").slice(0, 80),
        }))
        .filter((item) => item.key)
    : [];
  const data = Array.isArray(chart.data)
    ? chart.data.slice(0, 12).map((row) => normalizeChartRow(row, xKey, series))
    : [];

  if (!series.length || !data.length) return null;

  return {
    title: String(chart.title || "Generated Chart").slice(0, 120),
    type,
    xKey,
    series,
    data,
    valueFormat: ["currency", "count", "number", "percent"].includes(chart.valueFormat) ? chart.valueFormat : "number",
  };
}

function normalizeChartRow(row, xKey, series) {
  const normalized = {
    [xKey]: String(row?.[xKey] ?? row?.name ?? row?.month ?? "").slice(0, 80),
  };
  series.forEach((item) => {
    const value = Number(row?.[item.key]);
    normalized[item.key] = Number.isFinite(value) ? value : 0;
  });
  return normalized;
}

function normalizeChartSpec(spec) {
  if (!spec || typeof spec !== "object") return null;
  const dataset = String(spec.dataset || "").trim();
  if (!CHART_SPEC_DATASETS.includes(dataset)) return null;

  const series = Array.isArray(spec.series)
    ? spec.series
        .slice(0, 3)
        .map((item) => ({
          key: String(item.key || item.metric || item.label || "").slice(0, 80),
          label: String(item.label || item.key || item.metric || "").slice(0, 80),
        }))
        .filter((item) => item.key)
    : [];
  if (!series.length) return null;

  const limit = Number(spec.limit);
  const sort = ["asc", "desc", "none"].includes(spec.sort) ? spec.sort : "desc";
  return {
    title: String(spec.title || "Custom Gemini Graph").slice(0, 120),
    description: String(spec.description || "").slice(0, 220),
    type: spec.type === "line" ? "line" : "bar",
    dataset,
    xKey: String(spec.xKey || "name").slice(0, 40),
    series,
    valueFormat: ["currency", "count", "number", "percent"].includes(spec.valueFormat) ? spec.valueFormat : "number",
    limit: Number.isFinite(limit) ? Math.min(Math.max(Math.round(limit), 3), 12) : 10,
    sort,
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
