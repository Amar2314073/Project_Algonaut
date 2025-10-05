// components/visualizers/GraphVisualizer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

class GraphNode {
  constructor(id, value = null) {
    this.id = id;
    this.value = value !== null ? value : id;
    this.x = 0;
    this.y = 0;
    this.highlighted = false;
    this.visited = false;
    this.distance = Infinity;
    this.previous = null;
  }
}

class GraphEdge {
  constructor(source, target, weight = 1, directed = false) {
    this.source = source;
    this.target = target;
    this.weight = weight;
    this.directed = directed;
    this.id = `${source.id}-${target.id}-${weight}`;
    this.highlighted = false;
  }
}

class Graph {
  constructor(directed = false, weighted = false) {
    this.nodes = new Map();
    this.edges = [];
    this.directed = directed;
    this.weighted = weighted;
    this.adjacencyList = new Map();
  }

  addNode(nodeId, value = null) {
    if (this.nodes.has(nodeId)) {
      return this.nodes.get(nodeId);
    }
    
    const newNode = new GraphNode(nodeId, value);
    this.nodes.set(nodeId, newNode);
    this.adjacencyList.set(nodeId, []);
    return newNode;
  }

  removeNode(nodeId) {
    if (!this.nodes.has(nodeId)) return false;

    // Remove node
    this.nodes.delete(nodeId);
    
    // Remove edges connected to this node
    this.edges = this.edges.filter(edge => 
      edge.source.id !== nodeId && edge.target.id !== nodeId
    );
    
    // Remove from adjacency list
    this.adjacencyList.delete(nodeId);
    
    // Remove references from other nodes' adjacency lists
    for (let [id, neighbors] of this.adjacencyList) {
      this.adjacencyList.set(id, neighbors.filter(edge => 
        edge.target.id !== nodeId
      ));
    }
    
    return true;
  }

  addEdge(sourceId, targetId, weight = 1) {
    const sourceNode = this.nodes.get(sourceId);
    const targetNode = this.nodes.get(targetId);
    
    if (!sourceNode || !targetNode) return null;

    // Check if edge already exists
    const existingEdge = this.edges.find(edge => 
      edge.source.id === sourceId && edge.target.id === targetId
    );
    
    if (existingEdge) return existingEdge;

    const newEdge = new GraphEdge(sourceNode, targetNode, weight, this.directed);
    this.edges.push(newEdge);
    
    // Update adjacency list
    this.adjacencyList.get(sourceId).push({
      node: targetNode,
      edge: newEdge,
      weight: weight
    });
    
    // For undirected graphs, add reverse connection
    if (!this.directed) {
      this.adjacencyList.get(targetId).push({
        node: sourceNode,
        edge: newEdge,
        weight: weight
      });
    }
    
    return newEdge;
  }

  removeEdge(sourceId, targetId) {
    const edgeIndex = this.edges.findIndex(edge => 
      edge.source.id === sourceId && edge.target.id === targetId
    );
    
    if (edgeIndex === -1) return false;

    this.edges.splice(edgeIndex, 1);
    
    // Remove from adjacency lists
    this.adjacencyList.set(sourceId, 
      this.adjacencyList.get(sourceId).filter(neighbor => 
        neighbor.node.id !== targetId
      )
    );
    
    if (!this.directed) {
      this.adjacencyList.set(targetId, 
        this.adjacencyList.get(targetId).filter(neighbor => 
          neighbor.node.id !== sourceId
        )
      );
    }
    
    return true;
  }

  // Graph algorithms
  breadthFirstSearch(startId, targetId = null) {
    if (!this.nodes.has(startId)) return [];
    
    this.resetNodeStates();
    const visited = new Set();
    const queue = [startId];
    const result = [];
    visited.add(startId);

    const startNode = this.nodes.get(startId);
    startNode.visited = true;
    startNode.distance = 0;
    result.push(startNode);

    while (queue.length > 0) {
      const currentId = queue.shift();
      const currentNode = this.nodes.get(currentId);

      if (targetId && currentId === targetId) {
        return result;
      }

      const neighbors = this.adjacencyList.get(currentId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.node.id)) {
          visited.add(neighbor.node.id);
          queue.push(neighbor.node.id);
          
          const neighborNode = this.nodes.get(neighbor.node.id);
          neighborNode.visited = true;
          neighborNode.distance = currentNode.distance + 1;
          neighborNode.previous = currentNode;
          result.push(neighborNode);

          // Highlight the edge
          neighbor.edge.highlighted = true;
        }
      }
    }

    return result;
  }

  depthFirstSearch(startId, targetId = null) {
    if (!this.nodes.has(startId)) return [];
    
    this.resetNodeStates();
    const visited = new Set();
    const result = [];

    const dfs = (currentId) => {
      if (visited.has(currentId)) return;
      if (targetId && currentId === targetId) return;

      visited.add(currentId);
      const currentNode = this.nodes.get(currentId);
      currentNode.visited = true;
      result.push(currentNode);

      const neighbors = this.adjacencyList.get(currentId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.node.id)) {
          // Highlight the edge
          neighbor.edge.highlighted = true;
          dfs(neighbor.node.id);
          if (targetId && result.find(n => n.id === targetId)) return;
        }
      }
    };

    dfs(startId);
    return result;
  }

  dijkstra(startId, targetId = null) {
    if (!this.nodes.has(startId)) return [];

    this.resetNodeStates();
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();
    const result = [];

    // Initialize distances
    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, Infinity);
      previous.set(nodeId, null);
      unvisited.add(nodeId);
    }
    distances.set(startId, 0);

    const startNode = this.nodes.get(startId);
    startNode.distance = 0;
    startNode.visited = true;
    result.push(startNode);

    while (unvisited.size > 0) {
      // Find node with smallest distance
      let currentId = null;
      let minDistance = Infinity;
      
      for (const nodeId of unvisited) {
        if (distances.get(nodeId) < minDistance) {
          minDistance = distances.get(nodeId);
          currentId = nodeId;
        }
      }

      if (currentId === null || minDistance === Infinity) break;

      unvisited.delete(currentId);
      const currentNode = this.nodes.get(currentId);

      if (targetId && currentId === targetId) {
        return result;
      }

      // Update neighbors
      const neighbors = this.adjacencyList.get(currentId);
      for (const neighbor of neighbors) {
        if (unvisited.has(neighbor.node.id)) {
          const alt = distances.get(currentId) + neighbor.weight;
          if (alt < distances.get(neighbor.node.id)) {
            distances.set(neighbor.node.id, alt);
            previous.set(neighbor.node.id, currentId);

            const neighborNode = this.nodes.get(neighbor.node.id);
            neighborNode.distance = alt;
            neighborNode.previous = currentNode;
            neighborNode.visited = true;
            result.push(neighborNode);

            // Highlight the edge
            neighbor.edge.highlighted = true;
          }
        }
      }
    }

    return result;
  }

  resetNodeStates() {
    for (const node of this.nodes.values()) {
      node.highlighted = false;
      node.visited = false;
      node.distance = Infinity;
      node.previous = null;
    }
    for (const edge of this.edges) {
      edge.highlighted = false;
    }
  }

  hasCycle() {
    const visited = new Set();
    const recursionStack = new Set();

    const dfs = (nodeId) => {
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        recursionStack.add(nodeId);

        const neighbors = this.adjacencyList.get(nodeId);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.node.id) && dfs(neighbor.node.id)) {
            return true;
          } else if (recursionStack.has(neighbor.node.id)) {
            return true;
          }
        }
      }
      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (dfs(nodeId)) return true;
    }
    return false;
  }

  getConnectedComponents() {
    const visited = new Set();
    const components = [];

    const bfs = (startId) => {
      const component = [];
      const queue = [startId];
      visited.add(startId);

      while (queue.length > 0) {
        const currentId = queue.shift();
        component.push(this.nodes.get(currentId));

        const neighbors = this.adjacencyList.get(currentId);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.node.id)) {
            visited.add(neighbor.node.id);
            queue.push(neighbor.node.id);
          }
        }
      }
      return component;
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        components.push(bfs(nodeId));
      }
    }

    return components;
  }
}

function GraphVisualizer() {
  const navigate = useNavigate();
  const [graph, setGraph] = useState(new Graph());
  const [operation, setOperation] = useState('addNode');
  const [nodeId, setNodeId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [weight, setWeight] = useState('1');
  const [algorithm, setAlgorithm] = useState('bfs');
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [message, setMessage] = useState('Graph initialized. Choose an operation to start.');
  const [algorithmResult, setAlgorithmResult] = useState([]);
  const [graphType, setGraphType] = useState('undirected');
  const [isWeighted, setIsWeighted] = useState(false);

  // Initialize graph with some values
  const initializeGraph = useCallback(() => {
    const newGraph = new Graph(graphType === 'directed', isWeighted);
    
    // Add nodes
    ['A', 'B', 'C', 'D', 'E'].forEach(id => newGraph.addNode(id));
    
    // Add edges for a sample graph
    newGraph.addEdge('A', 'B', 4);
    newGraph.addEdge('A', 'C', 2);
    newGraph.addEdge('B', 'C', 1);
    newGraph.addEdge('B', 'D', 5);
    newGraph.addEdge('C', 'D', 8);
    newGraph.addEdge('C', 'E', 10);
    newGraph.addEdge('D', 'E', 2);
    
    setGraph(newGraph);
    setMessage('Graph initialized with sample nodes: A, B, C, D, E and sample edges');
    setAlgorithmResult([]);
  }, [graphType, isWeighted]);

  useEffect(() => {
    initializeGraph();
  }, [initializeGraph]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Handle graph operations
  const handleOperation = async () => {
    switch (operation) {
      case 'addNode':
        await addNode();
        break;
      case 'removeNode':
        await removeNode();
        break;
      case 'addEdge':
        await addEdge();
        break;
      case 'removeEdge':
        await removeEdge();
        break;
      default:
        setMessage('Please select an operation');
    }
  };

  const addNode = async () => {
    if (!nodeId.trim()) {
      setMessage('Please enter a node ID');
      return;
    }

    setIsAnimating(true);
    const newGraph = new Graph(graph.directed, graph.weighted);
    
    // Copy existing nodes and edges
    graph.nodes.forEach(node => newGraph.addNode(node.id, node.value));
    graph.edges.forEach(edge => newGraph.addEdge(edge.source.id, edge.target.id, edge.weight));
    
    const newNode = newGraph.addNode(nodeId.trim());
    if (newNode) {
      setGraph(newGraph);
      setMessage(`Added node ${nodeId}`);
      setNodeId('');
    } else {
      setMessage(`Node ${nodeId} already exists`);
    }
    setIsAnimating(false);
  };

  const removeNode = async () => {
    if (!nodeId.trim()) {
      setMessage('Please enter a node ID to remove');
      return;
    }

    setIsAnimating(true);
    const newGraph = new Graph(graph.directed, graph.weighted);
    
    // Copy existing structure except the node to remove
    graph.nodes.forEach(node => {
      if (node.id !== nodeId.trim()) {
        newGraph.addNode(node.id, node.value);
      }
    });
    
    graph.edges.forEach(edge => {
      if (edge.source.id !== nodeId.trim() && edge.target.id !== nodeId.trim()) {
        newGraph.addEdge(edge.source.id, edge.target.id, edge.weight);
      }
    });
    
    setGraph(newGraph);
    setMessage(`Removed node ${nodeId} and all connected edges`);
    setNodeId('');
    setIsAnimating(false);
  };

  const addEdge = async () => {
    if (!sourceId.trim() || !targetId.trim()) {
      setMessage('Please enter both source and target node IDs');
      return;
    }

    if (sourceId === targetId) {
      setMessage('Source and target nodes cannot be the same');
      return;
    }

    setIsAnimating(true);
    const newGraph = new Graph(graph.directed, graph.weighted);
    
    // Copy existing structure
    graph.nodes.forEach(node => newGraph.addNode(node.id, node.value));
    graph.edges.forEach(edge => newGraph.addEdge(edge.source.id, edge.target.id, edge.weight));
    
    const edgeWeight = isWeighted ? parseInt(weight) || 1 : 1;
    const newEdge = newGraph.addEdge(sourceId.trim(), targetId.trim(), edgeWeight);
    
    if (newEdge) {
      setGraph(newGraph);
      setMessage(`Added edge from ${sourceId} to ${targetId}${isWeighted ? ` with weight ${edgeWeight}` : ''}`);
      setSourceId('');
      setTargetId('');
      setWeight('1');
    } else {
      setMessage(`Edge from ${sourceId} to ${targetId} already exists`);
    }
    setIsAnimating(false);
  };

  const removeEdge = async () => {
    if (!sourceId.trim() || !targetId.trim()) {
      setMessage('Please enter both source and target node IDs');
      return;
    }

    setIsAnimating(true);
    const newGraph = new Graph(graph.directed, graph.weighted);
    
    // Copy existing structure
    graph.nodes.forEach(node => newGraph.addNode(node.id, node.value));
    graph.edges.forEach(edge => {
      if (!(edge.source.id === sourceId.trim() && edge.target.id === targetId.trim())) {
        newGraph.addEdge(edge.source.id, edge.target.id, edge.weight);
      }
    });
    
    setGraph(newGraph);
    setMessage(`Removed edge from ${sourceId} to ${targetId}`);
    setSourceId('');
    setTargetId('');
    setIsAnimating(false);
  };

  // Algorithm executions
  const executeAlgorithm = async () => {
    if (!startNode.trim()) {
      setMessage('Please enter a start node');
      return;
    }

    if (!graph.nodes.has(startNode.trim())) {
      setMessage(`Node ${startNode} does not exist in the graph`);
      return;
    }

    setIsAnimating(true);
    setAlgorithmResult([]);
    
    // Reset graph states
    const newGraph = new Graph(graph.directed, graph.weighted);
    graph.nodes.forEach(node => newGraph.addNode(node.id, node.value));
    graph.edges.forEach(edge => newGraph.addEdge(edge.source.id, edge.target.id, edge.weight));
    
    let result = [];
    let algorithmName = '';

    switch (algorithm) {
      case 'bfs':
        result = newGraph.breadthFirstSearch(startNode.trim(), endNode.trim() || null);
        algorithmName = 'Breadth-First Search';
        break;
      case 'dfs':
        result = newGraph.depthFirstSearch(startNode.trim(), endNode.trim() || null);
        algorithmName = 'Depth-First Search';
        break;
      case 'dijkstra':
        result = newGraph.dijkstra(startNode.trim(), endNode.trim() || null);
        algorithmName = "Dijkstra's Algorithm";
        break;
      default:
        result = newGraph.breadthFirstSearch(startNode.trim());
        algorithmName = 'Breadth-First Search';
    }

    setGraph(newGraph);
    setMessage(`Executing ${algorithmName}...`);

    // Animate the algorithm steps
    for (let i = 0; i < result.length; i++) {
      setAlgorithmResult(result.slice(0, i + 1).map(n => n.id));
      await sleep(animationSpeed * 1.5);
    }

    const targetFound = endNode.trim() && result.find(n => n.id === endNode.trim());
    if (endNode.trim()) {
      if (targetFound) {
        setMessage(`${algorithmName} found path to ${endNode}!`);
      } else {
        setMessage(`${algorithmName} completed. Target ${endNode} not found.`);
      }
    } else {
      setMessage(`${algorithmName} completed!`);
    }

    setIsAnimating(false);
  };

  // Calculate node positions for visualization (circular layout)
  const calculateNodePositions = () => {
    const nodes = Array.from(graph.nodes.values());
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    
    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });
  };

  // Get node color based on state
  const getNodeColor = (node) => {
    if (algorithmResult.includes(node.id)) return '#10B981'; // Green for visited
    if (node.highlighted) return '#F59E0B'; // Yellow for highlighted
    return '#3B82F6'; // Blue for normal
  };

  // Get edge color based on state
  const getEdgeColor = (edge) => {
    if (edge.highlighted) return '#10B981'; // Green for highlighted
    return '#4B5563'; // Gray for normal
  };

  // Calculate arrowhead position for directed edges
  const calculateArrowhead = (source, target) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitDx = dx / length;
    const unitDy = dy / length;
    
    const arrowLength = 10;
    const arrowWidth = 6;
    
    const endX = target.x - unitDx * 20; // Adjust for node radius
    const endY = target.y - unitDy * 20;
    
    const leftX = endX - unitDx * arrowLength + unitDy * arrowWidth;
    const leftY = endY - unitDy * arrowLength - unitDx * arrowWidth;
    const rightX = endX - unitDx * arrowLength - unitDy * arrowWidth;
    const rightY = endY - unitDy * arrowLength + unitDx * arrowWidth;
    
    return { endX, endY, leftX, leftY, rightX, rightY };
  };

  // Calculate graph properties
  const nodeCount = graph.nodes.size;
  const edgeCount = graph.edges.length;
  const hasCycle = graph.hasCycle();
  const connectedComponents = graph.getConnectedComponents().length;

  // Calculate positions for current graph
  calculateNodePositions();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button 
            className="btn btn-ghost mb-4 hover:bg-gray-800 text-white border-gray-600"
            onClick={() => navigate('/dsaVisualizer')}
          >
            ← Back to Visualizers
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Graph Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize graph algorithms and operations with interactive animations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Graph Configuration */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Graph Configuration</h3>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Graph Type</span>
                  </label>
                  <select 
                    className="select select-bordered bg-gray-700 text-white border-gray-600"
                    value={graphType}
                    onChange={(e) => {
                      setGraphType(e.target.value);
                      const newGraph = new Graph(e.target.value === 'directed', isWeighted);
                      setGraph(newGraph);
                      initializeGraph();
                    }}
                    disabled={isAnimating}
                  >
                    <option value="undirected">Undirected</option>
                    <option value="directed">Directed</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text text-gray-300">Weighted Graph</span>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary"
                      checked={isWeighted}
                      onChange={(e) => {
                        setIsWeighted(e.target.checked);
                        const newGraph = new Graph(graphType === 'directed', e.target.checked);
                        setGraph(newGraph);
                        initializeGraph();
                      }}
                      disabled={isAnimating}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Operations Panel */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Graph Operations</h3>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Operation</span>
                  </label>
                  <select 
                    className="select select-bordered bg-gray-700 text-white border-gray-600"
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                    disabled={isAnimating}
                  >
                    <option value="addNode">Add Node</option>
                    <option value="removeNode">Remove Node</option>
                    <option value="addEdge">Add Edge</option>
                    <option value="removeEdge">Remove Edge</option>
                  </select>
                </div>

                {operation.includes('Node') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-300">Node ID</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered bg-gray-700 text-white border-gray-600"
                      value={nodeId}
                      onChange={(e) => setNodeId(e.target.value)}
                      placeholder="Enter node ID"
                      disabled={isAnimating}
                    />
                  </div>
                )}

                {operation.includes('Edge') && (
                  <>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-300">Source Node</span>
                      </label>
                      <input 
                        type="text" 
                        className="input input-bordered bg-gray-700 text-white border-gray-600"
                        value={sourceId}
                        onChange={(e) => setSourceId(e.target.value)}
                        placeholder="Source node ID"
                        disabled={isAnimating}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-300">Target Node</span>
                      </label>
                      <input 
                        type="text" 
                        className="input input-bordered bg-gray-700 text-white border-gray-600"
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        placeholder="Target node ID"
                        disabled={isAnimating}
                      />
                    </div>

                    {isWeighted && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-gray-300">Weight</span>
                        </label>
                        <input 
                          type="number" 
                          className="input input-bordered bg-gray-700 text-white border-gray-600"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="Edge weight"
                          disabled={isAnimating}
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="form-control mt-4">
                  <button 
                    className="btn btn-primary"
                    onClick={handleOperation}
                    disabled={isAnimating}
                  >
                    {isAnimating ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      `Execute ${operation.replace(/([A-Z])/g, ' $1').trim()}`
                    )}
                  </button>
                </div>

                <div className="form-control">
                  <button 
                    className="btn btn-outline btn-secondary mt-2"
                    onClick={initializeGraph}
                    disabled={isAnimating}
                  >
                    Reset Graph
                  </button>
                </div>
              </div>
            </div>

            {/* Algorithms Panel */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Algorithms</h3>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Algorithm</span>
                  </label>
                  <select 
                    className="select select-bordered bg-gray-700 text-white border-gray-600"
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    disabled={isAnimating}
                  >
                    <option value="bfs">Breadth-First Search</option>
                    <option value="dfs">Depth-First Search</option>
                    <option value="dijkstra">Dijkstra's Algorithm</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Start Node</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered bg-gray-700 text-white border-gray-600"
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                    placeholder="Start node ID"
                    disabled={isAnimating}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">End Node (Optional)</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered bg-gray-700 text-white border-gray-600"
                    value={endNode}
                    onChange={(e) => setEndNode(e.target.value)}
                    placeholder="Target node ID"
                    disabled={isAnimating}
                  />
                </div>

                <div className="form-control mt-4">
                  <button 
                    className="btn btn-accent"
                    onClick={executeAlgorithm}
                    disabled={isAnimating}
                  >
                    {isAnimating ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      `Run ${algorithm.toUpperCase()}`
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Animation Control */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Animation Settings</h3>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Animation Speed</span>
                  </label>
                  <input 
                    type="range" 
                    min="50" 
                    max="500" 
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                    className="range range-primary"
                    disabled={isAnimating}
                  />
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Graph Status</h3>
                <p className="text-sm text-gray-300 mb-4">{message}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Nodes:</span>
                    <span className="font-bold text-blue-400">{nodeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Edges:</span>
                    <span className="font-bold text-green-400">{edgeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connected Components:</span>
                    <span className="font-bold text-yellow-400">{connectedComponents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Has Cycle:</span>
                    <span className={`font-bold ${hasCycle ? 'text-red-400' : 'text-gray-400'}`}>
                      {hasCycle ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Algorithm Result */}
            {algorithmResult.length > 0 && (
              <div className="card bg-gray-800 shadow-lg border border-gray-700">
                <div className="card-body">
                  <h3 className="card-title text-white">Algorithm Result</h3>
                  <div className="text-sm text-gray-300">
                    Visited order: {algorithmResult.join(' → ')}
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Legend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Normal Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Visited Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-300">Highlighted Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-gray-500"></div>
                    <span className="text-gray-300">Normal Edge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-green-500"></div>
                    <span className="text-gray-300">Highlighted Edge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-3">
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="card-title text-white">Graph Visualization</h3>
                  <div className="text-sm text-gray-400">
                    {graphType === 'directed' ? 'Directed' : 'Undirected'} Graph
                    {isWeighted ? ' (Weighted)' : ' (Unweighted)'}
                  </div>
                </div>

                {/* Graph Display */}
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 min-h-96">
                  {graph.nodes.size === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      Graph is empty. Use add node operations to create nodes.
                    </div>
                  ) : (
                    <svg width="800" height="600" className="mx-auto">
                      {/* Edges */}
                      {graph.edges.map(edge => (
                        <g key={edge.id}>
                          {/* Edge line */}
                          <line
                            x1={edge.source.x}
                            y1={edge.source.y}
                            x2={edge.target.x}
                            y2={edge.target.y}
                            stroke={getEdgeColor(edge)}
                            strokeWidth="3"
                            markerEnd={graph.directed ? "url(#arrowhead)" : undefined}
                          />
                          
                          {/* Edge weight */}
                          {isWeighted && (
                            <text
                              x={(edge.source.x + edge.target.x) / 2}
                              y={(edge.source.y + edge.target.y) / 2 - 10}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="font-bold text-white text-sm"
                              fill="white"
                            >
                              {edge.weight}
                            </text>
                          )}
                        </g>
                      ))}
                      
                      {/* Arrowhead definition for directed graphs */}
                      {graph.directed && (
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3.5, 0 7"
                              fill="#4B5563"
                            />
                          </marker>
                        </defs>
                      )}
                      
                      {/* Nodes */}
                      {Array.from(graph.nodes.values()).map(node => (
                        <g key={node.id}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="20"
                            fill={getNodeColor(node)}
                            stroke="#1F2937"
                            strokeWidth="2"
                          />
                          <text
                            x={node.x}
                            y={node.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="font-bold text-white text-sm"
                            fill="white"
                          >
                            {node.id}
                          </text>
                        </g>
                      ))}
                    </svg>
                  )}
                </div>

                {/* Graph Information */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Graph Properties</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">Graph Types</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• <strong>Undirected</strong>: Edges have no direction</li>
                        <li>• <strong>Directed</strong>: Edges have direction</li>
                        <li>• <strong>Weighted</strong>: Edges have weights</li>
                        <li>• <strong>Unweighted</strong>: All edges equal weight</li>
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">Time Complexity</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• <strong>BFS/DFS</strong>: O(V + E)</li>
                        <li>• <strong>Dijkstra</strong>: O((V + E) log V)</li>
                        <li>• <strong>Add Node/Edge</strong>: O(1)</li>
                        <li>• <strong>Remove Node</strong>: O(E)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Graph Information */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Graph Algorithm Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-2">Breadth-First Search (BFS)</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Explores level by level</li>
                      <li>• Uses queue data structure</li>
                      <li>• Finds shortest path in unweighted graphs</li>
                      <li>• Time complexity: O(V + E)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Depth-First Search (DFS)</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Explores as far as possible along branches</li>
                      <li>• Uses stack (recursion)</li>
                      <li>• Good for cycle detection</li>
                      <li>• Time complexity: O(V + E)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Dijkstra's Algorithm</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Finds shortest path in weighted graphs</li>
                      <li>• Uses priority queue</li>
                      <li>• Doesn't work with negative weights</li>
                      <li>• Time complexity: O((V + E) log V)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Graph Applications</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Social networks</li>
                      <li>• Routing algorithms</li>
                      <li>• Recommendation systems</li>
                      <li>• Web page ranking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraphVisualizer;