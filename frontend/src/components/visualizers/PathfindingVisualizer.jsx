import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isDrawingWall, setIsDrawingWall] = useState(true);

  const ROWS = 20;
  const COLS = 50;
  const shouldStopRef = useRef(false);

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
    setIsDrawingWall(nodeType !== NODE_TYPES.WALL);
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed || isVisualizing) return;
    
    const nodeType = grid[row][col].type;
    if (nodeType === NODE_TYPES.START || nodeType === NODE_TYPES.END) return;
    
    const newGrid = getNewGridWithWallToggled(grid, row, col, isDrawingWall);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const getNewGridWithWallToggled = (grid, row, col, makeWall = null) => {
    const newGrid = grid.map(r => [...r]);
    const node = newGrid[row][col];
    const shouldMakeWall = makeWall !== null ? makeWall : node.type !== NODE_TYPES.WALL;
    
    const newNode = {
      ...node,
      type: shouldMakeWall ? NODE_TYPES.WALL : NODE_TYPES.EMPTY,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };

  // Algorithms
  const algorithms = {
    dijkstra: {
      name: "Dijkstra's Algorithm",
      complexity: 'O(V²)',
      description: 'Finds the shortest path from start to end using greedy approach. Guarantees shortest path.',
      bestCase: 'O(V²)',
      averageCase: 'O(V²)',
      worstCase: 'O(V²)',
      space: 'O(V)',
      guarantees: 'Yes'
    },
    astar: {
      name: 'A* Search Algorithm',
      complexity: 'O(E)',
      description: 'Uses heuristics to find the shortest path more efficiently than Dijkstra.',
      bestCase: 'O(E)',
      averageCase: 'O(E)',
      worstCase: 'O(E)',
      space: 'O(V)',
      guarantees: 'Yes'
    },
    bfs: {
      name: 'Breadth-First Search',
      complexity: 'O(V + E)',
      description: 'Explores all neighbors at the present depth before moving to nodes at the next depth level.',
      bestCase: 'O(V + E)',
      averageCase: 'O(V + E)',
      worstCase: 'O(V + E)',
      space: 'O(V)',
      guarantees: 'Yes'
    },
    dfs: {
      name: 'Depth-First Search',
      complexity: 'O(V + E)',
      description: 'Explores as far as possible along each branch before backtracking.',
      bestCase: 'O(V + E)',
      averageCase: 'O(V + E)',
      worstCase: 'O(V + E)',
      space: 'O(V)',
      guarantees: 'No'
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

  // Heuristic function for A* (Manhattan distance)
  const heuristic = (node, endNode) => {
    return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
  };

  // Dijkstra's Algorithm
  const dijkstra = async (grid) => {
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    const start = newGrid[startNode.row][startNode.col];
    const end = newGrid[endNode.row][endNode.col];
    
    start.distance = 0;
    const unvisitedNodes = getAllNodes(newGrid);
    let visitedCount = 0;

    while (unvisitedNodes.length > 0) {
      if (shouldStopRef.current) return null;

      // Sort nodes by distance
      unvisitedNodes.sort((a, b) => a.distance - b.distance);
      const closestNode = unvisitedNodes.shift();

      // If we're stuck (infinite distance), stop
      if (closestNode.distance === Infinity) {
        setCurrentStep('No path found!');
        return null;
      }

      // Mark as visited
      if (closestNode.type !== NODE_TYPES.START && closestNode.type !== NODE_TYPES.END) {
        closestNode.type = NODE_TYPES.VISITED;
        visitedCount++;
        setVisitedNodes(visitedCount);
        
        // Update visualization
        setGrid(prevGrid => {
          const updatedGrid = prevGrid.map(row => [...row]);
          updatedGrid[closestNode.row][closestNode.col] = { ...closestNode };
          return updatedGrid;
        });
      }
      closestNode.isVisited = true;

      setCurrentStep(`Visiting node at (${closestNode.row}, ${closestNode.col}) - Distance: ${closestNode.distance}`);
      await sleep(200 - speed);

      // If we reached the end
      if (closestNode.row === endNode.row && closestNode.col === endNode.col) {
        return newGrid;
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
    return null;
  };

  // BFS Algorithm
  const bfs = async (grid) => {
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    const start = newGrid[startNode.row][startNode.col];
    const end = newGrid[endNode.row][endNode.col];
    
    const queue = [start];
    start.isVisited = true;
    let visitedCount = 0;

    while (queue.length > 0) {
      if (shouldStopRef.current) return null;

      const currentNode = queue.shift();

      // Mark as visited
      if (currentNode.type !== NODE_TYPES.START && currentNode.type !== NODE_TYPES.END) {
        currentNode.type = NODE_TYPES.VISITED;
        visitedCount++;
        setVisitedNodes(visitedCount);
        
        // Update visualization
        setGrid(prevGrid => {
          const updatedGrid = prevGrid.map(row => [...row]);
          updatedGrid[currentNode.row][currentNode.col] = { ...currentNode };
          return updatedGrid;
        });
      }

      setCurrentStep(`Visiting node at (${currentNode.row}, ${currentNode.col})`);
      await sleep(150 - speed);

      // If we reached the end
      if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
        return newGrid;
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
    return null;
  };

  // DFS Algorithm
  const dfs = async (grid) => {
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    const start = newGrid[startNode.row][startNode.col];
    const end = newGrid[endNode.row][endNode.col];
    
    const stack = [start];
    start.isVisited = true;
    let visitedCount = 0;

    while (stack.length > 0) {
      if (shouldStopRef.current) return null;

      const currentNode = stack.pop();

      // Mark as visited
      if (currentNode.type !== NODE_TYPES.START && currentNode.type !== NODE_TYPES.END) {
        currentNode.type = NODE_TYPES.VISITED;
        visitedCount++;
        setVisitedNodes(visitedCount);
        
        // Update visualization
        setGrid(prevGrid => {
          const updatedGrid = prevGrid.map(row => [...row]);
          updatedGrid[currentNode.row][currentNode.col] = { ...currentNode };
          return updatedGrid;
        });
      }

      setCurrentStep(`Visiting node at (${currentNode.row}, ${currentNode.col})`);
      await sleep(100 - speed);

      // If we reached the end
      if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
        return newGrid;
      }

      // Add neighbors to stack
      const neighbors = getNeighbors(currentNode, newGrid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.isVisited = true;
          neighbor.previousNode = currentNode;
          stack.push(neighbor);
        }
      }
    }

    setCurrentStep('No path found!');
    return null;
  };

  // A* Algorithm
  const astar = async (grid) => {
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    const start = newGrid[startNode.row][startNode.col];
    const end = newGrid[endNode.row][endNode.col];
    
    start.gScore = 0;
    start.fScore = heuristic(start, end);
    
    const openSet = [start];
    let visitedCount = 0;

    while (openSet.length > 0) {
      if (shouldStopRef.current) return null;

      // Sort by fScore
      openSet.sort((a, b) => a.fScore - b.fScore);
      const current = openSet.shift();

      // Mark as visited
      if (current.type !== NODE_TYPES.START && current.type !== NODE_TYPES.END) {
        current.type = NODE_TYPES.VISITED;
        visitedCount++;
        setVisitedNodes(visitedCount);
        
        // Update visualization
        setGrid(prevGrid => {
          const updatedGrid = prevGrid.map(row => [...row]);
          updatedGrid[current.row][current.col] = { ...current };
          return updatedGrid;
        });
      }
      current.isVisited = true;

      setCurrentStep(`Visiting node at (${current.row}, ${current.col}) - fScore: ${Math.round(current.fScore * 100) / 100}`);
      await sleep(180 - speed);

      // If we reached the end
      if (current.row === endNode.row && current.col === endNode.col) {
        return newGrid;
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
    return null;
  };

  // Visualize the final path
  const visualizePath = async (resultGrid) => {
    const end = resultGrid[endNode.row][endNode.col];
    let currentNode = end.previousNode;
    let pathNodes = [];

    // Reconstruct path
    while (currentNode !== null && !(currentNode.row === startNode.row && currentNode.col === startNode.col)) {
      pathNodes.push(currentNode);
      currentNode = currentNode.previousNode;
    }

    setPathLength(pathNodes.length);
    
    // Animate path
    for (let i = pathNodes.length - 1; i >= 0; i--) {
      if (shouldStopRef.current) return;
      
      const node = pathNodes[i];
      
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row]);
        newGrid[node.row][node.col] = {
          ...newGrid[node.row][node.col],
          type: NODE_TYPES.PATH
        };
        return newGrid;
      });
      
      setCurrentStep(`Showing path - ${pathNodes.length - i}/${pathNodes.length} nodes`);
      await sleep(80);
    }

    setCurrentStep(`Path found! Length: ${pathNodes.length} nodes, Visited: ${visitedNodes} nodes`);
  };

  const startVisualization = async () => {
    if (isVisualizing) return;
    
    setIsVisualizing(true);
    shouldStopRef.current = false;
    setVisitedNodes(0);
    setPathLength(0);
    setCurrentStep('Starting pathfinding visualization...');

    // Reset grid (keep walls)
    const resetGrid = grid.map(row => 
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
    setGrid(resetGrid);

    await sleep(500);

    let resultGrid = null;
    
    try {
      switch (algorithm) {
        case 'dijkstra':
          resultGrid = await dijkstra(resetGrid);
          break;
        case 'astar':
          resultGrid = await astar(resetGrid);
          break;
        case 'bfs':
          resultGrid = await bfs(resetGrid);
          break;
        case 'dfs':
          resultGrid = await dfs(resetGrid);
          break;
        default:
          resultGrid = await dijkstra(resetGrid);
      }

      if (resultGrid && !shouldStopRef.current) {
        await visualizePath(resultGrid);
      }
    } catch (error) {
      console.error('Visualization error:', error);
      setCurrentStep('Visualization error occurred');
    }
    
    setIsVisualizing(false);
    shouldStopRef.current = false;
  };

  const stopVisualization = () => {
    shouldStopRef.current = true;
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

  const generateRandomMaze = () => {
    if (isVisualizing) return;
    const newGrid = grid.map(row =>
      row.map(node => ({
        ...node,
        type: 
          node.type === NODE_TYPES.START ? NODE_TYPES.START :
          node.type === NODE_TYPES.END ? NODE_TYPES.END :
          Math.random() < 0.3 ? NODE_TYPES.WALL : NODE_TYPES.EMPTY
      }))
    );
    setGrid(newGrid);
  };

  const getNodeClass = (type) => {
    switch (type) {
      case NODE_TYPES.START: 
        return 'bg-green-500 border-2 border-green-300';
      case NODE_TYPES.END: 
        return 'bg-red-500 border-2 border-red-300';
      case NODE_TYPES.WALL: 
        return 'bg-gray-700 border border-gray-600';
      case NODE_TYPES.VISITED: 
        return 'bg-blue-500 border border-blue-400 node-visited';
      case NODE_TYPES.PATH: 
        return 'bg-yellow-400 border border-yellow-300 node-path';
      case NODE_TYPES.CURRENT: 
        return 'bg-purple-500 border-2 border-purple-300';
      default: 
        return 'bg-gray-900 border border-gray-700 hover:bg-gray-800 transition-colors duration-150';
    }
  };

  const currentAlgorithm = algorithms[algorithm];

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
          <h1 className="text-4xl font-bold text-white mb-2">Pathfinding Algorithm Visualizer</h1>
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
                    <option value="dfs">Depth-First Search</option>
                  </select>
                </div>

                {/* Speed Control */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Animation Speed</span>
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
                  <div className="text-center text-sm text-gray-400">
                    {speed < 40 ? 'Slow' : speed < 70 ? 'Medium' : 'Fast'}
                  </div>
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
                      Stop Visualization
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
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
                  
                  <button 
                    className="btn btn-outline btn-accent"
                    onClick={generateRandomMaze}
                    disabled={isVisualizing}
                  >
                    Generate Random Maze
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
                    <span className="font-bold text-green-400">{currentAlgorithm.complexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Space Complexity:</span>
                    <span className="font-bold text-purple-400">{currentAlgorithm.space}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Step */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Current Step</h3>
                <p className="text-sm text-gray-300 min-h-12">{currentStep || 'Click and drag to create walls, then start visualization.'}</p>
              </div>
            </div>

            {/* Algorithm Complexity */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Time Complexity</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Best Case:</span>
                    <span className="font-bold text-green-400">{currentAlgorithm.bestCase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Case:</span>
                    <span className="font-bold text-yellow-400">{currentAlgorithm.averageCase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worst Case:</span>
                    <span className="font-bold text-red-400">{currentAlgorithm.worstCase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guarantees Shortest Path:</span>
                    <span className={`font-bold ${currentAlgorithm.guarantees === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
                      {currentAlgorithm.guarantees}
                    </span>
                  </div>
                </div>
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
                    <div className="w-4 h-4 bg-blue-500 border border-blue-400 rounded node-visited"></div>
                    <span className="text-gray-300">Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 border border-yellow-300 rounded node-path"></div>
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="card-title text-white">
                    {currentAlgorithm.name} Visualization
                  </h3>
                  <div className="text-sm text-gray-400">
                    {isVisualizing ? 'Visualization in progress...' : 'Ready to visualize'}
                  </div>
                </div>
                
                {/* Grid Visualization */}
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 overflow-auto">
                  <div className="flex flex-col gap-0.5 mx-auto" style={{ width: 'fit-content' }}>
                    {grid.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex gap-0.5">
                        {row.map((node, nodeIdx) => (
                          <div
                            key={`${rowIdx}-${nodeIdx}`}
                            className={`w-4 h-4 rounded-sm transition-all duration-200 ${getNodeClass(node.type)} ${!isVisualizing ? 'cursor-pointer hover:scale-110' : ''}`}
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

                {/* Instructions */}
                <div className="mt-4 text-sm text-gray-400 text-center">
                  <p>Click and drag to create/remove walls • Green = Start • Red = End</p>
                </div>
              </div>
            </div>

            {/* Algorithm Information */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Algorithm Information</h3>
                
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-white mb-2">{currentAlgorithm.name}</h4>
                  <p className="text-gray-300 mb-4">{currentAlgorithm.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">How It Works</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {algorithm === 'dijkstra' && (
                          <>
                            <li>• Uses greedy approach to find shortest path</li>
                            <li>• Explores nodes with smallest distance first</li>
                            <li>• Guarantees optimal solution</li>
                            <li>• Works for weighted and unweighted graphs</li>
                          </>
                        )}
                        {algorithm === 'astar' && (
                          <>
                            <li>• Combines Dijkstra with heuristic function</li>
                            <li>• Uses f(n) = g(n) + h(n) to guide search</li>
                            <li>• More efficient than Dijkstra with good heuristic</li>
                            <li>• Guarantees optimal solution with admissible heuristic</li>
                          </>
                        )}
                        {algorithm === 'bfs' && (
                          <>
                            <li>• Explores level by level from start node</li>
                            <li>• Uses queue data structure</li>
                            <li>• Guarantees shortest path in unweighted graphs</li>
                            <li>• Explores all nodes at current depth first</li>
                          </>
                        )}
                        {algorithm === 'dfs' && (
                          <>
                            <li>• Explores as deep as possible first</li>
                            <li>• Uses stack data structure</li>
                            <li>• Does not guarantee shortest path</li>
                            <li>• Memory efficient for deep graphs</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">When to Use</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {algorithm === 'dijkstra' && (
                          <>
                            <li>• When shortest path is required</li>
                            <li>• Weighted graphs with non-negative weights</li>
                            <li>• GPS navigation systems</li>
                            <li>• Network routing protocols</li>
                          </>
                        )}
                        {algorithm === 'astar' && (
                          <>
                            <li>• Game AI and pathfinding</li>
                            <li>• Robotics navigation</li>
                            <li>• When good heuristic is available</li>
                            <li>• Large search spaces with guidance</li>
                          </>
                        )}
                        {algorithm === 'bfs' && (
                          <>
                            <li>• Unweighted graphs</li>
                            <li>• Finding shortest path in simple grids</li>
                            <li>• Web crawling</li>
                            <li>• Social network analysis</li>
                          </>
                        )}
                        {algorithm === 'dfs' && (
                          <>
                            <li>• Topological sorting</li>
                            <li>• Solving puzzles and mazes</li>
                            <li>• Cycle detection in graphs</li>
                            <li>• When memory is constrained</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Algorithm Comparison */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Pathfinding Algorithms Comparison</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th className="bg-gray-700 text-white">Algorithm</th>
                          <th className="bg-gray-700 text-white">Best Case</th>
                          <th className="bg-gray-700 text-white">Average Case</th>
                          <th className="bg-gray-700 text-white">Worst Case</th>
                          <th className="bg-gray-700 text-white">Space</th>
                          <th className="bg-gray-700 text-white">Optimal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={algorithm === 'dijkstra' ? 'bg-blue-900' : ''}>
                          <td>Dijkstra</td>
                          <td>O(V²)</td>
                          <td>O(V²)</td>
                          <td>O(V²)</td>
                          <td>O(V)</td>
                          <td>Yes</td>
                        </tr>
                        <tr className={algorithm === 'astar' ? 'bg-blue-900' : ''}>
                          <td>A* Search</td>
                          <td>O(E)</td>
                          <td>O(E)</td>
                          <td>O(E)</td>
                          <td>O(V)</td>
                          <td>Yes</td>
                        </tr>
                        <tr className={algorithm === 'bfs' ? 'bg-blue-900' : ''}>
                          <td>BFS</td>
                          <td>O(V + E)</td>
                          <td>O(V + E)</td>
                          <td>O(V + E)</td>
                          <td>O(V)</td>
                          <td>Yes*</td>
                        </tr>
                        <tr className={algorithm === 'dfs' ? 'bg-blue-900' : ''}>
                          <td>DFS</td>
                          <td>O(V + E)</td>
                          <td>O(V + E)</td>
                          <td>O(V + E)</td>
                          <td>O(V)</td>
                          <td>No</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Real-world Applications */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Real-world Applications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Navigation Systems</h5>
                      <p className="text-gray-300">GPS navigation, Google Maps, and route planning applications use A* and Dijkstra algorithms.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Game Development</h5>
                      <p className="text-gray-300">AI pathfinding in games, character movement, and obstacle avoidance using A* algorithm.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Robotics</h5>
                      <p className="text-gray-300">Autonomous navigation, motion planning, and obstacle avoidance in robotics.</p>
                    </div>
                  </div>
                </div>

                {/* Key Concepts */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Key Concepts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-green-400 mb-2">Heuristic Functions</h5>
                      <p className="text-gray-300">A* uses heuristic functions (like Manhattan distance) to guide search towards the goal more efficiently.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-green-400 mb-2">Optimality</h5>
                      <p className="text-gray-300">Dijkstra and A* guarantee shortest paths, while DFS does not. BFS guarantees shortest path in unweighted graphs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes visitAnimation {
          0% {
            transform: scale(0.3);
            background-color: rgba(0, 0, 66, 0.75);
            border-radius: 100%;
          }
          50% {
            background-color: rgba(17, 104, 217, 0.75);
          }
          75% {
            transform: scale(1.2);
            background-color: rgba(0, 217, 159, 0.75);
          }
          100% {
            transform: scale(1);
            background-color: rgba(59, 130, 246, 1);
          }
        }

        @keyframes pathAnimation {
          0% {
            transform: scale(0.6);
            background-color: rgb(255, 254, 106);
          }
          50% {
            transform: scale(1.2);
            background-color: rgb(255, 254, 106);
          }
          100% {
            transform: scale(1);
            background-color: rgb(250, 204, 21);
          }
        }

        .node-visited {
          animation: visitAnimation 1.5s ease-out forwards;
        }

        .node-path {
          animation: pathAnimation 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default PathfindingVisualizer;