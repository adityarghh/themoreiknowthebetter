import React from 'react';
import dagre from 'dagre';
import { RoadmapNodeData } from '../types';

export interface CustomFlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: RoadmapNodeData & {
    onSelectNode?: (nodeId: string) => void;
    onToggleComplete?: (nodeId: string, event: React.MouseEvent) => void;
  };
}

export interface CustomFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
}

export function getLayoutedGraph(
  nodesData: RoadmapNodeData[],
  onSelectNode: (id: string) => void,
  onToggleComplete: (id: string, e: React.MouseEvent) => void,
  direction: 'TB' | 'LR' = 'TB'
): { nodes: CustomFlowNode[]; edges: CustomFlowEdge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: direction,
    nodesep: 90,
    ranksep: 110,
    marginx: 50,
    marginy: 50
  });
  g.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 260;
  const nodeHeight = 140;

  // Set nodes in Dagre
  nodesData.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Build edges from prerequisites
  const edges: CustomFlowEdge[] = [];
  nodesData.forEach((node) => {
    if (node.prerequisites && node.prerequisites.length > 0) {
      node.prerequisites.forEach((prereqId) => {
        // Ensure prereq exists
        if (nodesData.some(n => n.id === prereqId)) {
          const edgeId = `e_${prereqId}_to_${node.id}`;
          g.setEdge(prereqId, node.id);

          edges.push({
            id: edgeId,
            source: prereqId,
            target: node.id,
            type: 'default',
            animated: !node.completed,
            style: {
              stroke: node.completed ? 'rgba(255, 255, 255, 0.4)' : '#ffffff',
              strokeWidth: node.completed ? 1.5 : 2.5,
              strokeDasharray: node.completed ? '4 4' : undefined
            }
          });
        }
      });
    }
  });

  dagre.layout(g);

  // Position nodes
  const nodes: CustomFlowNode[] = nodesData.map((node) => {
    const nodeWithPos = g.node(node.id);
    const x = nodeWithPos ? nodeWithPos.x - nodeWidth / 2 : Math.random() * 500;
    const y = nodeWithPos ? nodeWithPos.y - nodeHeight / 2 : Math.random() * 500;

    return {
      id: node.id,
      type: 'handDrawnNode',
      position: { x, y },
      data: {
        ...node,
        onSelectNode,
        onToggleComplete
      }
    };
  });

  return { nodes, edges };
}
