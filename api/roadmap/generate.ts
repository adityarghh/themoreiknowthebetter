import { generateOrGetRoadmap } from "../../src/lib/roadmapGenerator";

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { topic, depth } = body;

    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ error: "Topic is required" });
    }

    const validDepths = ["curious", "learn", "master", "rabbithole"];
    const selectedDepth = validDepths.includes(depth) ? depth : "learn";

    const result = await generateOrGetRoadmap(topic, selectedDepth as any);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("Error in Vercel API /api/roadmap/generate:", err);
    return res.status(500).json({ error: err.message || "Failed to generate roadmap" });
  }
}
