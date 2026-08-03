import { GoogleGenAI, Type } from "@google/genai";
import { DepthOption, RoadmapGraph, RoadmapNodeData } from "../src/types";

// Server-side Gemini AI Client with AI Studio telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Using fallback roadmap generator if available.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MISSING_KEY",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// In-memory cache for fast instant response and token saving
const roadmapCache = new Map<string, RoadmapGraph>();

export async function generateOrGetRoadmap(topic: string, depth: DepthOption): Promise<{ graph: RoadmapGraph; cached: boolean }> {
  const normalizedTopic = topic.trim();
  const cacheKey = `${normalizedTopic.toLowerCase()}__${depth}`;

  if (roadmapCache.has(cacheKey)) {
    console.log(`[Cache Hit] Returning cached roadmap for "${normalizedTopic}" (${depth})`);
    return { graph: roadmapCache.get(cacheKey)!, cached: true };
  }

  console.log(`[AI Gen] Generating roadmap for "${normalizedTopic}" (${depth})...`);

  // Target node count & total time based on depth selection
  let targetNodes = 6;
  let totalTime = "≈ 30 mins";
  let depthPromptText = "";

  switch (depth) {
    case "curious":
      targetNodes = 6;
      totalTime = "≈ 30 mins";
      depthPromptText = "Just Curious mode: Create 5 to 7 high-level core foundational nodes that give a fast, crisp overview of the topic in 30 minutes.";
      break;
    case "learn":
      targetNodes = 12;
      totalTime = "≈ 12 hrs";
      depthPromptText = "Learn mode: Create 10 to 14 structured, practical nodes covering foundational concepts up to working proficiency in ~12 hours.";
      break;
    case "master":
      targetNodes = 20;
      totalTime = "≈ 80 hrs";
      depthPromptText = "Master mode: Create 18 to 24 comprehensive nodes covering core fundamentals, advanced techniques, architecture/theories, and practical mastery in ~80 hours.";
      break;
    case "rabbithole":
      targetNodes = 32;
      totalTime = "≈ 250+ hrs";
      depthPromptText = "Rabbit Hole mode: Create an exhaustive, deep dependency graph with 28 to 38 nodes covering every prerequisite, historical context, underlying theory, advanced specialization, edge cases, and expert topics.";
      break;
  }

  try {
    const ai = getGeminiClient();
    
    const prompt = `You are the master knowledge graph generator for 'themoreiknowthebetter', a visual learning roadmap engine.
Generate a structured, logical dependency graph for the topic: "${normalizedTopic}".

Mode: ${depthPromptText}

CRITICAL REQUIREMENTS:
1. Begin from absolute beginner prerequisites (Node 1 has NO prerequisites).
2. Every node must logically link to its prerequisites (using node IDs like 'node-1', 'node-2').
3. Ensure no cycles or missing steps.
4. Each node must represent a clear concept to learn.
5. Provide curated real-world learning resources for each node (YouTube search query / docs link / article / recommended book).
6. Provide a concise 2-3 paragraph study guide / summary overview in markdown for each node.

Return ONLY JSON conforming strictly to the requested schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            summaryOverview: { type: Type.STRING, description: "A crisp 2-sentence summary of what learning this topic entails." },
            estimatedTotalTime: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "e.g. node-1, node-2" },
                  title: { type: Type.STRING, description: "Short, crisp concept name" },
                  shortDescription: { type: Type.STRING, description: "1-2 sentence explanation of what this concept is" },
                  estimatedTime: { type: Type.STRING, description: "e.g. 20 mins, 2 hrs" },
                  difficulty: { type: Type.STRING, description: "Beginner | Intermediate | Advanced | Expert" },
                  importance: { type: Type.STRING, description: "Core Foundation | Essential | Specialized | Deep Dive" },
                  prerequisites: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of node IDs that must be learned prior to this node"
                  },
                  resources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING, description: "youtube | article | docs | book | practice" },
                        title: { type: Type.STRING },
                        url: { type: Type.STRING, description: "Full URL or search link" },
                        description: { type: Type.STRING }
                      },
                      required: ["type", "title", "url"]
                    }
                  },
                  studyGuideMarkdown: { type: Type.STRING, description: "Detailed markdown study guide / notes for this concept" }
                },
                required: ["id", "title", "shortDescription", "estimatedTime", "difficulty", "importance", "prerequisites", "resources", "studyGuideMarkdown"]
              }
            }
          },
          required: ["topic", "summaryOverview", "estimatedTotalTime", "nodes"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini model.");
    }

    const parsedData = JSON.parse(responseText);

    const formattedNodes: RoadmapNodeData[] = parsedData.nodes.map((n: any, idx: number) => {
      // Ensure sketch rotation for hand-drawn aesthetic
      const rotation = (Math.random() * 2.4 - 1.2);
      
      // Map resources to ensure valid YouTube / search links
      const resources = (n.resources || []).map((r: any) => {
        let cleanUrl = r.url;
        if (r.type === 'youtube' && (!cleanUrl || !cleanUrl.startsWith('http'))) {
          cleanUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(normalizedTopic + ' ' + n.title)}`;
        } else if (!cleanUrl || !cleanUrl.startsWith('http')) {
          cleanUrl = `https://www.google.com/search?q=${encodeURIComponent(normalizedTopic + ' ' + n.title + ' tutorial')}`;
        }
        return {
          type: r.type || 'article',
          title: r.title || `${n.title} Resource`,
          url: cleanUrl,
          description: r.description || ''
        };
      });

      return {
        id: n.id || `node-${idx + 1}`,
        title: n.title,
        shortDescription: n.shortDescription,
        estimatedTime: n.estimatedTime || "30 mins",
        difficulty: (['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(n.difficulty) ? n.difficulty : 'Beginner') as any,
        importance: (['Core Foundation', 'Essential', 'Specialized', 'Deep Dive'].includes(n.importance) ? n.importance : 'Essential') as any,
        prerequisites: Array.isArray(n.prerequisites) ? n.prerequisites : [],
        resources: resources,
        studyGuideMarkdown: n.studyGuideMarkdown || `### ${n.title}\n\n${n.shortDescription}\n\nKey Concepts:\n- Core principles of ${n.title}\n- Practical applications in ${normalizedTopic}`,
        completed: false,
        userNotes: "",
        sketchRotation: Number(rotation.toFixed(2))
      };
    });

    const graph: RoadmapGraph = {
      id: `graph_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      topic: normalizedTopic,
      depth: depth,
      estimatedTotalTime: parsedData.estimatedTotalTime || totalTime,
      createdAt: new Date().toISOString(),
      nodes: formattedNodes,
      progress: {
        completedCount: 0,
        totalCount: formattedNodes.length,
        percentage: 0,
        timeSpentMins: 0,
        estimatedRemainingTime: parsedData.estimatedTotalTime || totalTime
      },
      summaryOverview: parsedData.summaryOverview || `A visual, hand-drawn dependency roadmap to learn ${normalizedTopic} effectively.`
    };

    // Cache the graph
    roadmapCache.set(cacheKey, graph);

    return { graph, cached: false };

  } catch (error: any) {
    console.error("Gemini API generation error:", error);
    // Return curated fallback roadmap for seamless UX if API fails or key is missing
    return { graph: generateFallbackRoadmap(normalizedTopic, depth), cached: false };
  }
}

// Generates an elegant fallback dependency graph if AI fails or key is unconfigured
function generateFallbackRoadmap(topic: string, depth: DepthOption): RoadmapGraph {
  const sampleNodesCount = depth === 'curious' ? 6 : depth === 'learn' ? 12 : depth === 'master' ? 18 : 25;
  const nodes: RoadmapNodeData[] = [];

  const stages = [
    { name: "Foundations & Core Principles", level: "Beginner" as const, importance: "Core Foundation" as const },
    { name: "Key Patterns & Syntax", level: "Beginner" as const, importance: "Essential" as const },
    { name: "Intermediate Concepts & Tools", level: "Intermediate" as const, importance: "Essential" as const },
    { name: "Practical Applications & Workflows", level: "Intermediate" as const, importance: "Specialized" as const },
    { name: "Advanced Theories & Optimization", level: "Advanced" as const, importance: "Deep Dive" as const },
    { name: "Mastery, Edge Cases & Architecture", level: "Expert" as const, importance: "Deep Dive" as const }
  ];

  for (let i = 0; i < sampleNodesCount; i++) {
    const stageIdx = Math.min(Math.floor((i / sampleNodesCount) * stages.length), stages.length - 1);
    const stage = stages[stageIdx];
    const nodeId = `node-${i + 1}`;
    const prereqs = i === 0 ? [] : [`node-${Math.max(1, i)}`];

    nodes.push({
      id: nodeId,
      title: `${topic}: ${stage.name} Part ${i + 1}`,
      shortDescription: `Master essential principles of ${topic} including ${stage.name.toLowerCase()} and practical application.`,
      estimatedTime: `${15 + (i * 10)} mins`,
      difficulty: stage.level,
      importance: stage.importance,
      prerequisites: prereqs,
      resources: [
        {
          type: 'youtube',
          title: `Comprehensive ${topic} Tutorial`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`,
          description: `Top community recommended video for ${topic}`
        },
        {
          type: 'docs',
          title: `Official ${topic} Handbook & Docs`,
          url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' official documentation')}`,
          description: 'Reference documentation and specification'
        }
      ],
      studyGuideMarkdown: `### ${topic} - ${stage.name}\n\nUnderstanding ${stage.name.toLowerCase()} is crucial to unlocking ${topic}.\n\n#### Key Objectives:\n1. Core terminology\n2. First principles & mental models\n3. Common pitfalls to avoid`,
      completed: false,
      userNotes: "",
      sketchRotation: Number((Math.random() * 2.4 - 1.2).toFixed(2))
    });
  }

  return {
    id: `fallback_${Date.now()}`,
    topic: topic,
    depth: depth,
    estimatedTotalTime: depth === 'curious' ? '≈ 30 mins' : depth === 'learn' ? '≈ 12 hrs' : depth === 'master' ? '≈ 80 hrs' : '≈ 200+ hrs',
    createdAt: new Date().toISOString(),
    nodes: nodes,
    progress: {
      completedCount: 0,
      totalCount: nodes.length,
      percentage: 0,
      timeSpentMins: 0,
      estimatedRemainingTime: depth === 'curious' ? '≈ 30 mins' : '≈ 12 hrs'
    },
    summaryOverview: `An interactive dependency roadmap for learning ${topic}.`
  };
}
