import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { generateOrGetRoadmap } from "./server/roadmapGenerator";

function parseGeminiError(err: any) {
  const timestamp = new Date().toISOString();
  const modelName = "gemini-2.5-flash";

  let status = err.status || err.statusCode || err.code;
  if (typeof status === "string" && !isNaN(Number(status))) {
    status = Number(status);
  }
  const msg = String(err.message || err || "").toLowerCase();

  if (err.isInvalidAiResponse) {
    return {
      success: false,
      status: 422,
      title: "Invalid AI Response",
      message: "The AI returned an invalid response. Please try generating again.",
      code: "INVALID_AI_RESPONSE",
      retryable: true,
      details: {
        status: 422,
        code: "INVALID_AI_RESPONSE",
        model: modelName,
        timestamp,
      },
    };
  }

  if (
    status === 429 ||
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota")
  ) {
    return {
      success: false,
      status: 429,
      title: "Daily AI Generation Limit Reached",
      message:
        "Today's AI generation quota has been exhausted. Please try again after the daily quota refreshes.",
      code: "RESOURCE_EXHAUSTED",
      retryable: false,
      details: {
        status: 429,
        code: "RESOURCE_EXHAUSTED",
        model: modelName,
        timestamp,
      },
    };
  }

  if (
    status === 503 ||
    status === 504 ||
    msg.includes("503") ||
    msg.includes("unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("high demand")
  ) {
    return {
      success: false,
      status: 503,
      title: "AI Service Busy",
      message:
        "Gemini is currently experiencing unusually high demand. Please try again in a few minutes.",
      code: "SERVICE_UNAVAILABLE",
      retryable: true,
      details: {
        status: 503,
        code: "SERVICE_UNAVAILABLE",
        model: modelName,
        timestamp,
      },
    };
  }

  if (
    status === 401 ||
    msg.includes("401") ||
    msg.includes("unauthenticated") ||
    msg.includes("api_key") ||
    msg.includes("missing")
  ) {
    return {
      success: false,
      status: 401,
      title: "Authentication Failed",
      message: "Authentication with the AI service failed.",
      code: "UNAUTHENTICATED",
      retryable: false,
      details: {
        status: 401,
        code: "UNAUTHENTICATED",
        model: modelName,
        timestamp,
      },
    };
  }

  if (
    status === 403 ||
    msg.includes("403") ||
    msg.includes("permission_denied")
  ) {
    return {
      success: false,
      status: 403,
      title: "Access Forbidden",
      message: "The configured AI model cannot be accessed.",
      code: "PERMISSION_DENIED",
      retryable: false,
      details: {
        status: 403,
        code: "PERMISSION_DENIED",
        model: modelName,
        timestamp,
      },
    };
  }

  if (status === 404 || msg.includes("404") || msg.includes("not_found")) {
    return {
      success: false,
      status: 404,
      title: "Model Not Found",
      message: "The requested AI model or endpoint could not be found.",
      code: "NOT_FOUND",
      retryable: false,
      details: {
        status: 404,
        code: "NOT_FOUND",
        model: modelName,
        timestamp,
      },
    };
  }

  const httpStatus = typeof status === "number" && status >= 400 && status < 600 ? status : 500;
  return {
    success: false,
    status: httpStatus,
    title: "Unexpected Server Error",
    message: "An unexpected server error occurred while generating the roadmap.",
    code: typeof err.code === "string" ? err.code : "INTERNAL_ERROR",
    retryable: true,
    details: {
      status: httpStatus,
      code: typeof err.code === "string" ? err.code : "INTERNAL_ERROR",
      model: modelName,
      timestamp,
    },
  };
}

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
        return res.status(400).json({
          success: false,
          status: 400,
          title: "Invalid Request",
          message: "Topic parameter is required.",
          code: "INVALID_ARGUMENT",
          retryable: false,
          details: {
            status: 400,
            code: "INVALID_ARGUMENT",
            model: "gemini-2.5-flash",
            timestamp: new Date().toISOString(),
          },
        });
      }

      const validDepths = ["curious", "learn", "master", "rabbithole"];
      const selectedDepth = validDepths.includes(depth) ? depth : "learn";

      const result = await generateOrGetRoadmap(topic, selectedDepth as any);
      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error("Error in /api/roadmap/generate:", err);
      const structuredError = parseGeminiError(err);
      res.status(structuredError.status).json(structuredError);
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
