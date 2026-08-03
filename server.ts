import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { generateOrGetRoadmap } from "./server/roadmapGenerator";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "themoreiknowthebetter" });
  });

  // Generate or fetch cached roadmap
  app.post("/api/roadmap/generate", async (req, res) => {
    try {
      const { topic, depth } = req.body;
      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "Topic is required" });
      }

      const validDepths = ["curious", "learn", "master", "rabbithole"];
      const selectedDepth = validDepths.includes(depth) ? depth : "learn";

      const result = await generateOrGetRoadmap(topic, selectedDepth as any);
      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/roadmap/generate:", err);
      res.status(500).json({ error: err.message || "Failed to generate roadmap" });
    }
  });

  // Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
