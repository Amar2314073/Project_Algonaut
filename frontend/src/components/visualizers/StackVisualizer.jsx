// components/visualizers/StackVisualizer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

class StackNode {
  constructor(value) {
    this.value = value;
    this.id = Math.random().toString(36).substr(2, 9);
    this.highlighted = false;
    this.visited = false;
    this.isTop = false;
    this.isBottom = false;
  }
}

class Stack {
  constructor() {
    this.items = [];
    this.capacity = 10; // Default capacity
    this.top = -1;
  }

  // Check if stack is empty
  isEmpty() {
    return this.top === -1;
  }

  // Check if stack is full
  isFull() {
    return this.top === this.capacity - 1;
  }

  // Get stack size
  size() {
    return this.top + 1;
  }

  // Push operation
  push(value) {
    if (this.isFull()) {
      throw new Error('Stack Overflow: Cannot push to a full stack');
    }
    const newNode = new StackNode(value);
    this.items[++this.top] = newNode;
    this.updateNodeStates();
    return newNode;
  }

  // Pop operation
  pop() {
    if (this.isEmpty()) {
      throw new Error('Stack Underflow: Cannot pop from an empty stack');
    }
    const poppedNode = this.items[this.top];
    this.items[this.top--] = undefined;
    this.updateNodeStates();
    return poppedNode;
  }

  // Peek operation
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.top];
  }

  // Clear stack
  clear() {
    this.items = [];
    this.top = -1;
  }

  // Search for a value in stack
  search(value) {
    for (let i = this.top; i >= 0; i--) {
      if (this.items[i].value === value) {
        return { node: this.items[i], index: this.top - i };
      }
    }
    return null;
  }

  // Update node states (top, bottom flags)
  updateNodeStates() {
    for (let i = 0; i <= this.top; i++) {
      this.items[i].isTop = (i === this.top);
      this.items[i].isBottom = (i === 0);
      this.items[i].highlighted = false;
      this.items[i].visited = false;
    }
  }

  // Get stack as array for visualization
  getStackArray() {
    const result = [];
    for (let i = this.top; i >= 0; i--) {
      result.push(this.items[i]);
    }
    return result;
  }

  // Set capacity
  setCapacity(newCapacity) {
    this.capacity = newCapacity;
    if (this.top >= newCapacity) {
      this.top = newCapacity - 1;
      this.items = this.items.slice(0, newCapacity);
    }
  }
}

function StackVisualizer() {
  const navigate = useNavigate();
  const [stack, setStack] = useState(new Stack());
  const [operation, setOperation] = useState('push');
  const [value, setValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [message, setMessage] = useState('Stack initialized. Choose an operation to start.');
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [capacity, setCapacity] = useState(10);
  const [showExplanation, setShowExplanation] = useState(true);

  // Initialize stack with some values
  const initializeStack = useCallback(() => {
    const newStack = new Stack();
    newStack.setCapacity(capacity);
    [10, 20, 30, 40, 50].forEach(val => newStack.push(val));
    setStack(newStack);
    setMessage('Stack initialized with sample values: 10, 20, 30, 40, 50');
    setHighlightedNodes([]);
    setVisitedNodes([]);
  }, [capacity]);

  useEffect(() => {
    initializeStack();
  }, [initializeStack]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Push operation
  const pushOperation = async () => {
    if (!value) {
      setMessage('Please enter a value to push');
      return;
    }

    setIsAnimating(true);
    const pushValue = parseInt(value);
    
    setMessage(`Pushing ${pushValue} onto the stack...`);

    // Create a new stack instance
    const newStack = new Stack();
    newStack.setCapacity(stack.capacity);
    
    // Copy existing items
    for (let i = 0; i <= stack.top; i++) {
      const node = new StackNode(stack.items[i].value);
      node.id = stack.items[i].id;
      newStack.items[i] = node;
    }
    newStack.top = stack.top;

    try {
      const newNode = newStack.push(pushValue);
      
      // Animation: Highlight the new node
      setHighlightedNodes([newNode.id]);
      await sleep(animationSpeed);
      
      setStack(newStack);
      setMessage(`Successfully pushed ${pushValue} onto the stack`);
      setValue('');
    } catch (error) {
      setMessage(error.message);
    }

    setHighlightedNodes([]);
    setIsAnimating(false);
  };

  // Pop operation
  const popOperation = async () => {
    if (stack.isEmpty()) {
      setMessage('Stack is empty. Cannot pop.');
      return;
    }

    setIsAnimating(true);
    setMessage('Popping from the stack...');

    // Highlight the top node before popping
    const topNode = stack.peek();
    setHighlightedNodes([topNode.id]);
    await sleep(animationSpeed);

    // Create a new stack instance
    const newStack = new Stack();
    newStack.setCapacity(stack.capacity);
    
    // Copy existing items except the top
    for (let i = 0; i < stack.top; i++) {
      const node = new StackNode(stack.items[i].value);
      node.id = stack.items[i].id;
      newStack.items[i] = node;
    }
    newStack.top = stack.top - 1;
    newStack.updateNodeStates();

    const poppedValue = topNode.value;
    setStack(newStack);
    setMessage(`Popped ${poppedValue} from the stack`);
    
    setHighlightedNodes([]);
    setIsAnimating(false);
  };

  // Peek operation
  const peekOperation = async () => {
    if (stack.isEmpty()) {
      setMessage('Stack is empty. Cannot peek.');
      return;
    }

    setIsAnimating(true);
    setMessage('Peeking at the top of the stack...');

    const topNode = stack.peek();
    setHighlightedNodes([topNode.id]);
    await sleep(animationSpeed * 2);

    setMessage(`Top element is: ${topNode.value}`);
    setIsAnimating(false);
  };

  // Search operation
  const searchOperation = async () => {
    if (!searchValue) {
      setMessage('Please enter a value to search');
      return;
    }

    setIsAnimating(true);
    const searchVal = parseInt(searchValue);
    setMessage(`Searching for ${searchVal} in the stack...`);

    const searchResult = stack.search(searchVal);
    
    if (searchResult) {
      // Animate the search process
      const stackArray = stack.getStackArray();
      let foundIndex = -1;
      
      for (let i = 0; i < stackArray.length; i++) {
        const node = stackArray[i];
        setHighlightedNodes([node.id]);
        await sleep(animationSpeed);
        
        if (node.value === searchVal) {
          foundIndex = i;
          setVisitedNodes(prev => [...prev, node.id]);
          break;
        } else {
          setVisitedNodes(prev => [...prev, node.id]);
        }
      }
      
      setMessage(`Found ${searchVal} at position ${foundIndex + 1} from top`);
    } else {
      setMessage(`${searchVal} not found in the stack`);
    }

    setIsAnimating(false);
  };

  // Clear stack
  const clearStack = async () => {
    setIsAnimating(true);
    setMessage('Clearing stack...');

    // Animate clearing
    const stackArray = stack.getStackArray();
    for (let i = 0; i < stackArray.length; i++) {
      setHighlightedNodes([stackArray[i].id]);
      await sleep(animationSpeed / 2);
    }

    const newStack = new Stack();
    newStack.setCapacity(capacity);
    setStack(newStack);
    setMessage('Stack cleared');
    setHighlightedNodes([]);
    setVisitedNodes([]);
    setIsAnimating(false);
  };

  // Update capacity
  const updateCapacity = (newCapacity) => {
    setCapacity(newCapacity);
    const newStack = new Stack();
    newStack.setCapacity(newCapacity);
    
    // Copy existing items up to new capacity
    const itemsToCopy = Math.min(stack.size(), newCapacity);
    for (let i = 0; i < itemsToCopy; i++) {
      const node = new StackNode(stack.items[i].value);
      node.id = stack.items[i].id;
      newStack.items[i] = node;
    }
    newStack.top = itemsToCopy - 1;
    newStack.updateNodeStates();
    
    setStack(newStack);
    setMessage(`Stack capacity updated to ${newCapacity}`);
  };

  // Get node color based on state
  const getNodeColor = (node) => {
    if (highlightedNodes.includes(node.id)) return '#F59E0B'; // Yellow for highlighted
    if (visitedNodes.includes(node.id)) return '#10B981'; // Green for visited
    if (node.isTop) return '#EF4444'; // Red for top
    return '#3B82F6'; // Blue for normal
  };

  // Get stack array for visualization
  const stackArray = stack.getStackArray();
  const stackSize = stack.size();
  const isStackEmpty = stack.isEmpty();
  const isStackFull = stack.isFull();
  const topElement = stack.peek();

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
          <h1 className="text-4xl font-bold text-white mb-2">Stack Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize Stack operations (LIFO) with interactive animations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Stack Operations</h3>
                
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
                    <option value="push">Push</option>
                    <option value="pop">Pop</option>
                    <option value="peek">Peek</option>
                    <option value="search">Search</option>
                  </select>
                </div>

                {/* Value Input for Push and Search */}
                {(operation === 'push' || operation === 'search') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-300">
                        {operation === 'push' ? 'Value to Push' : 'Value to Search'}
                      </span>
                    </label>
                    <input 
                      type="number" 
                      className="input input-bordered bg-gray-700 text-white border-gray-600"
                      value={operation === 'push' ? value : searchValue}
                      onChange={(e) => 
                        operation === 'push' 
                          ? setValue(e.target.value) 
                          : setSearchValue(e.target.value)
                      }
                      placeholder="Enter value"
                      disabled={isAnimating}
                    />
                  </div>
                )}

                {/* Action Button */}
                <div className="form-control mt-4">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      switch (operation) {
                        case 'push': pushOperation(); break;
                        case 'pop': popOperation(); break;
                        case 'peek': peekOperation(); break;
                        case 'search': searchOperation(); break;
                        default: setMessage('Please select an operation');
                      }
                    }}
                    disabled={isAnimating}
                  >
                    {isAnimating ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      `Execute ${operation.charAt(0).toUpperCase() + operation.slice(1)}`
                    )}
                  </button>
                </div>

                {/* Additional Operations */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button 
                    className="btn btn-outline btn-secondary"
                    onClick={clearStack}
                    disabled={isAnimating || isStackEmpty}
                  >
                    Clear Stack
                  </button>
                  <button 
                    className="btn btn-outline btn-accent"
                    onClick={initializeStack}
                    disabled={isAnimating}
                  >
                    Reset Stack
                  </button>
                </div>
              </div>
            </div>

            {/* Stack Configuration */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Stack Configuration</h3>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Stack Capacity</span>
                  </label>
                  <input 
                    type="number" 
                    className="input input-bordered bg-gray-700 text-white border-gray-600"
                    value={capacity}
                    onChange={(e) => updateCapacity(parseInt(e.target.value) || 10)}
                    min="1"
                    max="20"
                    disabled={isAnimating}
                  />
                  <label className="label">
                    <span className="label-text text-gray-300">
                      Current: {stackSize} / {capacity}
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text text-gray-300">Show Operation Explanations</span>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary"
                      checked={showExplanation}
                      onChange={(e) => setShowExplanation(e.target.checked)}
                    />
                  </label>
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
                <h3 className="card-title text-white">Stack Status</h3>
                <p className="text-sm text-gray-300 mb-4">{message}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Stack Size:</span>
                    <span className="font-bold text-blue-400">{stackSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-bold text-green-400">{capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top Element:</span>
                    <span className="font-bold text-yellow-400">
                      {topElement ? topElement.value : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stack State:</span>
                    <span className={`font-bold ${
                      isStackEmpty ? 'text-red-400' : 
                      isStackFull ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      {isStackEmpty ? 'Empty' : isStackFull ? 'Full' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Operation Explanation */}
            {showExplanation && (
              <div className="card bg-gray-800 shadow-lg border border-gray-700">
                <div className="card-body">
                  <h3 className="card-title text-white">Operation Info</h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    {operation === 'push' && (
                      <>
                        <p><strong>Push</strong>: Adds an element to the top of the stack.</p>
                        <p><strong>Time Complexity</strong>: O(1)</p>
                        <p><strong>Condition</strong>: Stack must not be full</p>
                      </>
                    )}
                    {operation === 'pop' && (
                      <>
                        <p><strong>Pop</strong>: Removes and returns the top element.</p>
                        <p><strong>Time Complexity</strong>: O(1)</p>
                        <p><strong>Condition</strong>: Stack must not be empty</p>
                      </>
                    )}
                    {operation === 'peek' && (
                      <>
                        <p><strong>Peek</strong>: Returns the top element without removing it.</p>
                        <p><strong>Time Complexity</strong>: O(1)</p>
                        <p><strong>Condition</strong>: Stack must not be empty</p>
                      </>
                    )}
                    {operation === 'search' && (
                      <>
                        <p><strong>Search</strong>: Finds an element in the stack.</p>
                        <p><strong>Time Complexity</strong>: O(n)</p>
                        <p><strong>Process</strong>: Linear search from top to bottom</p>
                      </>
                    )}
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
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-300">Top Node</span>
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
                  <h3 className="card-title text-white">Stack Visualization</h3>
                  <div className="text-sm text-gray-400">
                    LIFO (Last-In-First-Out) Data Structure
                  </div>
                </div>

                {/* Stack Display */}
                <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 min-h-96">
                  {isStackEmpty ? (
                    <div className="text-center py-16 text-gray-500">
                      Stack is empty. Use push operations to add elements.
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      {/* Stack Top Indicator */}
                      <div className="text-center mb-4">
                        <div className="text-sm text-gray-400 font-bold">TOP</div>
                        <div className="w-8 h-1 bg-red-500 mx-auto"></div>
                      </div>

                      {/* Stack Elements */}
                      <div className="w-64 space-y-2">
                        {stackArray.map((node, index) => (
                          <div
                            key={node.id}
                            className={`relative transition-all duration-300 transform ${
                              highlightedNodes.includes(node.id) ? 'scale-105' : 'scale-100'
                            }`}
                          >
                            {/* Stack Node */}
                            <div
                              className="h-16 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
                              style={{
                                backgroundColor: getNodeColor(node),
                                borderColor: node.isTop ? '#EF4444' : '#4B5563',
                                boxShadow: highlightedNodes.includes(node.id) 
                                  ? '0 0 20px rgba(245, 158, 11, 0.5)' 
                                  : '0 4px 6px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              <span className="text-white font-bold text-xl">{node.value}</span>
                              
                              {/* Position Indicator */}
                              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                                <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                                  {index + 1}
                                </span>
                              </div>

                              {/* Top Indicator */}
                              {node.isTop && (
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                                  <span className="text-xs text-red-400 font-bold bg-gray-900 px-2 py-1 rounded">
                                    TOP
                                  </span>
                                </div>
                              )}

                              {/* Bottom Indicator */}
                              {node.isBottom && (
                                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                                  <span className="text-xs text-blue-400 font-bold bg-gray-900 px-2 py-1 rounded">
                                    BOTTOM
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Stack Bottom Indicator */}
                      <div className="text-center mt-4">
                        <div className="w-8 h-1 bg-blue-500 mx-auto"></div>
                        <div className="text-sm text-gray-400 font-bold">BOTTOM</div>
                      </div>

                      {/* Capacity Indicator */}
                      <div className="mt-8 w-64">
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>0</span>
                          <span>Capacity: {capacity}</span>
                          <span>{capacity}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(stackSize / capacity) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-center text-sm text-gray-400 mt-1">
                          {stackSize} / {capacity} elements ({Math.round((stackSize / capacity) * 100)}%)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stack Information */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Stack Properties</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">Stack Rules (LIFO)</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Last In, First Out principle</li>
                        <li>• Insertions and deletions at one end (top)</li>
                        <li>• No random access to elements</li>
                        <li>• Limited capacity (can cause overflow)</li>
                        <li>• Must check empty state before pop/peek</li>
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">Time Complexity</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Push: O(1) - Constant time</li>
                        <li>• Pop: O(1) - Constant time</li>
                        <li>• Peek: O(1) - Constant time</li>
                        <li>• Search: O(n) - Linear time</li>
                        <li>• Space: O(n) - Linear space</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stack Information */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Stack Data Structure Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-2">Real-world Applications</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Function Call Management</strong>: Call stack in programming languages</li>
                      <li>• <strong>Undo/Redo Operations</strong>: Text editors, graphic software</li>
                      <li>• <strong>Browser History</strong>: Back button functionality</li>
                      <li>• <strong>Expression Evaluation</strong>: Infix to postfix conversion</li>
                      <li>• <strong>Depth-First Search</strong>: Graph traversal algorithms</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Key Operations</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Push</strong>: Add element to top</li>
                      <li>• <strong>Pop</strong>: Remove element from top</li>
                      <li>• <strong>Peek/Top</strong>: View top element</li>
                      <li>• <strong>isEmpty</strong>: Check if stack is empty</li>
                      <li>• <strong>isFull</strong>: Check if stack is full</li>
                    </ul>
                  </div>
                </div>

                {/* Common Use Cases */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Common Stack Patterns</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Balanced Parentheses</h5>
                      <p className="text-gray-300">Using stack to check if parentheses are properly balanced in expressions.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Infix to Postfix</h5>
                      <p className="text-gray-300">Converting arithmetic expressions using operator precedence stack.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Backtracking</h5>
                      <p className="text-gray-300">Maintaining state for maze solving, puzzle games, etc.</p>
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

export default StackVisualizer;