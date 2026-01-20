import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './AIBOMGraph.css';

interface AIBOMGraphProps {
  graphData: any;
}

const AIBOMGraph: React.FC<AIBOMGraphProps> = ({ graphData }) => {
  if (!graphData || !graphData.nodes || !graphData.edges) {
    return (
      <div className="graph-empty">
        <p>No graph data available</p>
      </div>
    );
  }

  const initialNodes = useMemo(() => {
    return graphData.nodes.map((node: any) => ({
      id: node.id.toString(),
      type: 'default',
      data: { 
        label: node.label,
        ...node.metadata
      },
      position: { x: 0, y: 0 },
      style: {
        background: node.color,
        color: '#fff',
        border: '2px solid #1a1a1a',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: '500',
        width: node.size * 3,
        height: node.size * 2,
      },
    }));
  }, [graphData]);

  const initialEdges = useMemo(() => {
    return graphData.edges.map((edge: any, idx: number) => ({
      id: `e${edge.from}-${edge.to}-${idx}`,
      source: edge.from.toString(),
      target: edge.to.toString(),
      label: edge.label,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#666', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#666',
      },
    }));
  }, [graphData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    const layers = ['data', 'model', 'framework', 'training', 'inference', 'infrastructure', 'monitoring'];
    const layerSpacing = 250;
    const nodeSpacing = 100;

    const layoutedNodes = nodes.map((node) => {
      const nodeData = graphData.nodes.find((n: any) => n.id.toString() === node.id);
      const layerIndex = layers.indexOf(nodeData.layer);
      const nodesInLayer = graphData.nodes.filter((n: any) => n.layer === nodeData.layer);
      const indexInLayer = nodesInLayer.findIndex((n: any) => n.id.toString() === node.id);

      return {
        ...node,
        position: {
          x: layerIndex * layerSpacing,
          y: indexInLayer * nodeSpacing,
        },
      };
    });

    setNodes(layoutedNodes);
  }, [graphData]);

  return (
    <div className="aibom-graph-container">
      <div className="graph-header">
        <h3>AIBOM Dependency Graph</h3>
        <div className="graph-stats">
          <span className="stat"><strong>{graphData.total_nodes}</strong> Nodes</span>
          <span className="stat"><strong>{graphData.total_edges}</strong> Edges</span>
        </div>
      </div>

      <div className="graph-legend">
        {Object.entries(graphData.layer_colors).map(([layer, color]: [string, any]) => (
          <div key={layer} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: color }}></span>
            <span className="legend-label">{layer}</span>
            <span className="legend-count">({graphData.layer_summary[layer] || 0})</span>
          </div>
        ))}
      </div>

      <div className="graph-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Controls />
          <MiniMap nodeColor={(node) => {
            const nodeData = graphData.nodes.find((n: any) => n.id.toString() === node.id);
            return nodeData?.color || '#666';
          }} maskColor="rgba(0, 0, 0, 0.8)" />
          <Background color="#333" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default AIBOMGraph;
