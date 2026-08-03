import { DepthOption, RoadmapGraph, RoadmapNodeData } from '../types';

export function generateClientFallbackGraph(topic: string, depth: DepthOption): RoadmapGraph {
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
