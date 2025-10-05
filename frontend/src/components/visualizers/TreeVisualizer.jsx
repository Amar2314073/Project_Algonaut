import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.id = Math.random().toString(36).substr(2, 9);
    this.x = 0;
    this.y = 0;
    this.highlighted = false;
    this.visited = false;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const newNode = new TreeNode(value);
    if (this.root === null) {
      this.root = newNode;
      return newNode;
    }
    return this._insertNode(this.root, newNode);
  }

  _insertNode(node, newNode) {
    if (newNode.value < node.value) {
      if (node.left === null) {
        node.left = newNode;
      } else {
        this._insertNode(node.left, newNode);
      }
    } else {
      if (node.right === null) {
        node.right = newNode;
      } else {
        this._insertNode(node.right, newNode);
      }
    }
    return newNode;
  }

  search(value) {
    return this._searchNode(this.root, value);
  }

  _searchNode(node, value) {
    if (node === null) return null;
    
    if (value < node.value) {
      return this._searchNode(node.left, value);
    } else if (value > node.value) {
      return this._searchNode(node.right, value);
    } else {
      return node;
    }
  }

  delete(value) {
    this.root = this._deleteNode(this.root, value);
  }

  _deleteNode(node, value) {
    if (node === null) return null;

    if (value < node.value) {
      node.left = this._deleteNode(node.left, value);
      return node;
    } else if (value > node.value) {
      node.right = this._deleteNode(node.right, value);
      return node;
    } else {
      // Node to delete found
      
      // Case 1: No child nodes
      if (node.left === null && node.right === null) {
        return null;
      }
      
      // Case 2: One child node
      if (node.left === null) {
        return node.right;
      } else if (node.right === null) {
        return node.left;
      }
      
      // Case 3: Two child nodes
      const minNode = this._findMinNode(node.right);
      node.value = minNode.value;
      node.right = this._deleteNode(node.right, minNode.value);
      return node;
    }
  }

  _findMinNode(node) {
    if (node.left === null) return node;
    return this._findMinNode(node.left);
  }

  // Traversal methods
  inOrderTraversal(node = this.root, result = []) {
    if (node !== null) {
      this.inOrderTraversal(node.left, result);
      result.push(node);
      this.inOrderTraversal(node.right, result);
    }
    return result;
  }

  preOrderTraversal(node = this.root, result = []) {
    if (node !== null) {
      result.push(node);
      this.preOrderTraversal(node.left, result);
      this.preOrderTraversal(node.right, result);
    }
    return result;
  }

  postOrderTraversal(node = this.root, result = []) {
    if (node !== null) {
      this.postOrderTraversal(node.left, result);
      this.postOrderTraversal(node.right, result);
      result.push(node);
    }
    return result;
  }

  levelOrderTraversal() {
    const result = [];
    if (this.root === null) return result;

    const queue = [this.root];
    while (queue.length > 0) {
      const node = queue.shift();
      result.push(node);
      
      if (node.left !== null) queue.push(node.left);
      if (node.right !== null) queue.push(node.right);
    }
    return result;
  }

  // Calculate tree height
  getHeight(node = this.root) {
    if (node === null) return 0;
    return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  // Get tree size (number of nodes)
  getSize(node = this.root) {
    if (node === null) return 0;
    return 1 + this.getSize(node.left) + this.getSize(node.right);
  }
}

function TreeVisualizer() {
  const navigate = useNavigate();
  const [tree, setTree] = useState(new BinarySearchTree());
  const [operation, setOperation] = useState('insert');
  const [value, setValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [message, setMessage] = useState('Binary Search Tree initialized. Choose an operation to start.');
  const [traversalResult, setTraversalResult] = useState([]);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);

  // Initialize tree with some values
  const initializeTree = useCallback(() => {
    const newTree = new BinarySearchTree();
    [50, 30, 70, 20, 40, 60, 80].forEach(val => newTree.insert(val));
    setTree(newTree);
    setMessage('BST initialized with sample values: 50, 30, 70, 20, 40, 60, 80');
    setHighlightedNodes([]);
    setVisitedNodes([]);
    setTraversalResult([]);
  }, []);

  useEffect(() => {
    initializeTree();
  }, [initializeTree]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Reset node states
  const resetNodeStates = (node) => {
    if (node !== null) {
      node.highlighted = false;
      node.visited = false;
      resetNodeStates(node.left);
      resetNodeStates(node.right);
    }
  };

  // Insert operation
  const insertNode = async () => {
    if (!value) {
      setMessage('Please enter a value to insert');
      return;
    }

    setIsAnimating(true);
    const insertValue = parseInt(value);
    
    // Create a new tree instance for immutability
    const newTree = new BinarySearchTree();
    const copyTree = (src, dest) => {
      if (src === null) return null;
      const node = new TreeNode(src.value);
      node.id = src.id;
      node.left = copyTree(src.left, node);
      node.right = copyTree(src.right, node);
      return node;
    };
    newTree.root = copyTree(tree.root, null);

    setMessage(`Inserting ${insertValue} into the BST...`);
    
    // Highlight the insertion path
    let current = newTree.root;
    const path = [];
    
    if (current === null) {
      newTree.root = new TreeNode(insertValue);
      setTree(newTree);
      setMessage(`Inserted ${insertValue} as root node`);
      setIsAnimating(false);
      return;
    }

    while (true) {
      path.push(current.id);
      setHighlightedNodes([...path]);
      await sleep(animationSpeed);

      if (insertValue < current.value) {
        if (current.left === null) {
          current.left = new TreeNode(insertValue);
          path.push(current.left.id);
          setHighlightedNodes([...path]);
          await sleep(animationSpeed);
          break;
        } else {
          current = current.left;
        }
      } else if (insertValue > current.value) {
        if (current.right === null) {
          current.right = new TreeNode(insertValue);
          path.push(current.right.id);
          setHighlightedNodes([...path]);
          await sleep(animationSpeed);
          break;
        } else {
          current = current.right;
        }
      } else {
        setMessage(`Value ${insertValue} already exists in the tree`);
        setIsAnimating(false);
        return;
      }
    }

    setTree(newTree);
    setMessage(`Successfully inserted ${insertValue} into the BST`);
    setHighlightedNodes([]);
    setIsAnimating(false);
  };

  // Search operation
  const searchNode = async () => {
    if (!searchValue) {
      setMessage('Please enter a value to search');
      return;
    }

    setIsAnimating(true);
    const searchVal = parseInt(searchValue);
    setMessage(`Searching for ${searchVal}...`);

    const path = [];
    let current = tree.root;
    let found = false;

    while (current !== null) {
      path.push(current.id);
      setHighlightedNodes([...path]);
      await sleep(animationSpeed);

      if (searchVal === current.value) {
        found = true;
        break;
      } else if (searchVal < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    if (found) {
      setMessage(`Found ${searchVal} in the BST!`);
    } else {
      setMessage(`${searchVal} not found in the BST`);
      setHighlightedNodes([]);
    }

    setIsAnimating(false);
  };

  // Delete operation
  const deleteNode = async () => {
    if (!value) {
      setMessage('Please enter a value to delete');
      return;
    }

    setIsAnimating(true);
    const deleteValue = parseInt(value);
    
    // First search for the node
    const path = [];
    let current = tree.root;
    let nodeToDelete = null;
    let parent = null;
    let isLeftChild = false;

    setMessage(`Searching for ${deleteValue} to delete...`);

    while (current !== null) {
      path.push(current.id);
      setHighlightedNodes([...path]);
      await sleep(animationSpeed);

      if (deleteValue === current.value) {
        nodeToDelete = current;
        break;
      } else if (deleteValue < current.value) {
        parent = current;
        isLeftChild = true;
        current = current.left;
      } else {
        parent = current;
        isLeftChild = false;
        current = current.right;
      }
    }

    if (!nodeToDelete) {
      setMessage(`Value ${deleteValue} not found in the tree`);
      setIsAnimating(false);
      return;
    }

    setMessage(`Deleting node with value ${deleteValue}...`);
    await sleep(animationSpeed);

    // Create a new tree for deletion
    const newTree = new BinarySearchTree();
    const copyTree = (src, dest) => {
      if (src === null) return null;
      const node = new TreeNode(src.value);
      node.id = src.id;
      node.left = copyTree(src.left, node);
      node.right = copyTree(src.right, node);
      return node;
    };
    newTree.root = copyTree(tree.root, null);

    // Find the node to delete in the new tree
    let currentNew = newTree.root;
    let parentNew = null;
    let isLeftChildNew = false;

    while (currentNew !== null && currentNew.value !== deleteValue) {
      if (deleteValue < currentNew.value) {
        parentNew = currentNew;
        isLeftChildNew = true;
        currentNew = currentNew.left;
      } else {
        parentNew = currentNew;
        isLeftChildNew = false;
        currentNew = currentNew.right;
      }
    }

    if (!currentNew) {
      setMessage('Error during deletion');
      setIsAnimating(false);
      return;
    }

    // Perform deletion
    newTree.delete(deleteValue);
    setTree(newTree);
    setMessage(`Successfully deleted ${deleteValue} from the BST`);
    setHighlightedNodes([]);
    setIsAnimating(false);
  };

  // Traversal operations
  const performTraversal = async (traversalType) => {
    setIsAnimating(true);
    setTraversalResult([]);
    setVisitedNodes([]);
    setHighlightedNodes([]);

    let result = [];
    let traversalName = '';

    switch (traversalType) {
      case 'inorder':
        result = tree.inOrderTraversal();
        traversalName = 'In-Order';
        break;
      case 'preorder':
        result = tree.preOrderTraversal();
        traversalName = 'Pre-Order';
        break;
      case 'postorder':
        result = tree.postOrderTraversal();
        traversalName = 'Post-Order';
        break;
      case 'levelorder':
        result = tree.levelOrderTraversal();
        traversalName = 'Level-Order';
        break;
      default:
        result = tree.inOrderTraversal();
        traversalName = 'In-Order';
    }

    setMessage(`Performing ${traversalName} Traversal...`);

    // Animate the traversal
    for (let i = 0; i < result.length; i++) {
      const node = result[i];
      setVisitedNodes(prev => [...prev, node.id]);
      setHighlightedNodes([node.id]);
      setTraversalResult(result.slice(0, i + 1).map(n => n.value));
      await sleep(animationSpeed * 1.5);
    }

    setMessage(`${traversalName} Traversal completed!`);
    setHighlightedNodes([]);
    setIsAnimating(false);
  };

  // Calculate node positions for visualization
  const calculateNodePositions = (node, x = 400, y = 80, level = 0, offset = 200) => {
    if (node === null) return;

    node.x = x;
    node.y = y;

    const newOffset = offset * 0.6;

    if (node.left !== null) {
      calculateNodePositions(node.left, x - newOffset, y + 80, level + 1, newOffset);
    }
    if (node.right !== null) {
      calculateNodePositions(node.right, x + newOffset, y + 80, level + 1, newOffset);
    }
  };

  // Render tree connections
  const renderConnections = (node) => {
    if (node === null) return null;

    const connections = [];

    if (node.left !== null) {
      connections.push(
        <line
          key={`${node.id}-left`}
          x1={node.x}
          y1={node.y}
          x2={node.left.x}
          y2={node.left.y}
          stroke="#4B5563"
          strokeWidth="2"
        />
      );
      connections.push(...renderConnections(node.left));
    }

    if (node.right !== null) {
      connections.push(
        <line
          key={`${node.id}-right`}
          x1={node.x}
          y1={node.y}
          x2={node.right.x}
          y2={node.right.y}
          stroke="#4B5563"
          strokeWidth="2"
        />
      );
      connections.push(...renderConnections(node.right));
    }

    return connections;
  };

  // Get node color based on state
  const getNodeColor = (node) => {
    if (highlightedNodes.includes(node.id)) return '#F59E0B'; // Yellow for highlighted
    if (visitedNodes.includes(node.id)) return '#10B981'; // Green for visited
    return '#3B82F6'; // Blue for normal
  };

  // Handle operation execution
  const handleOperation = async () => {
    switch (operation) {
      case 'insert':
        await insertNode();
        break;
      case 'delete':
        await deleteNode();
        break;
      case 'search':
        await searchNode();
        break;
      default:
        setMessage('Please select an operation');
    }
  };

  // Get operation description
  const getOperationDescription = () => {
    switch (operation) {
      case 'insert':
        return 'Add new nodes to the Binary Search Tree';
      case 'delete':
        return 'Remove nodes from the Binary Search Tree';
      case 'search':
        return 'Find nodes in the Binary Search Tree';
      default:
        return 'Select an operation to visualize';
    }
  };

  // Calculate tree statistics
  const treeHeight = tree.getHeight();
  const treeSize = tree.getSize();
  
  // Calculate positions for current tree
  calculateNodePositions(tree.root);
  const connections = renderConnections(tree.root);

  // Get all nodes for rendering
  const getAllNodes = (node, result = []) => {
    if (node !== null) {
      result.push(node);
      getAllNodes(node.left, result);
      getAllNodes(node.right, result);
    }
    return result;
  };

  const allNodes = getAllNodes(tree.root);

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
          <h1 className="text-4xl font-bold text-white mb-2">Tree Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize Binary Search Tree operations with interactive animations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Operations</h3>
                
                {/* Operation Selection */}
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
                    <option value="insert">Insert</option>
                    <option value="delete">Delete</option>
                    <option value="search">Search</option>
                  </select>
                </div>

                {/* Value Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">
                      {operation === 'search' ? 'Search Value' : 'Value'}
                    </span>
                  </label>
                  <input 
                    type="number" 
                    className="input input-bordered bg-gray-700 text-white border-gray-600"
                    value={operation === 'search' ? searchValue : value}
                    onChange={(e) => 
                      operation === 'search' 
                        ? setSearchValue(e.target.value) 
                        : setValue(e.target.value)
                    }
                    placeholder="Enter value"
                    disabled={isAnimating}
                  />
                </div>

                {/* Action Button */}
                <div className="form-control mt-4">
                  <button 
                    className="btn btn-primary"
                    onClick={handleOperation}
                    disabled={isAnimating}
                  >
                    {isAnimating ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      `Execute ${operation.charAt(0).toUpperCase() + operation.slice(1)}`
                    )}
                  </button>
                </div>

                {/* Reset Button */}
                <div className="form-control">
                  <button 
                    className="btn btn-outline btn-secondary mt-2"
                    onClick={initializeTree}
                    disabled={isAnimating}
                  >
                    Reset Tree
                  </button>
                </div>
              </div>
            </div>

            {/* Traversal Controls */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Tree Traversals</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => performTraversal('inorder')}
                    disabled={isAnimating}
                  >
                    In-Order
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => performTraversal('preorder')}
                    disabled={isAnimating}
                  >
                    Pre-Order
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => performTraversal('postorder')}
                    disabled={isAnimating}
                  >
                    Post-Order
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => performTraversal('levelorder')}
                    disabled={isAnimating}
                  >
                    Level-Order
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
                <h3 className="card-title text-white">Status</h3>
                <p className="text-sm text-gray-300">{message}</p>
                <div className="mt-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tree Size:</span>
                    <span className="font-bold text-blue-400">{treeSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tree Height:</span>
                    <span className="font-bold text-green-400">{treeHeight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Root Value:</span>
                    <span className="font-bold text-yellow-400">
                      {tree.root ? tree.root.value : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Traversal Result */}
            {traversalResult.length > 0 && (
              <div className="card bg-gray-800 shadow-lg border border-gray-700">
                <div className="card-body">
                  <h3 className="card-title text-white">Traversal Result</h3>
                  <div className="text-sm text-gray-300">
                    {traversalResult.join(' → ')}
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
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-gray-300">Normal Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-300">Highlighted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-300">Visited</span>
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
                  <h3 className="card-title text-white">Tree Visualization</h3>
                  <div className="text-sm text-gray-400">
                    {getOperationDescription()}
                  </div>
                </div>

                {/* Tree Display */}
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 min-h-96">
                  {tree.root === null ? (
                    <div className="text-center py-16 text-gray-500">
                      Tree is empty. Use insert operations to add nodes.
                    </div>
                  ) : (
                    <svg width="800" height="500" className="mx-auto">
                      {/* Connections */}
                      {connections}
                      
                      {/* Nodes */}
                      {allNodes.map(node => (
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
                            {node.value}
                          </text>
                        </g>
                      ))}
                    </svg>
                  )}
                </div>

                {/* Tree Information */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Tree Properties</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">Binary Search Tree Rules</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Left child &lt; parent value</li>
                        <li>• Right child &gt; parent value</li>
                        <li>• No duplicate values allowed</li>
                        <li>• All left descendants &lt; node</li>
                        <li>• All right descendants &gt; node</li>
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">Time Complexity</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Search: O(h) - O(log n) avg, O(n) worst</li>
                        <li>• Insert: O(h) - O(log n) avg, O(n) worst</li>
                        <li>• Delete: O(h) - O(log n) avg, O(n) worst</li>
                        <li>• Traversal: O(n)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tree Information */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Binary Search Tree Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-2">Characteristics</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Hierarchical data structure</li>
                      <li>• Each node has at most two children</li>
                      <li>• Left subtree contains smaller values</li>
                      <li>• Right subtree contains larger values</li>
                      <li>• Efficient for search, insert, delete</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Traversal Types</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>In-Order</strong>: Left, Root, Right (Sorted order)</li>
                      <li>• <strong>Pre-Order</strong>: Root, Left, Right (Copy tree)</li>
                      <li>• <strong>Post-Order</strong>: Left, Right, Root (Delete tree)</li>
                      <li>• <strong>Level-Order</strong>: Level by level (BFS)</li>
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

export default TreeVisualizer;