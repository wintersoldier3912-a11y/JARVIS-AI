
import React, { useEffect, useRef } from 'react';
import { KnowledgeNode, KnowledgeEdge } from '../types';

interface Props {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

const KnowledgeGraph: React.FC<Props> = ({ nodes, edges }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Simple force simulation logic for visualization
  const getCoordinates = (index: number, total: number) => {
    const radius = 60;
    const angle = (index / total) * 2 * Math.PI;
    return {
      x: 150 + radius * Math.cos(angle),
      y: 100 + radius * Math.sin(angle)
    };
  };

  if (!nodes || nodes.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center border border-jarvis-blue/10 rounded bg-jarvis-blue/5">
        <span className="text-[10px] font-mono text-jarvis-blue/40 animate-pulse">NO_ENTITY_DATA</span>
      </div>
    );
  }

  // Assign fixed positions for simple circular layout to avoid complex D3 logic in this lightweight implementation
  const renderedNodes = nodes.map((node, i) => ({
    ...node,
    ...getCoordinates(i, nodes.length)
  }));

  return (
    <div className="relative w-full h-48 border border-jarvis-blue/20 rounded bg-black/40 overflow-hidden">
      <div className="absolute top-2 right-2 text-[10px] font-mono text-jarvis-blue/60">KNOWLEDGE_GRAPH.SYS</div>
      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 300 200">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="20" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#00f0ff" opacity="0.5" />
          </marker>
        </defs>
        
        {/* Edges */}
        {edges.map((edge, i) => {
          const source = renderedNodes.find(n => n.id === edge.source);
          const target = renderedNodes.find(n => n.id === edge.target);
          if (!source || !target) return null;
          return (
            <g key={i}>
              <line 
                x1={source.x} y1={source.y} 
                x2={target.x} y2={target.y} 
                stroke="#00f0ff" 
                strokeWidth="1" 
                strokeOpacity="0.3"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}

        {/* Nodes */}
        {renderedNodes.map((node, i) => (
          <g key={node.id} className="cursor-pointer hover:opacity-100 transition-opacity">
            <circle cx={node.x} cy={node.y} r="4" fill="#0a0a12" stroke="#00f0ff" strokeWidth="2" />
            <text 
              x={node.x} 
              y={node.y - 10} 
              textAnchor="middle" 
              fill="#00f0ff" 
              fontSize="8" 
              fontFamily="monospace"
              className="select-none"
            >
              {node.label}
            </text>
            <circle cx={node.x} cy={node.y} r="8" fill="transparent" stroke="#00f0ff" strokeOpacity="0.2" className="animate-pulse" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default KnowledgeGraph;
