// components/visualizers/ArrayVisualizer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

function ArrayVisualizer() {
  const navigate = useNavigate();
  const [array, setArray] = useState([]);
  const [operation, setOperation] = useState('insert');
  const [operationType, setOperationType] = useState('end');
  const [value, setValue] = useState('');
  const [index, setIndex] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [message, setMessage] = useState('Array initialized. Choose an operation to start.');
  const [arraySize, setArraySize] = useState(8);

  // Initialize array with some values
  const initializeArray = useCallback(() => {
    const initialArray = [10, 20, 30, 40, 50, 60, 70, 80];
    setArray(initialArray.slice(0, arraySize));
    setMessage(`Array initialized with ${arraySize} elements`);
    setHighlightedIndex(-1);
  }, [arraySize]);

  useEffect(() => {
    initializeArray();
  }, [initializeArray]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Insert operations
  const insertElement = async () => {
    if (!value) {
      setMessage('Please enter a value to insert');
      return;
    }

    setIsAnimating(true);
    const newValue = parseInt(value);

    if (operationType === 'end') {
      // Insert at end
      setMessage(`Inserting ${newValue} at the end`);
      await sleep(animationSpeed);
      
      setArray(prev => {
        const newArray = [...prev, newValue];
        setHighlightedIndex(newArray.length - 1);
        return newArray;
      });
      
      await sleep(animationSpeed);
      setMessage(`Successfully inserted ${newValue} at the end`);
    }
    else if (operationType === 'beginning') {
      // Insert at beginning
      setMessage(`Inserting ${newValue} at the beginning`);
      await sleep(animationSpeed);
      
      setArray(prev => {
        const newArray = [newValue, ...prev];
        setHighlightedIndex(0);
        return newArray;
      });
      
      await sleep(animationSpeed);
      setMessage(`Successfully inserted ${newValue} at the beginning`);
    }
    else if (operationType === 'specific') {
      // Insert at specific index
      if (!index || index < 0 || index > array.length) {
        setMessage('Please enter a valid index');
        setIsAnimating(false);
        return;
      }

      const insertIndex = parseInt(index);
      setMessage(`Inserting ${newValue} at index ${insertIndex}`);
      
      // Animate the insertion
      for (let i = array.length; i > insertIndex; i--) {
        setHighlightedIndex(i);
        await sleep(animationSpeed / 2);
      }
      
      setArray(prev => {
        const newArray = [...prev];
        newArray.splice(insertIndex, 0, newValue);
        return newArray;
      });
      
      setHighlightedIndex(insertIndex);
      await sleep(animationSpeed);
      setMessage(`Successfully inserted ${newValue} at index ${insertIndex}`);
    }

    setValue('');
    setIndex('');
    setIsAnimating(false);
  };

  // Delete operations
  const deleteElement = async () => {
    if (array.length === 0) {
      setMessage('Array is empty. Nothing to delete.');
      return;
    }

    setIsAnimating(true);

    if (operationType === 'end') {
      // Delete from end
      const deletedValue = array[array.length - 1];
      setMessage(`Deleting ${deletedValue} from the end`);
      setHighlightedIndex(array.length - 1);
      await sleep(animationSpeed);
      
      setArray(prev => {
        const newArray = [...prev];
        newArray.pop();
        return newArray;
      });
      
      await sleep(animationSpeed);
      setMessage(`Successfully deleted ${deletedValue} from the end`);
    }
    else if (operationType === 'beginning') {
      // Delete from beginning
      const deletedValue = array[0];
      setMessage(`Deleting ${deletedValue} from the beginning`);
      setHighlightedIndex(0);
      await sleep(animationSpeed);
      
      setArray(prev => {
        const newArray = [...prev];
        newArray.shift();
        return newArray;
      });
      
      await sleep(animationSpeed);
      setMessage(`Successfully deleted ${deletedValue} from the beginning`);
    }
    else if (operationType === 'specific') {
      // Delete from specific index
      if (!index || index < 0 || index >= array.length) {
        setMessage('Please enter a valid index');
        setIsAnimating(false);
        return;
      }

      const deleteIndex = parseInt(index);
      const deletedValue = array[deleteIndex];
      setMessage(`Deleting ${deletedValue} from index ${deleteIndex}`);
      setHighlightedIndex(deleteIndex);
      await sleep(animationSpeed);
      
      // Animate the deletion
      setArray(prev => {
        const newArray = [...prev];
        newArray.splice(deleteIndex, 1);
        return newArray;
      });
      
      await sleep(animationSpeed);
      setMessage(`Successfully deleted ${deletedValue} from index ${deleteIndex}`);
    }

    setIndex('');
    setIsAnimating(false);
  };

  // Search operation
  const searchElement = async () => {
    if (!searchValue) {
      setMessage('Please enter a value to search');
      return;
    }

    setIsAnimating(true);
    const searchVal = parseInt(searchValue);
    setMessage(`Searching for ${searchVal}...`);

    let foundIndex = -1;
    
    // Animate the search
    for (let i = 0; i < array.length; i++) {
      setHighlightedIndex(i);
      await sleep(animationSpeed);
      
      if (array[i] === searchVal) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      setMessage(`Found ${searchVal} at index ${foundIndex}`);
      setHighlightedIndex(foundIndex);
    } else {
      setMessage(`${searchVal} not found in the array`);
      setHighlightedIndex(-1);
    }

    setIsAnimating(false);
  };

  // Update operation
  const updateElement = async () => {
    if (!index || !value) {
      setMessage('Please enter both index and value');
      return;
    }

    const updateIndex = parseInt(index);
    const newValue = parseInt(value);

    if (updateIndex < 0 || updateIndex >= array.length) {
      setMessage('Please enter a valid index');
      return;
    }

    setIsAnimating(true);
    const oldValue = array[updateIndex];
    setMessage(`Updating index ${updateIndex} from ${oldValue} to ${newValue}`);
    setHighlightedIndex(updateIndex);
    await sleep(animationSpeed);
    
    setArray(prev => {
      const newArray = [...prev];
      newArray[updateIndex] = newValue;
      return newArray;
    });
    
    await sleep(animationSpeed);
    setMessage(`Successfully updated index ${updateIndex} to ${newValue}`);
    
    setValue('');
    setIndex('');
    setIsAnimating(false);
  };

  // Handle operation execution
  const handleOperation = async () => {
    switch (operation) {
      case 'insert':
        await insertElement();
        break;
      case 'delete':
        await deleteElement();
        break;
      case 'search':
        await searchElement();
        break;
      case 'update':
        await updateElement();
        break;
      default:
        setMessage('Please select an operation');
    }
  };

  // Get element color based on state
  const getElementColor = (elementIndex) => {
    if (elementIndex === highlightedIndex) {
      return 'bg-yellow-500 text-gray-900';
    }
    return 'bg-blue-500 text-white';
  };

  // Get operation description
  const getOperationDescription = () => {
    switch (operation) {
      case 'insert':
        return 'Add new elements to the array';
      case 'delete':
        return 'Remove elements from the array';
      case 'search':
        return 'Find elements in the array';
      case 'update':
        return 'Modify existing elements';
      default:
        return 'Select an operation to visualize';
    }
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">Array Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize array operations with interactive animations</p>
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
                    <option value="update">Update</option>
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
                        <option value="end">At End</option>
                        <option value="beginning">At Beginning</option>
                        <option value="specific">At Specific Index</option>
                      </>
                    )}
                    {operation === 'delete' && (
                      <>
                        <option value="end">From End</option>
                        <option value="beginning">From Beginning</option>
                        <option value="specific">From Specific Index</option>
                      </>
                    )}
                    {operation === 'search' && (
                      <option value="linear">Linear Search</option>
                    )}
                    {operation === 'update' && (
                      <option value="specific">At Specific Index</option>
                    )}
                  </select>
                </div>

                {/* Value Input */}
                {(operation === 'insert' || operation === 'update' || operation === 'search') && (
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
                {(operationType === 'specific' || operation === 'update') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-300">Index</span>
                    </label>
                    <input 
                      type="number" 
                      className="input input-bordered bg-gray-700 text-white border-gray-600"
                      value={index}
                      onChange={(e) => setIndex(e.target.value)}
                      placeholder={`0 - ${array.length - 1}`}
                      min="0"
                      max={array.length - 1}
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
                    onClick={initializeArray}
                    disabled={isAnimating}
                  >
                    Reset Array
                  </button>
                </div>
              </div>
            </div>

            {/* Array Size Control */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Array Settings</h3>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Initial Size: {arraySize}</span>
                  </label>
                  <input 
                    type="range" 
                    min="4" 
                    max="15" 
                    value={arraySize}
                    onChange={(e) => setArraySize(parseInt(e.target.value))}
                    className="range range-primary"
                    disabled={isAnimating}
                  />
                </div>

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
                    <span>Array Length:</span>
                    <span className="font-bold text-blue-400">{array.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-bold text-green-400">Dynamic</span>
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
                  <h3 className="card-title text-white">Array Visualization</h3>
                  <div className="text-sm text-gray-400">
                    {getOperationDescription()}
                  </div>
                </div>

                {/* Array Display */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  {/* Array Elements */}
                  <div className="flex flex-wrap gap-4 justify-center items-end min-h-48">
                    {array.map((element, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div 
                          className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 border-gray-600 font-bold text-lg transition-all duration-300 ${getElementColor(idx)}`}
                          style={{
                            height: `${element * 0.5}px`,
                            minHeight: '60px'
                          }}
                        >
                          {element}
                        </div>
                        <div className="mt-2 text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                          Index: {idx}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Empty State */}
                  {array.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Array is empty. Use insert operations to add elements.
                    </div>
                  )}
                </div>

                {/* Memory Representation */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Memory Representation</h4>
                  <div className="bg-gray-900 rounded p-4 border border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {array.map((element, idx) => (
                        <div key={idx} className="flex items-center">
                          <div className="bg-gray-700 px-3 py-2 rounded border border-gray-600 text-sm">
                            [{idx}] = {element}
                          </div>
                          {idx < array.length - 1 && (
                            <div className="text-gray-500 mx-2">→</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Array Information */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Array Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-2">Characteristics</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Contiguous memory allocation</li>
                      <li>• Random access - O(1) time complexity</li>
                      <li>• Fixed size (static) or dynamic size</li>
                      <li>• Cache-friendly due to locality</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Time Complexity</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Access: O(1)</li>
                      <li>• Search: O(n)</li>
                      <li>• Insertion: O(n)</li>
                      <li>• Deletion: O(n)</li>
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

export default ArrayVisualizer;