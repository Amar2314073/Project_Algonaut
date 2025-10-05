// components/visualizers/LinkedListVisualizer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

class ListNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

function LinkedListVisualizer() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [operation, setOperation] = useState('insert');
  const [operationType, setOperationType] = useState('end');
  const [value, setValue] = useState('');
  const [index, setIndex] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [message, setMessage] = useState('Linked List initialized. Choose an operation to start.');
  const [tempPointer, setTempPointer] = useState(null);

  // Initialize linked list with some values
  const initializeList = useCallback(() => {
    const node1 = new ListNode(10);
    const node2 = new ListNode(20);
    const node3 = new ListNode(30);
    const node4 = new ListNode(40);
    
    node1.next = node2;
    node2.next = node3;
    node3.next = node4;
    
    setList([node1, node2, node3, node4]);
    setMessage('Linked List initialized with 4 nodes');
    setHighlightedNodes([]);
    setTempPointer(null);
  }, []);

  useEffect(() => {
    initializeList();
  }, [initializeList]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Convert linked list to array for rendering
  const getListAsArray = () => {
    if (list.length === 0) return [];
    
    const result = [];
    let current = list[0]; // head
    const visited = new Set();
    
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      result.push(current);
      current = current.next;
    }
    
    return result;
  };

  // Insert operations
  const insertNode = async () => {
    if (!value) {
      setMessage('Please enter a value to insert');
      return;
    }

    setIsAnimating(true);
    const newValue = parseInt(value);
    const newNode = new ListNode(newValue);

    if (operationType === 'beginning') {
      // Insert at beginning (head)
      setMessage(`Inserting ${newValue} at the beginning (head)`);
      setHighlightedNodes([newNode.id]);
      await sleep(animationSpeed);
      
      if (list.length > 0) {
        newNode.next = list[0];
      }
      
      setList(prev => [newNode, ...prev]);
      setMessage(`Successfully inserted ${newValue} at the beginning`);
    }
    else if (operationType === 'end') {
      // Insert at end (tail)
      setMessage(`Inserting ${newValue} at the end (tail)`);
      
      if (list.length === 0) {
        setList([newNode]);
        setHighlightedNodes([newNode.id]);
        await sleep(animationSpeed);
      } else {
        // Traverse to the end
        const listArray = getListAsArray();
        setHighlightedNodes(listArray.map(node => node.id));
        
        for (let i = 0; i < listArray.length; i++) {
          setHighlightedNodes([listArray[i].id]);
          await sleep(animationSpeed);
        }
        
        // Update the last node's next pointer
        const lastNode = listArray[listArray.length - 1];
        lastNode.next = newNode;
        
        setList(prev => [...prev, newNode]);
        setHighlightedNodes([newNode.id]);
        await sleep(animationSpeed);
      }
      
      setMessage(`Successfully inserted ${newValue} at the end`);
    }
    else if (operationType === 'specific') {
      // Insert at specific position
      if (!index || index < 0 || index > getListAsArray().length) {
        setMessage('Please enter a valid index');
        setIsAnimating(false);
        return;
      }

      const insertIndex = parseInt(index);
      setMessage(`Inserting ${newValue} at position ${insertIndex}`);
      
      if (insertIndex === 0) {
        // Insert at head
        newNode.next = list[0];
        setList(prev => [newNode, ...prev]);
        setHighlightedNodes([newNode.id]);
      } else {
        // Traverse to the position
        const listArray = getListAsArray();
        
        for (let i = 0; i < insertIndex; i++) {
          setHighlightedNodes([listArray[i].id]);
          await sleep(animationSpeed);
        }
        
        // Insert at position
        const prevNode = listArray[insertIndex - 1];
        newNode.next = prevNode.next;
        prevNode.next = newNode;
        
        setList(prev => [...prev, newNode]);
        setHighlightedNodes([newNode.id]);
      }
      
      await sleep(animationSpeed);
      setMessage(`Successfully inserted ${newValue} at position ${insertIndex}`);
    }

    setValue('');
    setIndex('');
    setIsAnimating(false);
    setHighlightedNodes([]);
  };

  // Delete operations
  const deleteNode = async () => {
    if (getListAsArray().length === 0) {
      setMessage('Linked List is empty. Nothing to delete.');
      return;
    }

    setIsAnimating(true);

    if (operationType === 'beginning') {
      // Delete from beginning (head)
      const listArray = getListAsArray();
      const deletedValue = listArray[0].value;
      setMessage(`Deleting ${deletedValue} from the beginning (head)`);
      setHighlightedNodes([listArray[0].id]);
      await sleep(animationSpeed);
      
      setList(prev => prev.filter(node => node.id !== listArray[0].id));
      setMessage(`Successfully deleted ${deletedValue} from the beginning`);
    }
    else if (operationType === 'end') {
      // Delete from end (tail)
      const listArray = getListAsArray();
      
      if (listArray.length === 1) {
        setHighlightedNodes([listArray[0].id]);
        await sleep(animationSpeed);
        setList([]);
        setMessage(`Successfully deleted ${listArray[0].value} from the end`);
      } else {
        // Traverse to the second last node
        for (let i = 0; i < listArray.length - 1; i++) {
          setHighlightedNodes([listArray[i].id]);
          await sleep(animationSpeed);
        }
        
        const secondLastNode = listArray[listArray.length - 2];
        const deletedValue = listArray[listArray.length - 1].value;
        secondLastNode.next = null;
        
        setList(prev => prev.filter(node => node.id !== listArray[listArray.length - 1].id));
        setHighlightedNodes([secondLastNode.id]);
        await sleep(animationSpeed);
        setMessage(`Successfully deleted ${deletedValue} from the end`);
      }
    }
    else if (operationType === 'specific') {
      // Delete from specific position
      if (!index || index < 0 || index >= getListAsArray().length) {
        setMessage('Please enter a valid index');
        setIsAnimating(false);
        return;
      }

      const deleteIndex = parseInt(index);
      const listArray = getListAsArray();
      
      if (deleteIndex === 0) {
        // Delete head
        setHighlightedNodes([listArray[0].id]);
        await sleep(animationSpeed);
        setList(prev => prev.filter(node => node.id !== listArray[0].id));
      } else {
        // Traverse to the previous node
        for (let i = 0; i < deleteIndex; i++) {
          setHighlightedNodes([listArray[i].id]);
          await sleep(animationSpeed);
        }
        
        const prevNode = listArray[deleteIndex - 1];
        const nodeToDelete = listArray[deleteIndex];
        prevNode.next = nodeToDelete.next;
        
        setList(prev => prev.filter(node => node.id !== nodeToDelete.id));
        setHighlightedNodes([prevNode.id]);
        await sleep(animationSpeed);
      }
      
      setMessage(`Successfully deleted node at position ${deleteIndex}`);
    }
    else if (operationType === 'value') {
      // Delete by value
      if (!value) {
        setMessage('Please enter a value to delete');
        setIsAnimating(false);
        return;
      }

      const deleteValue = parseInt(value);
      const listArray = getListAsArray();
      let found = false;
      
      // Search for the node
      for (let i = 0; i < listArray.length; i++) {
        setHighlightedNodes([listArray[i].id]);
        await sleep(animationSpeed);
        
        if (listArray[i].value === deleteValue) {
          found = true;
          
          if (i === 0) {
            // Delete head
            setList(prev => prev.filter(node => node.id !== listArray[0].id));
          } else {
            // Delete middle or tail node
            const prevNode = listArray[i - 1];
            prevNode.next = listArray[i].next;
            setList(prev => prev.filter(node => node.id !== listArray[i].id));
          }
          
          setMessage(`Successfully deleted node with value ${deleteValue}`);
          break;
        }
      }
      
      if (!found) {
        setMessage(`Node with value ${deleteValue} not found`);
      }
    }

    setValue('');
    setIndex('');
    setIsAnimating(false);
    setHighlightedNodes([]);
  };

  // Search operation
  const searchNode = async () => {
    if (!searchValue) {
      setMessage('Please enter a value to search');
      return;
    }

    setIsAnimating(true);
    const searchVal = parseInt(searchValue);
    const listArray = getListAsArray();
    setMessage(`Searching for ${searchVal}...`);

    let foundIndex = -1;
    
    // Traverse the list
    for (let i = 0; i < listArray.length; i++) {
      setHighlightedNodes([listArray[i].id]);
      await sleep(animationSpeed);
      
      if (listArray[i].value === searchVal) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      setMessage(`Found ${searchVal} at position ${foundIndex}`);
    } else {
      setMessage(`${searchVal} not found in the linked list`);
      setHighlightedNodes([]);
    }

    setIsAnimating(false);
  };

  // Reverse linked list
  const reverseList = async () => {
    if (getListAsArray().length <= 1) {
      setMessage('Linked List has 0 or 1 node. No need to reverse.');
      return;
    }

    setIsAnimating(true);
    setMessage('Reversing the linked list...');
    
    const listArray = getListAsArray();
    let prev = null;
    let current = listArray[0];
    
    // Show initial state
    setHighlightedNodes([current.id]);
    await sleep(animationSpeed);
    
    while (current !== null) {
      const nextTemp = current.next;
      setTempPointer(nextTemp ? nextTemp.id : null);
      
      // Reverse the pointer
      current.next = prev;
      
      // Move pointers one step forward
      prev = current;
      current = nextTemp;
      
      // Update visualization
      setHighlightedNodes(prev ? [prev.id] : []);
      await sleep(animationSpeed * 1.5);
    }
    
    // Update the head
    if (prev) {
      setList(prevList => {
        const newList = [...prevList];
        // The new head is the last node we processed
        return newList;
      });
    }
    
    setMessage('Linked List reversed successfully!');
    setTempPointer(null);
    setIsAnimating(false);
    setHighlightedNodes([]);
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
      case 'reverse':
        await reverseList();
        break;
      default:
        setMessage('Please select an operation');
    }
  };

  // Get node color based on state
  const getNodeColor = (nodeId) => {
    if (tempPointer === nodeId) return 'bg-purple-500 text-white';
    if (highlightedNodes.includes(nodeId)) return 'bg-yellow-500 text-gray-900';
    return 'bg-blue-500 text-white';
  };

  // Get operation description
  const getOperationDescription = () => {
    switch (operation) {
      case 'insert':
        return 'Add new nodes to the linked list';
      case 'delete':
        return 'Remove nodes from the linked list';
      case 'search':
        return 'Find nodes in the linked list';
      case 'reverse':
        return 'Reverse the entire linked list';
      default:
        return 'Select an operation to visualize';
    }
  };

  const listArray = getListAsArray();

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
          <h1 className="text-4xl font-bold text-white mb-2">Linked List Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize linked list operations with interactive animations</p>
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
                    <option value="reverse">Reverse</option>
                  </select>
                </div>

                {/* Operation Type */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Type</span>
                  </label>
                  <select 
                    className="select select-bordered bg-gray-700 text-white border-gray-600"
                    value={operationType}
                    onChange={(e) => setOperationType(e.target.value)}
                    disabled={isAnimating}
                  >
                    {operation === 'insert' && (
                      <>
                        <option value="beginning">At Beginning (Head)</option>
                        <option value="end">At End (Tail)</option>
                        <option value="specific">At Specific Position</option>
                      </>
                    )}
                    {operation === 'delete' && (
                      <>
                        <option value="beginning">From Beginning (Head)</option>
                        <option value="end">From End (Tail)</option>
                        <option value="specific">From Specific Position</option>
                        <option value="value">By Value</option>
                      </>
                    )}
                    {operation === 'search' && (
                      <option value="value">By Value</option>
                    )}
                    {operation === 'reverse' && (
                      <option value="iterative">Iterative Method</option>
                    )}
                  </select>
                </div>

                {/* Value Input */}
                {(operation === 'insert' || (operation === 'delete' && operationType === 'value') || operation === 'search') && (
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
                )}

                {/* Index Input */}
                {(operationType === 'specific' && operation !== 'search') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-300">Position</span>
                    </label>
                    <input 
                      type="number" 
                      className="input input-bordered bg-gray-700 text-white border-gray-600"
                      value={index}
                      onChange={(e) => setIndex(e.target.value)}
                      placeholder={`0 - ${listArray.length}`}
                      min="0"
                      max={listArray.length}
                      disabled={isAnimating}
                    />
                  </div>
                )}

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
                    onClick={initializeList}
                    disabled={isAnimating}
                  >
                    Reset List
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
                    <span>List Length:</span>
                    <span className="font-bold text-blue-400">{listArray.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Head Value:</span>
                    <span className="font-bold text-green-400">
                      {listArray[0] ? listArray[0].value : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tail Value:</span>
                    <span className="font-bold text-yellow-400">
                      {listArray.length > 0 ? listArray[listArray.length - 1].value : 'None'}
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
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-gray-300">Normal Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-300">Active/Highlighted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-gray-300">Temporary Pointer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-300">Node to Delete</span>
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
                  <h3 className="card-title text-white">Linked List Visualization</h3>
                  <div className="text-sm text-gray-400">
                    {getOperationDescription()}
                  </div>
                </div>

                {/* Linked List Display */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-64">
                  {listArray.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Linked List is empty. Use insert operations to add nodes.
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-center gap-8">
                      {listArray.map((node, index) => (
                        <div key={node.id} className="flex items-center">
                          {/* Node */}
                          <div className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 border-gray-600 font-bold text-lg transition-all duration-300 ${getNodeColor(node.id)}`}>
                            {node.value}
                          </div>
                          
                          {/* Pointer Arrow */}
                          {index < listArray.length - 1 && (
                            <div className="mx-4 flex items-center">
                              <div className="text-gray-400 text-xl">→</div>
                            </div>
                          )}
                          
                          {/* Position Label */}
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                            Pos: {index}
                          </div>
                        </div>
                      ))}
                      
                      {/* NULL indicator */}
                      {listArray.length > 0 && (
                        <div className="flex items-center">
                          <div className="mx-4 text-gray-400 text-xl">→</div>
                          <div className="w-16 h-16 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-600 font-bold text-lg text-gray-400">
                            NULL
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Memory Representation */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Memory Representation</h4>
                  <div className="bg-gray-900 rounded p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 font-mono">
                      {listArray.length === 0 ? (
                        <div className="text-center py-2">Empty List</div>
                      ) : (
                        <div className="space-y-2">
                          {listArray.map((node, index) => (
                            <div key={node.id} className="flex items-center gap-4">
                              <span className="text-blue-400">Node {index}:</span>
                              <span>value = {node.value},</span>
                              <span>next = {node.next ? `→ Node ${index + 1}` : 'NULL'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked List Information */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Linked List Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-2">Characteristics</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Dynamic size - grows and shrinks at runtime</li>
                      <li>• Non-contiguous memory allocation</li>
                      <li>• Sequential access - O(n) for access by index</li>
                      <li>• Efficient insertions/deletions at head</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Time Complexity</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Access: O(n)</li>
                      <li>• Search: O(n)</li>
                      <li>• Insertion at head: O(1)</li>
                      <li>• Insertion at tail: O(n)</li>
                      <li>• Deletion at head: O(1)</li>
                      <li>• Deletion at tail: O(n)</li>
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

export default LinkedListVisualizer;