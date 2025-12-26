// components/visualizers/QueueVisualizer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

class QueueNode {
  constructor(value) {
    this.value = value;
    this.id = Math.random().toString(36).substr(2, 9);
    this.highlighted = false;
    this.visited = false;
    this.isFront = false;
    this.isRear = false;
    this.index = -1;
  }
}

class Queue {
  constructor() {
    this.items = [];
    this.capacity = 10; // Default capacity
    this.front = 0;
    this.rear = -1;
    this.size = 0;
  }

  // Check if queue is empty
  isEmpty() {
    return this.size === 0;
  }

  // Check if queue is full
  isFull() {
    return this.size === this.capacity;
  }

  // Get current size
  getSize() {
    return this.size;
  }

  // Enqueue operation - Add to rear
  enqueue(value) {
    if (this.isFull()) {
      throw new Error('Queue Overflow: Cannot enqueue to a full queue');
    }
    
    this.rear = (this.rear + 1) % this.capacity;
    const newNode = new QueueNode(value);
    newNode.index = this.rear;
    this.items[this.rear] = newNode;
    this.size++;
    
    this.updateNodeStates();
    return newNode;
  }

  // Dequeue operation - Remove from front
  dequeue() {
    if (this.isEmpty()) {
      throw new Error('Queue Underflow: Cannot dequeue from an empty queue');
    }
    
    const dequeuedNode = this.items[this.front];
    this.items[this.front] = null;
    this.front = (this.front + 1) % this.capacity;
    this.size--;
    
    this.updateNodeStates();
    return dequeuedNode;
  }

  // Peek front operation
  peekFront() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.front];
  }

  // Peek rear operation
  peekRear() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.rear];
  }

  // Search for a value in queue
  search(value) {
    let current = this.front;
    for (let i = 0; i < this.size; i++) {
      const index = (this.front + i) % this.capacity;
      if (this.items[index].value === value) {
        return { 
          node: this.items[index], 
          position: i + 1, // 1-based position from front
          index: index
        };
      }
    }
    return null;
  }

  // Clear queue
  clear() {
    this.items = [];
    this.front = 0;
    this.rear = -1;
    this.size = 0;
  }

  // Update node states (front, rear flags)
  updateNodeStates() {
    for (let i = 0; i < this.capacity; i++) {
      if (this.items[i]) {
        this.items[i].isFront = (i === this.front && !this.isEmpty());
        this.items[i].isRear = (i === this.rear && !this.isEmpty());
        this.items[i].highlighted = false;
        this.items[i].visited = false;
      }
    }
  }

  // Get queue as array for visualization (in order from front to rear)
  getQueueArray() {
    const result = [];
    for (let i = 0; i < this.size; i++) {
      const index = (this.front + i) % this.capacity;
      result.push(this.items[index]);
    }
    return result;
  }

  // Get all slots for visualization (including empty ones)
  getAllSlots() {
    const slots = [];
    for (let i = 0; i < this.capacity; i++) {
      if (this.items[i]) {
        slots.push({
          ...this.items[i],
          isEmpty: false,
          slotIndex: i
        });
      } else {
        slots.push({
          id: `empty-${i}`,
          isEmpty: true,
          slotIndex: i,
          isFront: (i === this.front && this.isEmpty()),
          isRear: (i === this.rear && this.isEmpty())
        });
      }
    }
    return slots;
  }

  // Set capacity
  setCapacity(newCapacity) {
    this.capacity = newCapacity;
    if (this.size > newCapacity) {
      // Truncate if new capacity is smaller
      this.size = newCapacity;
      this.rear = (this.front + newCapacity - 1) % newCapacity;
    }
    this.updateNodeStates();
  }

  // Get queue statistics
  getStats() {
    return {
      size: this.size,
      capacity: this.capacity,
      frontIndex: this.front,
      rearIndex: this.rear,
      utilization: (this.size / this.capacity) * 100
    };
  }
}

function QueueVisualizer() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState(new Queue());
  const [operation, setOperation] = useState('enqueue');
  const [value, setValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [message, setMessage] = useState('Queue initialized. Choose an operation to start.');
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [capacity, setCapacity] = useState(10);
  const [showExplanation, setShowExplanation] = useState(true);
  const [visualizationMode, setVisualizationMode] = useState('linear'); // 'linear' or 'circular'

  // Initialize queue with some values
  const initializeQueue = useCallback(() => {
    const newQueue = new Queue();
    newQueue.setCapacity(capacity);
    [10, 20, 30, 40, 50].forEach(val => newQueue.enqueue(val));
    setQueue(newQueue);
    setMessage('Queue initialized with sample values: 10, 20, 30, 40, 50');
    setHighlightedNodes([]);
    setVisitedNodes([]);
  }, [capacity]);

  useEffect(() => {
    initializeQueue();
  }, [initializeQueue]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Enqueue operation
  const enqueueOperation = async () => {
    if (!value) {
      setMessage('Please enter a value to enqueue');
      return;
    }

    setIsAnimating(true);
    const enqueueValue = parseInt(value);
    
    setMessage(`Enqueuing ${enqueueValue} to the queue...`);

    // Create a new queue instance
    const newQueue = new Queue();
    newQueue.setCapacity(queue.capacity);
    newQueue.front = queue.front;
    newQueue.rear = queue.rear;
    newQueue.size = queue.size;
    
    // Copy existing items
    for (let i = 0; i < queue.capacity; i++) {
      if (queue.items[i]) {
        const node = new QueueNode(queue.items[i].value);
        node.id = queue.items[i].id;
        node.index = queue.items[i].index;
        newQueue.items[i] = node;
      }
    }

    try {
      const newNode = newQueue.enqueue(enqueueValue);
      
      // Animation: Highlight the new node
      setHighlightedNodes([newNode.id]);
      await sleep(animationSpeed);
      
      setQueue(newQueue);
      setMessage(`Successfully enqueued ${enqueueValue} to the queue`);
      setValue('');
    } catch (error) {
      setMessage(error.message);
    }

    setHighlightedNodes([]);
    setIsAnimating(false);
  };

  // Dequeue operation
  const dequeueOperation = async () => {
    if (queue.isEmpty()) {
      setMessage('Queue is empty. Cannot dequeue.');
      return;
    }

    setIsAnimating(true);
    setMessage('Dequeuing from the queue...');

    // Highlight the front node before dequeuing
    const frontNode = queue.peekFront();
    setHighlightedNodes([frontNode.id]);
    await sleep(animationSpeed);

    // Create a new queue instance
    const newQueue = new Queue();
    newQueue.setCapacity(queue.capacity);
    newQueue.front = queue.front;
    newQueue.rear = queue.rear;
    newQueue.size = queue.size;
    
    // Copy existing items
    for (let i = 0; i < queue.capacity; i++) {
      if (queue.items[i]) {
        const node = new QueueNode(queue.items[i].value);
        node.id = queue.items[i].id;
        node.index = queue.items[i].index;
        newQueue.items[i] = node;
      }
    }

    const dequeuedValue = frontNode.value;
    newQueue.dequeue();
    setQueue(newQueue);
    setMessage(`Dequeued ${dequeuedValue} from the queue`);
    
    setHighlightedNodes([]);
    setIsAnimating(false);
  };

  // Peek operations
  const peekFrontOperation = async () => {
    if (queue.isEmpty()) {
      setMessage('Queue is empty. Cannot peek.');
      return;
    }

    setIsAnimating(true);
    setMessage('Peeking at the front of the queue...');

    const frontNode = queue.peekFront();
    setHighlightedNodes([frontNode.id]);
    await sleep(animationSpeed * 2);

    setMessage(`Front element is: ${frontNode.value}`);
    setIsAnimating(false);
  };

  const peekRearOperation = async () => {
    if (queue.isEmpty()) {
      setMessage('Queue is empty. Cannot peek.');
      return;
    }

    setIsAnimating(true);
    setMessage('Peeking at the rear of the queue...');

    const rearNode = queue.peekRear();
    setHighlightedNodes([rearNode.id]);
    await sleep(animationSpeed * 2);

    setMessage(`Rear element is: ${rearNode.value}`);
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
    setMessage(`Searching for ${searchVal} in the queue...`);

    const searchResult = queue.search(searchVal);
    
    if (searchResult) {
      // Animate the search process
      const queueArray = queue.getQueueArray();
      let foundIndex = -1;
      
      for (let i = 0; i < queueArray.length; i++) {
        const node = queueArray[i];
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
      
      setMessage(`Found ${searchVal} at position ${foundIndex + 1} from front`);
    } else {
      setMessage(`${searchVal} not found in the queue`);
    }

    setIsAnimating(false);
  };

  // Clear queue
  const clearQueue = async () => {
    setIsAnimating(true);
    setMessage('Clearing queue...');

    // Animate clearing
    const queueArray = queue.getQueueArray();
    for (let i = 0; i < queueArray.length; i++) {
      setHighlightedNodes([queueArray[i].id]);
      await sleep(animationSpeed / 2);
    }

    const newQueue = new Queue();
    newQueue.setCapacity(capacity);
    setQueue(newQueue);
    setMessage('Queue cleared');
    setHighlightedNodes([]);
    setVisitedNodes([]);
    setIsAnimating(false);
  };

  // Update capacity
  const updateCapacity = (newCapacity) => {
    setCapacity(newCapacity);
    const newQueue = new Queue();
    newQueue.setCapacity(newCapacity);
    
    // Copy existing items up to new capacity
    const itemsToCopy = Math.min(queue.getSize(), newCapacity);
    const queueArray = queue.getQueueArray();
    
    for (let i = 0; i < itemsToCopy; i++) {
      newQueue.enqueue(queueArray[i].value);
    }
    
    setQueue(newQueue);
    setMessage(`Queue capacity updated to ${newCapacity}`);
  };

  // Get node color based on state
  const getNodeColor = (node) => {
    if (highlightedNodes.includes(node.id)) return '#F59E0B'; // Yellow for highlighted
    if (visitedNodes.includes(node.id)) return '#10B981'; // Green for visited
    if (node.isFront) return '#EF4444'; // Red for front
    if (node.isRear) return '#8B5CF6'; // Purple for rear
    return '#3B82F6'; // Blue for normal
  };

  // Get slot color for empty slots
  const getSlotColor = (slot) => {
    if (slot.isEmpty) {
      if (slot.isFront && queue.isEmpty()) return '#EF4444'; // Red for front when empty
      if (slot.isRear && queue.isEmpty()) return '#8B5CF6'; // Purple for rear when empty
      return '#4B5563'; // Gray for empty
    }
    return getNodeColor(slot);
  };

  // Get queue statistics
  const queueStats = queue.getStats();
  const queueArray = queue.getQueueArray();
  const allSlots = queue.getAllSlots();
  const isQueueEmpty = queue.isEmpty();
  const isQueueFull = queue.isFull();
  const frontElement = queue.peekFront();
  const rearElement = queue.peekRear();

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
          <h1 className="text-4xl font-bold text-white mb-2">Queue Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize Queue operations (FIFO) with interactive animations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Queue Operations</h3>
                
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
                    <option value="enqueue">Enqueue</option>
                    <option value="dequeue">Dequeue</option>
                    <option value="peekFront">Peek Front</option>
                    <option value="peekRear">Peek Rear</option>
                    <option value="search">Search</option>
                  </select>
                </div>

                {/* Value Input for Enqueue and Search */}
                {(operation === 'enqueue' || operation === 'search') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-300">
                        {operation === 'enqueue' ? 'Value to Enqueue' : 'Value to Search'}
                      </span>
                    </label>
                    <input 
                      type="number" 
                      className="input input-bordered bg-gray-700 text-white border-gray-600"
                      value={operation === 'enqueue' ? value : searchValue}
                      onChange={(e) => 
                        operation === 'enqueue' 
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
                        case 'enqueue': enqueueOperation(); break;
                        case 'dequeue': dequeueOperation(); break;
                        case 'peekFront': peekFrontOperation(); break;
                        case 'peekRear': peekRearOperation(); break;
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
                    onClick={clearQueue}
                    disabled={isAnimating || isQueueEmpty}
                  >
                    Clear Queue
                  </button>
                  <button 
                    className="btn btn-outline btn-accent"
                    onClick={initializeQueue}
                    disabled={isAnimating}
                  >
                    Reset Queue
                  </button>
                </div>
              </div>
            </div>

            {/* Queue Configuration */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Queue Configuration</h3>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Queue Capacity</span>
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
                      Current: {queueStats.size} / {capacity}
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Visualization</span>
                  </label>
                  <select 
                    className="select select-bordered bg-gray-700 text-white border-gray-600"
                    value={visualizationMode}
                    onChange={(e) => setVisualizationMode(e.target.value)}
                    disabled={isAnimating}
                  >
                    <option value="linear">Linear Array</option>
                    <option value="circular">Circular Buffer</option>
                  </select>
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
                <h3 className="card-title text-white">Queue Status</h3>
                <p className="text-sm text-gray-300 mb-4">{message}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Queue Size:</span>
                    <span className="font-bold text-blue-400">{queueStats.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-bold text-green-400">{queueStats.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Front Element:</span>
                    <span className="font-bold text-red-400">
                      {frontElement ? frontElement.value : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rear Element:</span>
                    <span className="font-bold text-purple-400">
                      {rearElement ? rearElement.value : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Queue State:</span>
                    <span className={`font-bold ${
                      isQueueEmpty ? 'text-red-400' : 
                      isQueueFull ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      {isQueueEmpty ? 'Empty' : isQueueFull ? 'Full' : 'Available'}
                    </span>
                  </div>
                  {visualizationMode === 'circular' && (
                    <>
                      <div className="flex justify-between">
                        <span>Front Index:</span>
                        <span className="font-bold text-yellow-400">{queueStats.frontIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rear Index:</span>
                        <span className="font-bold text-yellow-400">{queueStats.rearIndex}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Operation Explanation */}
            {showExplanation && (
              <div className="card bg-gray-800 shadow-lg border border-gray-700">
                <div className="card-body">
                  <h3 className="card-title text-white">Operation Info</h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    {operation === 'enqueue' && (
                      <>
                        <p><strong>Enqueue</strong>: Adds an element to the rear of the queue.</p>
                        <p><strong>Time Complexity</strong>: O(1)</p>
                        <p><strong>Condition</strong>: Queue must not be full</p>
                      </>
                    )}
                    {operation === 'dequeue' && (
                      <>
                        <p><strong>Dequeue</strong>: Removes and returns the front element.</p>
                        <p><strong>Time Complexity</strong>: O(1)</p>
                        <p><strong>Condition</strong>: Queue must not be empty</p>
                      </>
                    )}
                    {operation === 'peekFront' && (
                      <>
                        <p><strong>Peek Front</strong>: Returns the front element without removing it.</p>
                        <p><strong>Time Complexity</strong>: O(1)</p>
                        <p><strong>Condition</strong>: Queue must not be empty</p>
                      </>
                    )}
                    {operation === 'peekRear' && (
                      <>
                        <p><strong>Peek Rear</strong>: Returns the rear element without removing it.</p>
                        <p><strong>Time Complexity</strong>: O(1)</p>
                        <p><strong>Condition</strong>: Queue must not be empty</p>
                      </>
                    )}
                    {operation === 'search' && (
                      <>
                        <p><strong>Search</strong>: Finds an element in the queue.</p>
                        <p><strong>Time Complexity</strong>: O(n)</p>
                        <p><strong>Process</strong>: Linear search from front to rear</p>
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
                    <span className="text-gray-300">Front Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-gray-300">Rear Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-300">Highlighted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-300">Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    <span className="text-gray-300">Empty Slot</span>
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
                  <h3 className="card-title text-white">Queue Visualization</h3>
                  <div className="text-sm text-gray-400">
                    FIFO (First-In-First-Out) Data Structure • {visualizationMode === 'circular' ? 'Circular Buffer Implementation' : 'Linear Array Implementation'}
                  </div>
                </div>

                {/* Queue Display */}
                <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 min-h-96">
                  {isQueueEmpty ? (
                    <div className="text-center py-16 text-gray-500">
                      Queue is empty. Use enqueue operations to add elements.
                    </div>
                  ) : visualizationMode === 'linear' ? (
                    // Linear Array Visualization
                    <div className="flex flex-col items-center">
                      {/* Queue Direction */}
                      <div className="text-center mb-6">
                        <div className="text-lg text-gray-400 font-bold mb-2">Queue Direction</div>
                        <div className="flex items-center justify-center space-x-4">
                          <div className="text-red-400 font-bold">Front →</div>
                          <div className="text-2xl text-gray-400">⟶</div>
                          <div className="text-purple-400 font-bold">← Rear</div>
                        </div>
                      </div>

                      {/* Queue Elements */}
                      <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                        {queueArray.map((node, index) => (
                          <div
                            key={node.id}
                            className={`relative transition-all duration-300 transform ${
                              highlightedNodes.includes(node.id) ? 'scale-110' : 'scale-100'
                            }`}
                          >
                            {/* Queue Node */}
                            <div
                              className="w-20 h-20 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
                              style={{
                                backgroundColor: getNodeColor(node),
                                borderColor: node.isFront ? '#EF4444' : node.isRear ? '#8B5CF6' : '#4B5563',
                                boxShadow: highlightedNodes.includes(node.id) 
                                  ? '0 0 20px rgba(245, 158, 11, 0.5)' 
                                  : '0 4px 6px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              <span className="text-white font-bold text-lg">{node.value}</span>
                              
                              {/* Position Indicator */}
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                                <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                                  Pos: {index + 1}
                                </span>
                              </div>

                              {/* Front Indicator */}
                              {node.isFront && (
                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                                  <span className="text-xs text-red-400 font-bold bg-gray-900 px-2 py-1 rounded">
                                    FRONT
                                  </span>
                                </div>
                              )}

                              {/* Rear Indicator */}
                              {node.isRear && (
                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                                  <span className="text-xs text-purple-400 font-bold bg-gray-900 px-2 py-1 rounded">
                                    REAR
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Capacity Indicator */}
                      <div className="mt-8 w-full max-w-2xl">
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>0</span>
                          <span>Capacity: {capacity}</span>
                          <span>{capacity}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${queueStats.utilization}%` }}
                          ></div>
                        </div>
                        <div className="text-center text-sm text-gray-400 mt-1">
                          {queueStats.size} / {capacity} elements ({Math.round(queueStats.utilization)}%)
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Circular Buffer Visualization
                    <div className="flex flex-col items-center">
                      <div className="text-center mb-6">
                        <div className="text-lg text-gray-400 font-bold mb-2">Circular Buffer Visualization</div>
                        <div className="text-sm text-gray-500">Front: {queueStats.frontIndex} • Rear: {queueStats.rearIndex}</div>
                      </div>

                      {/* Circular Grid */}
                      <div className="grid grid-cols-5 gap-4 max-w-2xl">
                        {allSlots.map((slot, index) => (
                          <div
                            key={slot.id}
                            className={`relative transition-all duration-300 transform ${
                              highlightedNodes.includes(slot.id) ? 'scale-110' : 'scale-100'
                            }`}
                          >
                            {/* Queue Slot */}
                            <div
                              className="w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300"
                              style={{
                                backgroundColor: getSlotColor(slot),
                                borderColor: slot.isFront ? '#EF4444' : slot.isRear ? '#8B5CF6' : '#4B5563',
                                boxShadow: highlightedNodes.includes(slot.id) 
                                  ? '0 0 20px rgba(245, 158, 11, 0.5)' 
                                  : '0 4px 6px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              {!slot.isEmpty && (
                                <span className="text-white font-bold text-lg">{slot.value}</span>
                              )}
                              <span className="text-xs text-gray-300 mt-1">[{slot.slotIndex}]</span>
                            </div>

                            {/* Front Indicator */}
                            {slot.isFront && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                                <span className="text-xs text-red-400 font-bold bg-gray-900 px-2 py-1 rounded">
                                  FRONT
                                </span>
                              </div>
                            )}

                            {/* Rear Indicator */}
                            {slot.isRear && (
                              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                                <span className="text-xs text-purple-400 font-bold bg-gray-900 px-2 py-1 rounded">
                                  REAR
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Circular Buffer Explanation */}
                      <div className="mt-6 text-center text-sm text-gray-400 max-w-2xl">
                        <p>Circular buffer allows efficient memory usage by reusing empty spaces.</p>
                        <p>When rear reaches the end, it wraps around to the beginning if there's space.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Queue Information */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Queue Properties</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">Queue Rules (FIFO)</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• First In, First Out principle</li>
                        <li>• Insertions at rear, deletions at front</li>
                        <li>• No random access to elements</li>
                        <li>• Limited capacity (can cause overflow)</li>
                        <li>• Must check empty state before dequeue/peek</li>
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">Time Complexity</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Enqueue: O(1) - Constant time</li>
                        <li>• Dequeue: O(1) - Constant time</li>
                        <li>• Peek Front/Rear: O(1) - Constant time</li>
                        <li>• Search: O(n) - Linear time</li>
                        <li>• Space: O(n) - Linear space</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Queue Information */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Queue Data Structure Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-2">Real-world Applications</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Task Scheduling</strong>: CPU scheduling, print spooling</li>
                      <li>• <strong>Breadth-First Search</strong>: Graph traversal algorithms</li>
                      <li>• <strong>Message Queues</strong>: Inter-process communication</li>
                      <li>• <strong>Customer Service</strong>: Call center systems</li>
                      <li>• <strong>Data Buffers</strong>: IO buffers, network packets</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Key Operations</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Enqueue</strong>: Add element to rear</li>
                      <li>• <strong>Dequeue</strong>: Remove element from front</li>
                      <li>• <strong>Peek Front</strong>: View front element</li>
                      <li>• <strong>Peek Rear</strong>: View rear element</li>
                      <li>• <strong>isEmpty</strong>: Check if queue is empty</li>
                    </ul>
                  </div>
                </div>

                {/* Implementation Types */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Queue Implementations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Linear Array</h5>
                      <p className="text-gray-300">Simple implementation but inefficient memory usage when dequeuing.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Circular Buffer</h5>
                      <p className="text-gray-300">Efficient memory usage by reusing empty spaces in a circular manner.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Linked List</h5>
                      <p className="text-gray-300">Dynamic size, no fixed capacity, but uses extra memory for pointers.</p>
                    </div>
                  </div>
                </div>

                {/* Common Use Cases */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Common Queue Patterns</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-green-400 mb-2">BFS Algorithm</h5>
                      <p className="text-gray-300">Using queue for level-order traversal in trees and graphs.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-green-400 mb-2">Producer-Consumer</h5>
                      <p className="text-gray-300">Multiple producers adding tasks, consumers processing them in order.</p>
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

export default QueueVisualizer;