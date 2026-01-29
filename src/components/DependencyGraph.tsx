import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../services/api';

interface GraphNode {
  id: number;
  label: string;
  type: string;
  layer: string;
  color: string;
  size: number;
  metadata?: {
    file?: string;
    version?: string;
    type?: string;
    purpose?: string;
  };
  vulnerabilities?: Array<{
    severity: string;
    title: string;
    cve?: string;
  }>;
  vulnerability_count?: number;
  border_color?: string;
  risk_level?: string;
}

interface GraphEdge {
  from: number;
  to: number;
  label?: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layer_summary?: Record<string, number>;
  layer_colors?: Record<string, string>;
  vulnerability_summary?: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    affected_nodes: number;
  };
}

interface DependencyGraphProps {
  projectId: number;
  showVulnerabilities?: boolean;
}

const layerYPositions: Record<string, number> = {
  data: 0,
  model: 150,
  framework: 300,
  training: 450,
  inference: 600,
  infrastructure: 750,
  monitoring: 900,
};

export default function DependencyGraph({ projectId, showVulnerabilities = true }: DependencyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const fetchGraph = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = showVulnerabilities
        ? `/dependency-graph/${projectId}/enhanced?include_vulnerabilities=true`
        : `/dependency-graph/${projectId}`;

      const response = await api.get(endpoint);
      const data = response.data.graph;
      setGraphData(data);

      // Convert to ReactFlow format
      const flowNodes: Node[] = data.nodes.map((node: GraphNode, index: number) => {
        const layerNodes = data.nodes.filter((n: GraphNode) => n.layer === node.layer);
        const layerIndex = layerNodes.findIndex((n: GraphNode) => n.id === node.id);
        const xSpacing = 180;
        const xOffset = (layerNodes.length - 1) * xSpacing / 2;

        return {
          id: String(node.id),
          position: {
            x: layerIndex * xSpacing - xOffset + 400,
            y: layerYPositions[node.layer] || index * 100,
          },
          data: {
            label: (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>{node.label}</div>
                {node.metadata?.version && (
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>v{node.metadata.version}</div>
                )}
                {node.vulnerability_count && node.vulnerability_count > 0 && (
                  <div style={{
                    fontSize: '10px',
                    marginTop: '4px',
                    padding: '2px 6px',
                    background: node.risk_level === 'critical' ? '#dc2626' :
                               node.risk_level === 'high' ? '#f97316' :
                               node.risk_level === 'medium' ? '#eab308' : '#3b82f6',
                    borderRadius: '4px',
                    color: '#fff'
                  }}>
                    {node.vulnerability_count} vuln{node.vulnerability_count > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ),
            nodeData: node,
          },
          style: {
            background: node.color,
            color: '#fff',
            border: node.border_color ? `3px solid ${node.border_color}` : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '10px 15px',
            fontSize: '12px',
            width: node.size * 4,
            boxShadow: node.vulnerability_count && node.vulnerability_count > 0
              ? `0 0 10px ${node.border_color || node.color}`
              : '0 2px 4px rgba(0,0,0,0.2)',
          },
          type: 'default',
        };
      });

      const flowEdges: Edge[] = data.edges.map((edge: GraphEdge, index: number) => ({
        id: `e${index}`,
        source: String(edge.from),
        target: String(edge.to),
        label: edge.label,
        animated: true,
        style: { stroke: '#666' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#666',
        },
        labelStyle: { fontSize: '10px', fill: '#888' },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch dependency graph:', err);
      setError(err.response?.data?.detail || 'Failed to load dependency graph');
    } finally {
      setLoading(false);
    }
  }, [projectId, showVulnerabilities, setNodes, setEdges]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node.data.nodeData);
  }, []);

  const filterByLayer = (layer: string | null) => {
    setSelectedLayer(layer);
    if (!graphData) return;

    if (layer === null) {
      // Show all nodes
      fetchGraph();
      return;
    }

    // Filter nodes by layer
    const filteredNodes = graphData.nodes.filter(n => n.layer === layer);
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = graphData.edges.filter(
      e => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to)
    );

    // Convert to ReactFlow format
    const flowNodes: Node[] = filteredNodes.map((node, index) => ({
      id: String(node.id),
      position: { x: (index % 5) * 200, y: Math.floor(index / 5) * 120 },
      data: {
        label: node.label,
        nodeData: node,
      },
      style: {
        background: node.color,
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
        padding: '10px 15px',
      },
    }));

    const flowEdges: Edge[] = filteredEdges.map((edge, index) => ({
      id: `e${index}`,
      source: String(edge.from),
      target: String(edge.to),
      animated: true,
      style: { stroke: '#666' },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  if (loading) {
    return (
      <div style={{
        height: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        borderRadius: '8px',
        border: '1px solid #1a1a1a'
      }}>
        <div style={{ color: '#888' }}>Loading dependency graph...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        borderRadius: '8px',
        border: '1px solid #1a1a1a'
      }}>
        <div style={{ color: '#ef4444' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ height: '700px', background: '#0a0a0a', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#222" gap={20} />
        <Controls style={{ background: '#1a1a1a', border: '1px solid #333' }} />
        <MiniMap
          nodeColor={(node) => node.style?.background as string || '#666'}
          style={{ background: '#1a1a1a', border: '1px solid #333' }}
        />

        {/* Layer Filter Panel */}
        <Panel position="top-left">
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '180px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>
              Filter by Layer
            </div>
            <button
              onClick={() => filterByLayer(null)}
              style={{
                display: 'block',
                width: '100%',
                padding: '6px 10px',
                marginBottom: '4px',
                background: selectedLayer === null ? '#fec76f' : '#2a2a2a',
                color: selectedLayer === null ? '#0a0a0a' : '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              All Layers
            </button>
            {graphData?.layer_colors && Object.entries(graphData.layer_colors).map(([layer, color]) => (
              <button
                key={layer}
                onClick={() => filterByLayer(layer)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 10px',
                  marginBottom: '4px',
                  background: selectedLayer === layer ? color : '#2a2a2a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: color
                }} />
                {layer.charAt(0).toUpperCase() + layer.slice(1)}
                <span style={{ marginLeft: 'auto', opacity: 0.7 }}>
                  {graphData.layer_summary?.[layer] || 0}
                </span>
              </button>
            ))}
          </div>
        </Panel>

        {/* Vulnerability Summary Panel */}
        {showVulnerabilities && graphData?.vulnerability_summary && (
          <Panel position="top-right">
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '12px',
              minWidth: '160px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>
                Vulnerabilities
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#dc2626' }}>Critical</span>
                  <span style={{ color: '#fff' }}>{graphData.vulnerability_summary.critical}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#f97316' }}>High</span>
                  <span style={{ color: '#fff' }}>{graphData.vulnerability_summary.high}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#eab308' }}>Medium</span>
                  <span style={{ color: '#fff' }}>{graphData.vulnerability_summary.medium}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#3b82f6' }}>Low</span>
                  <span style={{ color: '#fff' }}>{graphData.vulnerability_summary.low}</span>
                </div>
                <div style={{
                  borderTop: '1px solid #333',
                  paddingTop: '6px',
                  marginTop: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px'
                }}>
                  <span style={{ color: '#888' }}>Affected Nodes</span>
                  <span style={{ color: '#fff' }}>{graphData.vulnerability_summary.affected_nodes}</span>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* Node Details Panel */}
        {selectedNode && (
          <Panel position="bottom-right">
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '12px',
              minWidth: '220px',
              maxWidth: '300px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                  {selectedNode.label}
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  x
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  background: selectedNode.color,
                  borderRadius: '4px',
                  color: '#fff',
                  marginRight: '6px'
                }}>
                  {selectedNode.layer}
                </span>
                <span>{selectedNode.type}</span>
              </div>
              {selectedNode.metadata?.file && (
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px', wordBreak: 'break-all' }}>
                  {selectedNode.metadata.file}
                </div>
              )}
              {selectedNode.metadata?.version && (
                <div style={{ fontSize: '11px', color: '#888' }}>
                  Version: {selectedNode.metadata.version}
                </div>
              )}
              {selectedNode.vulnerabilities && selectedNode.vulnerabilities.length > 0 && (
                <div style={{ marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444', marginBottom: '6px' }}>
                    Vulnerabilities ({selectedNode.vulnerabilities.length})
                  </div>
                  {selectedNode.vulnerabilities.slice(0, 3).map((vuln, idx) => (
                    <div key={idx} style={{
                      fontSize: '10px',
                      color: '#888',
                      marginBottom: '4px',
                      padding: '4px',
                      background: '#0a0a0a',
                      borderRadius: '4px'
                    }}>
                      <span style={{
                        color: vuln.severity === 'critical' ? '#dc2626' :
                               vuln.severity === 'high' ? '#f97316' :
                               vuln.severity === 'medium' ? '#eab308' : '#3b82f6'
                      }}>
                        [{vuln.severity.toUpperCase()}]
                      </span>{' '}
                      {vuln.title}
                      {vuln.cve && <span style={{ color: '#666' }}> ({vuln.cve})</span>}
                    </div>
                  ))}
                  {selectedNode.vulnerabilities.length > 3 && (
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      +{selectedNode.vulnerabilities.length - 3} more...
                    </div>
                  )}
                </div>
              )}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
