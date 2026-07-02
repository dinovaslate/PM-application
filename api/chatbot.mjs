import { handler as netlifyChatbotHandler } from "../netlify/functions/chatbot.mjs";

export default async function handler(req, res) {
  const result = await netlifyChatbotHandler({
    httpMethod: req.method,
    headers: req.headers || {},
    body: typeof req.body === "string" ? req.body : JSON.stringify(req.body || {}),
  });

  Object.entries(result.headers || {}).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.status(result.statusCode || 500).send(result.body || "");
}
