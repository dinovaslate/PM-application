import { handler as netlifyAiInsightsHandler } from "../netlify/functions/ai-insights.mjs";

export default async function handler(req, res) {
  const result = await netlifyAiInsightsHandler({
    httpMethod: req.method,
    headers: req.headers || {},
    body: typeof req.body === "string" ? req.body : JSON.stringify(req.body || {}),
  });

  Object.entries(result.headers || {}).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.status(result.statusCode || 500).send(result.body || "");
}
