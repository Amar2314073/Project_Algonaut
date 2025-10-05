import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

function PathfindingVisualizer() {
  const navigate = useNavigate();
  const [grid, setGrid] = useState([]);
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [startNode, setStartNode] = useState({ row: 10, col: 5 });
  const [endNode, setEndNode] = useState({ row: 10, col: 45 });
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const ROWS = 20;
  const COLS = 50;

  // Node types
  const NODE_TYPES = {
    EMPTY: 'empty',
    WALL: 'wall',
    START: 'start',
    END: 'end',
    VISITED: 'visited',
    PATH: 'path',
    CURRENT: 'current'
  };

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const newGrid = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < COLS; col++) {
        currentRow.push(createNode(row, col));
      }
      newGrid.push(currentRow);
    }
    setGrid(newGrid);
    setVisitedNodes(0);
    setPathLength(0);
    setCurrentStep('Grid initialized. Click and drag to create walls.');
  }, []);

  const createNode = (row, col) => {
    return {
      row,
      col,
      type: 
        row === startNode.row && col === startNode.col ? NODE_TYPES.START :
        row === endNode.row && col === endNode.col ? NODE_TYPES.END :
        NODE_TYPES.EMPTY,
      distance: Infinity,
      isVisited: false,
      previousNode: null,
      fScore: Infinity,
      gScore: Infinity,
    };
  };

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  // Grid interaction handlers
  const handleMouseDown = (row, col) => {
    if (isVisualizing) return;
    
    const nodeType = grid[row][col].type;
    if (nodeType === NODE_TYPES.START || nodeType === NODE_TYPES.END) return;
    
    setMouseIsPressed(true);
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed || isVisualizing) return;
    
    const nodeType = grid[row][col].type;
    if (nodeType === NODE_TYPES.START || nodeType === NODE_TYPES.END) return;
    
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const getNewGridWithWallToggled = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      type: node.type === NODE_TYPES.WALL ? NODE_TYPES.EMPTY : NODE_TYPES.WALL,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };

  // Algorithms
  const algorithms = {
    dijkstra: {
      name: "Dijkstra's Algorithm",
      complexity: 'O(V²)',
      description: 'Finds the shortest path from start to end using greedy approach. Guarantees shortest path.'
    },
    astar: {
      name: 'A* Search Algorithm',
      complexity: 'O(E)',
      description: 'Uses heuristics to find the shortest path more efficiently than Dijkstra.'
    },
    bfs: {
      name: 'Breadth-First Search',
      complexity: 'O(V + E)',
      description: 'Explores all neighbors at the present depth before moving to nodes at the next depth level.'
    },
    dfs: {
      name: 'Depth-First Search',
      complexity: 'O(V + E)',
      description: 'Explores as far as possible along each branch before backtracking.'
    }
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Get neighbors for a node
  const getNeighbors = (node, grid) => {
    const neighbors = [];
    const { row, col } = node;
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0] // right, down, left, up
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 && newRow < ROWS &&
        newCol >= 0 && newCol < COLS &&
        grid[newRow][newCol].type !== NODE_TYPES.WALL
      ) {
        neighbors.push(grid[newRow][newCol]);
      }
    }

    return neighbors;
  };

  // Dijkstra's Algorithm
  const dijkstra = async () => {
    const newGrid = grid.slice();
    const start = newGrid[startNode.row][startNode.col];
    const end = newGrid[endNode.row][endNode.col];
    
    start.distance = 0;
    const unvisitedNodes = getAllNodes(newGrid);
    let visitedCount = 0;

    while (unvisitedNodes.length > 0) {
      if (!isVisualizing) return;

      // Sort nodes by distance
      unvisitedNodes.sort((a, b) => a.distance - b.distance);
      const closestNode = unvisitedNodes.shift();

      // If we're stuck (infinite distance), stop
      if (closestNode.distance === Infinity) {
        setCurrentStep('No path found!');
        setIsVisualizing(false);
        return;
      }

      // Mark as visited
      if (closestNode.type !== NODE_TYPES.START && closestNode.type !== NODE_TYPES.END) {
        closestNode.type = NODE_TYPES.VISITED;
        visitedCount++;
        setVisitedNodes(visitedCount);
      }
      closestNode.isVisited = true;

      setCurrentStep(`Visiting node at (${closestNode.row}, ${closestNode.col}) - Distance: ${closestNode.distance}`);
      setGrid(newGrid.slice());
      await sleep(100 - speed);

      // If we reached the end
      if (closestNode === end) {
        await visualizePath(newGrid);
        return;
      }

      // Update neighbors
      const neighbors = getNeighbors(closestNode, newGrid);
      for (const neighbor of neighbors) {
        const newDistance = closestNode.distance + 1;
        if (newDistance < neighbor.distance) {
          neighbor.distance = newDistance;
          neighbor.previousNode = closestNode;
        }
      }
    }
  };

  // BFS Algorithm
  const bfs = async () => {
    const newGrid = grid.slice();
    const start = newGrid[startNode.row][startNode.col];
    const end = newGrid[endNode.row][endNode.col];
    
    const queue = [start];
    start.isVisited = true;
    let visitedCount = 0;

    while (queue.length > 0) {
      if (!isVisualizing) return;

      const currentNode = queue.shift();

      // Mark as visited
      if (currentNode.type !== NODE_TYPES.START && currentNode.type !== NODE_TYPES.END) {
        currentNode.type = NODE_TYPES.VISITED;
        visitedCount++;
        setVisitedNodes(visitedCount);
      }

      setCurrentStep(`Visiting node at (${currentNode.row}, ${currentNode.col})`);
      setGrid(newGrid.slice());
      await sleep(150 - speed);

      // If we reached the end
      if (currentNode === end) {
        await visualizePath(newGrid);
        return;
      }

      // Add neighbors to queue
      const neighbors = getNeighbors(currentNode, newGrid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.isVisited = true;
          neighbor.previousNode = currentNode;
          queue.push(neighbor);
        }
      }
    }

    setCurrentStep('No path found!');
    setIsVisualizing(false);
  };

  // A* Algorithm
  const astar = async () => {
    const newGrid = grid.slice();
    const start = newGrid[startNode.row][startNode.col];
    const end = newGrid[endNode.row][endNode.col];
    
    start.gScore = 0;
    start.fScore = heuristic(start, end);
    
    const openSet = [start];
    let visitedCount = 0;

    while (openSet.length > 0) {
      if (!isVisualizing) return;

      // Sort by fScore
      openSet.sort((a, b) => a.fScore - b.fScore);
      const current = openSet.shift();

      // Mark as visited
      if (current.type !== NODE_TYPES.START && current.type !== NODE_TYPES.END) {
        current.type = NODE_TYPES.VISITED;
        visitedCount++;
        setVisitedNodes(visitedCount);
      }
      current.isVisited = true;

      setCurrentStep(`Visiting node at (${current.row}, ${current.col}) - fScore: ${current.fScore}`);
      setGrid(newGrid.slice());
      await sleep(120 - speed);

      // If we reached the end
      if (current === end) {
        await visualizePath(newGrid);
        return;
      }

      // Process neighbors
      const neighbors = getNeighbors(current, newGrid);
      for (const neighbor of neighbors) {
        const tentativeGScore = current.gScore + 1;
        
        if (tentativeGScore < neighbor.gScore) {
          neighbor.previousNode = current;
          neighbor.gScore = tentativeGScore;
          neighbor.fScore = tentativeGScore + heuristic(neighbor, end);
          
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    setCurrentStep('No path found!');
    setIsVisualizing(false);
  };

  // Heuristic function for A* (Manhattan distance)
  const heuristic = (node, endNode) => {
    return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
  };

  // Get all nodes for Dijkstra
  const getAllNodes = (grid) => {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  };

  // Visualize the final path
  const visualizePath = async (grid) => {
    const endNode = grid[endNode.row][endNode.col];
    let currentNode = endNode.previousNode;
    let pathNodes = [];

    while (currentNode !== null && currentNode !== grid[startNode.row][startNode.col]) {
      pathNodes.push(currentNode);
      currentNode.type = NODE_TYPES.PATH;
      currentNode = currentNode.previousNode;
    }

    setPathLength(pathNodes.length);
    
    // Animate path
    for (let i = pathNodes.length - 1; i >= 0; i--) {
      if (!isVisualizing) return;
      
      const node = pathNodes[i];
      setCurrentStep(`Showing path - ${pathNodes.length - i} nodes`);
      setGrid(grid.slice());
      await sleep(50);
    }

    setCurrentStep(`Path found! Length: ${pathNodes.length} nodes`);
    setIsVisualizing(false);
  };

  const startVisualization = async () => {
    if (isVisualizing) return;
    
    setIsVisualizing(true);
    setVisitedNodes(0);
    setPathLength(0);
    setCurrentStep('Starting pathfinding visualization...');

    // Reset grid (keep walls)
    const newGrid = grid.map(row => 
      row.map(node => ({
        ...node,
        distance: Infinity,
        isVisited: false,
        previousNode: null,
        fScore: Infinity,
        gScore: Infinity,
        type: 
          node.type === NODE_TYPES.START ? NODE_TYPES.START :
          node.type === NODE_TYPES.END ? NODE_TYPES.END :
          node.type === NODE_TYPES.WALL ? NODE_TYPES.WALL :
          NODE_TYPES.EMPTY
      }))
    );
    setGrid(newGrid);

    await sleep(500);

    switch (algorithm) {
      case 'dijkstra':
        await dijkstra();
        break;
      case 'astar':
        await astar();
        break;
      case 'bfs':
        await bfs();
        break;
      case 'dfs':
        setCurrentStep('DFS coming soon! Using BFS instead.');
        await bfs();
        break;
      default:
        await dijkstra();
    }
  };

  const stopVisualization = () => {
    setIsVisualizing(false);
    setCurrentStep('Visualization stopped');
  };

  const clearPath = () => {
    if (isVisualizing) return;
    initializeGrid();
  };

  const clearWalls = () => {
    if (isVisualizing) return;
    const newGrid = grid.map(row =>
      row.map(node => ({
        ...node,
        type: 
          node.type === NODE_TYPES.START ? NODE_TYPES.START :
          node.type === NODE_TYPES.END ? NODE_TYPES.END :
          NODE_TYPES.EMPTY
      }))
    );
    setGrid(newGrid);
  };

  const getNodeClass = (type) => {
    switch (type) {
      case NODE_TYPES.START: return 'bg-green-500 border-2 border-green-300';
      case NODE_TYPES.END: return 'bg-red-500 border-2 border-red-300';
      case NODE_TYPES.WALL: return 'bg-gray-700 border border-gray-600';
      case NODE_TYPES.VISITED: return 'bg-blue-500 border border-blue-400';
      case NODE_TYPES.PATH: return 'bg-yellow-400 border border-yellow-300';
      case NODE_TYPES.CURRENT: return 'bg-purple-500 border-2 border-purple-300';
      default: return 'bg-gray-900 border border-gray-700 hover:bg-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button 
            className="btn btn-ghost mb-4 hover:bg-gray-800 text-white"
            onClick={() => navigate('/dsaVisualizer')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Visualizers
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Pathfinding Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize how pathfinding algorithms find the shortest path between two points</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Controls</h3>
                
                {/* Algorithm Selection */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Pathfinding Algorithm</span>
                  </label>
                  <select 
                    className="select select-bordered bg-gray-700 text-white border-gray-600"
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    disabled={isVisualizing}
                  >
                    <option value="dijkstra">Dijkstra's Algorithm</option>
                    <option value="astar">A* Search</option>
                    <option value="bfs">Breadth-First Search</option>
                    <option value="dfs" disabled>Depth-First Search (Soon)</option>
                  </select>
                </div>

                {/* Speed Control */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Speed: {speed}ms</span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="range range-primary"
                    disabled={isVisualizing}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 mt-4">
                  {!isVisualizing ? (
                    <button 
                      className="btn btn-success"
                      onClick={startVisualization}
                    >
                      Start Visualization
                    </button>
                  ) : (
                    <button 
                      className="btn btn-error"
                      onClick={stopVisualization}
                    >
                      Stop
                    </button>
                  )}
                  <button 
                    className="btn btn-primary"
                    onClick={clearPath}
                    disabled={isVisualizing}
                  >
                    Clear Path
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={clearWalls}
                    disabled={isVisualizing}
                  >
                    Clear Walls
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Statistics</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Nodes Visited:</span>
                    <span className="font-bold text-blue-400">{visitedNodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Path Length:</span>
                    <span className="font-bold text-yellow-400">{pathLength}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Complexity:</span>
                    <span className="font-bold text-green-400">{algorithms[algorithm]?.complexity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Step */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Current Step</h3>
                <p className="text-sm text-gray-300">{currentStep || 'Click and drag to create walls, then start visualization.'}</p>
              </div>
            </div>

            {/* Legend */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Legend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 border border-green-300 rounded"></div>
                    <span className="text-gray-300">Start Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 border border-red-300 rounded"></div>
                    <span className="text-gray-300">End Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-700 border border-gray-600 rounded"></div>
                    <span className="text-gray-300">Wall</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 border border-blue-400 rounded"></div>
                    <span className="text-gray-300">Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 border border-yellow-300 rounded"></div>
                    <span className="text-gray-300">Shortest Path</span>
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
                  <h3 className="card-title text-white">Grid Visualization</h3>
                  <p className="text-sm text-gray-400">Click and drag to create/remove walls</p>
                </div>
                
                {/* Grid Visualization */}
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex flex-col gap-0.5">
                    {grid.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex gap-0.5 justify-center">
                        {row.map((node, nodeIdx) => (
                          <div
                            key={nodeIdx}
                            className={`w-5 h-5 rounded-sm transition-all duration-200 ${getNodeClass(node.type)} ${!isVisualizing ? 'cursor-pointer' : ''}`}
                            onMouseDown={() => handleMouseDown(node.row, node.col)}
                            onMouseEnter={() => handleMouseEnter(node.row, node.col)}
                            onMouseUp={handleMouseUp}
                            title={`Row: ${node.row}, Col: ${node.col}`}
                          ></div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Algorithm Explanation */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Algorithm Information</h3>
                <div className="text-gray-300">
                  <h4 className="text-xl font-bold text-white mb-2">{algorithms[algorithm]?.name}</h4>
                  <p className="mb-4">{algorithms[algorithm]?.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className="font-bold text-white">Best Use Cases</div>
                      <ul className="list-disc list-inside mt-2 text-sm">
                        <li>Weighted graphs (Dijkstra, A*)</li>
                        <li>Unweighted graphs (BFS)</li>
                        <li>Grid-based pathfinding</li>
                        <li>Game AI development</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className="font-bold text-white">Characteristics</div>
                      <ul className="list-disc list-inside mt-2 text-sm">
                        <li>Dijkstra: Guarantees shortest path</li>
                        <li>A*: Most efficient with heuristics</li>
                        <li>BFS: Unweighted shortest path</li>
                        <li>All: Complete and optimal</li>
                      </ul>
                    </div>
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

export default PathfindingVisualizer;