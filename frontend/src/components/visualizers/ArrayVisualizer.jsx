import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';

class ArrayElement {
  constructor(value, index) {
    this.value = value;
    this.index = index;
    this.id = `element-${index}-${value}`;
    this.state = 'default';
    this.color = '#3B82F6'; // Blue
  }

  reset() {
    this.state = 'default';
    this.color = '#3B82F6';
  }
}

class ArrayOperations {
  static generateInsertSteps(array, value, operationType, index = -1) {
    const steps = [];
    const arr = array.map(el => new ArrayElement(el.value, el.index));

    steps.push({
      type: 'start',
      description: `Starting insertion operation: ${operationType}`,
      array: JSON.parse(JSON.stringify(arr))
    });

    if (operationType === 'end') {
      // Insert at end
      steps.push({
        type: 'insert-prepare',
        description: `Preparing to insert ${value} at the end of array`,
        array: JSON.parse(JSON.stringify(arr))
      });

      const newElement = new ArrayElement(value, arr.length);
      newElement.state = 'inserting';
      arr.push(newElement);

      steps.push({
        type: 'insert-complete',
        index: arr.length - 1,
        description: `Inserted ${value} at index ${arr.length - 1}`,
        array: JSON.parse(JSON.stringify(arr))
      });
    }
    else if (operationType === 'beginning') {
      // Insert at beginning
      steps.push({
        type: 'shift-prepare',
        description: `Shifting elements to make space for insertion at beginning`,
        array: JSON.parse(JSON.stringify(arr))
      });

      // Animate shifting
      for (let i = arr.length; i > 0; i--) {
        if (i < arr.length) arr[i].state = 'default';
        arr[i] = arr[i - 1];
        arr[i].index = i;
        if (i === 1) arr[i].state = 'shifting';
        
        if (i === arr.length) {
          steps.push({
            type: 'shift',
            description: `Shifting elements to the right`,
            array: JSON.parse(JSON.stringify(arr))
          });
        }
      }

      const newElement = new ArrayElement(value, 0);
      newElement.state = 'inserting';
      arr[0] = newElement;

      steps.push({
        type: 'insert-complete',
        index: 0,
        description: `Inserted ${value} at the beginning`,
        array: JSON.parse(JSON.stringify(arr))
      });
    }
    else if (operationType === 'specific') {
      // Insert at specific index
      const insertIndex = index;
      steps.push({
        type: 'insert-prepare',
        description: `Preparing to insert ${value} at index ${insertIndex}`,
        array: JSON.parse(JSON.stringify(arr))
      });

      // Animate shifting for specific index
      for (let i = arr.length; i > insertIndex; i--) {
        arr[i] = arr[i - 1];
        arr[i].index = i;
        arr[i].state = 'shifting';
        if (i - 1 > insertIndex) arr[i - 1].state = 'default';
        
        steps.push({
          type: 'shift',
          description: `Shifting element from index ${i - 1} to ${i}`,
          array: JSON.parse(JSON.stringify(arr))
        });
      }

      const newElement = new ArrayElement(value, insertIndex);
      newElement.state = 'inserting';
      arr[insertIndex] = newElement;

      steps.push({
        type: 'insert-complete',
        index: insertIndex,
        description: `Inserted ${value} at index ${insertIndex}`,
        array: JSON.parse(JSON.stringify(arr))
      });
    }

    steps.push({
      type: 'complete',
      description: 'Insertion operation completed successfully',
      array: JSON.parse(JSON.stringify(arr))
    });

    return { steps, newArray: arr };
  }

  static generateDeleteSteps(array, operationType, index = -1) {
    const steps = [];
    const arr = array.map(el => new ArrayElement(el.value, el.index));

    steps.push({
      type: 'start',
      description: `Starting deletion operation: ${operationType}`,
      array: JSON.parse(JSON.stringify(arr))
    });

    if (operationType === 'end') {
      const deletedValue = arr[arr.length - 1].value;
      arr[arr.length - 1].state = 'deleting';
      
      steps.push({
        type: 'delete-mark',
        index: arr.length - 1,
        description: `Marking element ${deletedValue} at the end for deletion`,
        array: JSON.parse(JSON.stringify(arr))
      });

      arr.pop();

      steps.push({
        type: 'delete-complete',
        description: `Deleted ${deletedValue} from the end`,
        array: JSON.parse(JSON.stringify(arr))
      });
    }
    else if (operationType === 'beginning') {
      const deletedValue = arr[0].value;
      arr[0].state = 'deleting';
      
      steps.push({
        type: 'delete-mark',
        index: 0,
        description: `Marking element ${deletedValue} at beginning for deletion`,
        array: JSON.parse(JSON.stringify(arr))
      });

      // Animate shifting left
      for (let i = 0; i < arr.length - 1; i++) {
        arr[i] = arr[i + 1];
        arr[i].index = i;
        arr[i].state = 'shifting';
        if (i > 0) arr[i - 1].state = 'default';
        
        steps.push({
          type: 'shift',
          description: `Shifting element from index ${i + 1} to ${i}`,
          array: JSON.parse(JSON.stringify(arr))
        });
      }
      arr.pop();

      steps.push({
        type: 'delete-complete',
        description: `Deleted ${deletedValue} from the beginning`,
        array: JSON.parse(JSON.stringify(arr))
      });
    }
    else if (operationType === 'specific') {
      const deletedValue = arr[index].value;
      arr[index].state = 'deleting';
      
      steps.push({
        type: 'delete-mark',
        index: index,
        description: `Marking element ${deletedValue} at index ${index} for deletion`,
        array: JSON.parse(JSON.stringify(arr))
      });

      // Animate shifting left from deletion point
      for (let i = index; i < arr.length - 1; i++) {
        arr[i] = arr[i + 1];
        arr[i].index = i;
        arr[i].state = 'shifting';
        if (i > index) arr[i - 1].state = 'default';
        
        steps.push({
          type: 'shift',
          description: `Shifting element from index ${i + 1} to ${i}`,
          array: JSON.parse(JSON.stringify(arr))
        });
      }
      arr.pop();

      steps.push({
        type: 'delete-complete',
        description: `Deleted ${deletedValue} from index ${index}`,
        array: JSON.parse(JSON.stringify(arr))
      });
    }

    steps.push({
      type: 'complete',
      description: 'Deletion operation completed successfully',
      array: JSON.parse(JSON.stringify(arr))
    });

    return { steps, newArray: arr };
  }

  static generateSearchSteps(array, searchValue) {
    const steps = [];
    const arr = array.map(el => new ArrayElement(el.value, el.index));

    steps.push({
      type: 'start',
      description: `Starting linear search for value ${searchValue}`,
      array: JSON.parse(JSON.stringify(arr))
    });

    let foundIndex = -1;

    for (let i = 0; i < arr.length; i++) {
      // Reset previous element state
      if (i > 0) arr[i - 1].state = 'default';
      
      arr[i].state = 'searching';
      
      steps.push({
        type: 'compare',
        index: i,
        description: `Checking element at index ${i}: ${arr[i].value}`,
        array: JSON.parse(JSON.stringify(arr))
      });

      if (arr[i].value === searchValue) {
        foundIndex = i;
        arr[i].state = 'found';
        
        steps.push({
          type: 'found',
          index: i,
          description: `Found ${searchValue} at index ${i}!`,
          array: JSON.parse(JSON.stringify(arr))
        });
        break;
      } else {
        steps.push({
          type: 'not-found',
          index: i,
          description: `${arr[i].value} ≠ ${searchValue}, continuing search...`,
          array: JSON.parse(JSON.stringify(arr))
        });
      }
    }

    if (foundIndex === -1) {
      steps.push({
        type: 'not-found',
        description: `${searchValue} not found in the array`,
        array: JSON.parse(JSON.stringify(arr))
      });
    }

    steps.push({
      type: 'complete',
      description: 'Search operation completed',
      array: JSON.parse(JSON.stringify(arr))
    });

    return { steps, newArray: arr, foundIndex };
  }

  static generateUpdateSteps(array, index, newValue) {
    const steps = [];
    const arr = array.map(el => new ArrayElement(el.value, el.index));

    steps.push({
      type: 'start',
      description: `Starting update operation at index ${index}`,
      array: JSON.parse(JSON.stringify(arr))
    });

    const oldValue = arr[index].value;
    arr[index].state = 'updating';
    
    steps.push({
      type: 'update-prepare',
      index: index,
      description: `Preparing to update index ${index} from ${oldValue} to ${newValue}`,
      array: JSON.parse(JSON.stringify(arr))
    });

    arr[index].value = newValue;
    arr[index].state = 'updated';
    
    steps.push({
      type: 'update-complete',
      index: index,
      description: `Updated index ${index} from ${oldValue} to ${newValue}`,
      array: JSON.parse(JSON.stringify(arr))
    });

    steps.push({
      type: 'complete',
      description: 'Update operation completed successfully',
      array: JSON.parse(JSON.stringify(arr))
    });

    return { steps, newArray: arr };
  }
}

function ArrayVisualizer() {
  const navigate = useNavigate();
  const [array, setArray] = useState([]);
  const [operation, setOperation] = useState('insert');
  const [operationType, setOperationType] = useState('end');
  const [value, setValue] = useState('');
  const [index, setIndex] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [message, setMessage] = useState('Array initialized. Choose an operation to start.');
  const [arraySize, setArraySize] = useState(8);
  const [arrayType, setArrayType] = useState('random');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [steps, setSteps] = useState([]);
  const [showComplexity, setShowComplexity] = useState(true);
  
  const shouldStopRef = useRef(false);

  // Initialize array with ArrayElement objects
  const generateArray = useCallback(() => {
    const newArray = [];
    
    if (arrayType === 'random') {
      for (let i = 0; i < arraySize; i++) {
        const value = Math.floor(Math.random() * 95) + 5;
        newArray.push(new ArrayElement(value, i));
      }
    } else if (arrayType === 'sorted') {
      for (let i = 0; i < arraySize; i++) {
        const value = Math.floor((i * 80) / arraySize) + 10;
        newArray.push(new ArrayElement(value, i));
      }
    } else if (arrayType === 'reversed') {
      for (let i = 0; i < arraySize; i++) {
        const value = Math.floor(((arraySize - i - 1) * 80) / arraySize) + 10;
        newArray.push(new ArrayElement(value, i));
      }
    }

    setArray(newArray);
    setMessage(`Generated new ${arrayType} array with ${arraySize} elements`);
    setCurrentStep(0);
    setTotalSteps(0);
    setSteps([]);
  }, [arraySize, arrayType]);

  useEffect(() => {
    generateArray();
  }, [generateArray]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Execute operation with step-by-step animation
  const executeOperation = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsPaused(false);
    setCurrentStep(0);
    shouldStopRef.current = false;

    let result;
    switch (operation) {
      case 'insert':
        if (!value) {
          setMessage('Please enter a value to insert');
          setIsAnimating(false);
          return;
        }
        if (operationType === 'specific' && (!index || index < 0 || index > array.length)) {
          setMessage('Please enter a valid index for insertion');
          setIsAnimating(false);
          return;
        }
        result = ArrayOperations.generateInsertSteps(
          array, 
          parseInt(value), 
          operationType, 
          operationType === 'specific' ? parseInt(index) : -1
        );
        break;
      case 'delete':
        if (array.length === 0) {
          setMessage('Array is empty. Nothing to delete.');
          setIsAnimating(false);
          return;
        }
        if (operationType === 'specific' && (!index || index < 0 || index >= array.length)) {
          setMessage('Please enter a valid index for deletion');
          setIsAnimating(false);
          return;
        }
        result = ArrayOperations.generateDeleteSteps(
          array,
          operationType,
          operationType === 'specific' ? parseInt(index) : -1
        );
        break;
      case 'search':
        if (!searchValue) {
          setMessage('Please enter a value to search');
          setIsAnimating(false);
          return;
        }
        result = ArrayOperations.generateSearchSteps(array, parseInt(searchValue));
        break;
      case 'update':
        if (!value || !index) {
          setMessage('Please enter both value and index');
          setIsAnimating(false);
          return;
        }
        if (index < 0 || index >= array.length) {
          setMessage('Please enter a valid index');
          setIsAnimating(false);
          return;
        }
        result = ArrayOperations.generateUpdateSteps(
          array,
          parseInt(index),
          parseInt(value)
        );
        break;
      default:
        setMessage('Please select an operation');
        setIsAnimating(false);
        return;
    }

    setSteps(result.steps);
    setTotalSteps(result.steps.length);

    // Execute animations step by step
    for (let i = 0; i < result.steps.length; i++) {
      if (shouldStopRef.current) break;
      
      if (isPaused) {
        while (isPaused && !shouldStopRef.current) {
          await sleep(100);
        }
        if (shouldStopRef.current) break;
      }

      const step = result.steps[i];
      setCurrentStep(i + 1);
      setMessage(step.description);

      // Update array from step data
      if (step.array) {
        setArray(step.array.map((el, idx) => {
          const newEl = new ArrayElement(el.value, idx);
          newEl.state = el.state;
          newEl.color = el.color || '#3B82F6';
          return newEl;
        }));
      }

      await sleep(500 - animationSpeed);
    }

    if (!shouldStopRef.current && operation !== 'search') {
      // Final update with the new array state
      if (result.newArray) {
        setArray(result.newArray.map((el, idx) => {
          const newEl = new ArrayElement(el.value, idx);
          newEl.state = 'default';
          return newEl;
        }));
      }
    }
    
    setIsAnimating(false);
    shouldStopRef.current = false;
    
    // Clear input fields
    setValue('');
    setIndex('');
    setSearchValue('');
  };

  // Reset animation
  const resetAnimation = () => {
    shouldStopRef.current = true;
    setIsAnimating(false);
    setIsPaused(false);
    setCurrentStep(0);
    setSteps([]);
    generateArray();
  };

  // Get element color based on state
  const getElementColor = (element) => {
    switch (element.state) {
      case 'searching':
        return '#F59E0B'; // Yellow
      case 'inserting':
        return '#10B981'; // Green
      case 'deleting':
        return '#EF4444'; // Red
      case 'updating':
        return '#8B5CF6'; // Purple
      case 'updated':
        return '#EC4899'; // Pink
      case 'found':
        return '#10B981'; // Green
      case 'shifting':
        return '#F97316'; // Orange
      default:
        return '#3B82F6'; // Blue
    }
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

  // Get operation complexity
  const getOperationComplexity = () => {
    const complexities = {
      access: 'O(1)',
      search: 'O(n)',
      insertion: {
        end: 'O(1)',
        beginning: 'O(n)',
        specific: 'O(n)'
      },
      deletion: {
        end: 'O(1)',
        beginning: 'O(n)',
        specific: 'O(n)'
      },
      update: 'O(1)'
    };

    return complexities;
  };

  const complexity = getOperationComplexity();

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
          <p className="text-lg text-gray-300">Visualize array operations with step-by-step animations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Operations Card */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Array Operations</h3>
                
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
                      max={operation === 'insert' ? array.length : array.length - 1}
                      disabled={isAnimating}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button 
                    className="btn btn-primary flex-1"
                    onClick={executeOperation}
                    disabled={isAnimating}
                  >
                    {isAnimating ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      `Execute ${operation.charAt(0).toUpperCase() + operation.slice(1)}`
                    )}
                  </button>
                  
                  <button 
                    className="btn btn-outline btn-error"
                    onClick={resetAnimation}
                  >
                    Reset
                  </button>
                </div>

                {isAnimating && (
                  <div className="form-control">
                    <button 
                      className="btn btn-outline btn-warning mt-2"
                      onClick={() => setIsPaused(!isPaused)}
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Array Configuration */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Array Configuration</h3>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Array Size</span>
                  </label>
                  <input 
                    type="range" 
                    min="5" 
                    max="34" 
                    value={arraySize}
                    onChange={(e) => setArraySize(parseInt(e.target.value))}
                    className="range range-primary"
                    disabled={isAnimating}
                  />
                  <div className="text-center text-sm text-gray-400">
                    {arraySize} elements
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Array Type</span>
                  </label>
                  <select 
                    className="select select-bordered bg-gray-700 text-white border-gray-600"
                    value={arrayType}
                    onChange={(e) => setArrayType(e.target.value)}
                    disabled={isAnimating}
                  >
                    <option value="random">Random</option>
                    <option value="sorted">Sorted</option>
                    <option value="reversed">Reversed</option>
                  </select>
                </div>

                <div className="form-control mt-4">
                  <button 
                    className="btn btn-outline btn-accent"
                    onClick={generateArray}
                    disabled={isAnimating}
                  >
                    Generate New Array
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
                    max="490" 
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                    className="range range-primary"
                    disabled={isAnimating}
                  />
                  <div className="text-center text-sm text-gray-400">
                    {animationSpeed < 150 ? 'Slow' : 
                     animationSpeed < 300 ? 'Medium' : 
                     animationSpeed < 450 ? 'Fast' : 'Very Fast'}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Operation Status</h3>
                <p className="text-sm text-gray-300 mb-4">{message}</p>
                
                {isAnimating && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span className="font-bold text-blue-400">
                        {currentStep} / {totalSteps}
                      </span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={currentStep} 
                      max={totalSteps}
                    ></progress>
                  </div>
                )}

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

            {/* Time Complexity */}
            {showComplexity && (
              <div className="card bg-gray-800 shadow-lg border border-gray-700">
                <div className="card-body">
                  <h3 className="card-title text-white">Time Complexity</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Access:</span>
                      <span className="font-bold text-green-400">{complexity.access}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Search:</span>
                      <span className="font-bold text-yellow-400">{complexity.search}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insertion:</span>
                      <span className="font-bold text-yellow-400">
                        {complexity.insertion[operationType] || complexity.insertion}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deletion:</span>
                      <span className="font-bold text-yellow-400">
                        {complexity.deletion[operationType] || complexity.deletion}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Update:</span>
                      <span className="font-bold text-green-400">{complexity.update}</span>
                    </div>
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
                    <span className="text-gray-300">Default</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-300">Searching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-300">Inserting/Found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-300">Deleting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-gray-300">Updating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-gray-300">Shifting</span>
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
                  <h3 className="card-title text-white">Array Visualization</h3>
                  <div className="text-sm text-gray-400">
                    {isAnimating ? `Step ${currentStep} of ${totalSteps}` : getOperationDescription()}
                  </div>
                </div>

                {/* Array Display */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-96">
                  <div className="flex flex-wrap items-end justify-center gap-2 h-80" style={{ minHeight: '320px' }}>
                    {array.map((element) => (
                      <div
                        key={element.id}
                        className="flex flex-col items-center transition-all duration-300 ease-in-out"
                        style={{ 
                          width: `${Math.max(80 / array.length, 4)}%`,
                          minWidth: '40px'
                        }}
                      >
                        <div
                          className="w-full rounded-t-lg transition-all duration-300 border border-gray-700 border-b-0 flex items-center justify-center text-white font-bold"
                          style={{
                            height: `${element.value}%`,
                            backgroundColor: getElementColor(element),
                            minHeight: `${element.value}px`,
                            transition: 'all 0.3s ease-in-out'
                          }}
                        >
                          {element.value}
                        </div>
                        <div className="mt-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                          [{element.index}]
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Empty State */}
                  {array.length === 0 && (
                    <div className="text-center py-12 text-gray-500 text-lg">
                      Array is empty. Use insert operations to add elements.
                    </div>
                  )}
                </div>

                {/* Memory Representation */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Memory Representation</h4>
                  <div className="bg-gray-900 rounded p-4 border border-gray-700">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {array.map((element, idx) => (
                        <div key={idx} className="flex items-center">
                          <div 
                            className="bg-gray-700 px-3 py-2 rounded border text-sm font-mono transition-colors duration-300"
                            style={{ 
                              borderColor: getElementColor(element),
                              backgroundColor: getElementColor(element) === '#3B82F6' ? '#374151' : getElementColor(element) + '20'
                            }}
                          >
                            <span className="text-gray-400">[{idx}]</span> = {element.value}
                          </div>
                          {idx < array.length - 1 && (
                            <div className="text-gray-500 mx-2">→</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-400 text-center">
                      Contiguous memory blocks with sequential access
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Array Information */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Array Data Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-2">Characteristics</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Contiguous memory allocation</li>
                      <li>• Random access - O(1) time complexity</li>
                      <li>• Fixed size (static) or dynamic size</li>
                      <li>• Cache-friendly due to locality</li>
                      <li>• Homogeneous data elements</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Operations Complexity</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Access: O(1) - Constant time</li>
                      <li>• Search: O(n) - Linear time</li>
                      <li>• Insertion: O(n) - Linear time</li>
                      <li>• Deletion: O(n) - Linear time</li>
                      <li>• Update: O(1) - Constant time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Operation Details */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Operation Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h5 className="font-bold text-white mb-2">How It Works</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {operation === 'insert' && (
                        <>
                          <li>• Elements are stored in contiguous memory</li>
                          <li>• Insertion may require shifting elements</li>
                          <li>• Dynamic arrays handle resizing automatically</li>
                          <li>• Insert at end is most efficient</li>
                        </>
                      )}
                      {operation === 'delete' && (
                        <>
                          <li>• Removal requires shifting elements</li>
                          <li>• Delete from end is most efficient</li>
                          <li>• Memory is reclaimed automatically</li>
                          <li>• Array size decreases by one</li>
                        </>
                      )}
                      {operation === 'search' && (
                        <>
                          <li>• Linear search checks each element</li>
                          <li>• No special ordering required</li>
                          <li>• Works on any array type</li>
                          <li>• Simple but inefficient for large arrays</li>
                        </>
                      )}
                      {operation === 'update' && (
                        <>
                          <li>• Direct access via index</li>
                          <li>• No shifting required</li>
                          <li>• Most efficient array operation</li>
                          <li>• Constant time operation</li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h5 className="font-bold text-white mb-2">Use Cases</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {operation === 'insert' && (
                        <>
                          <li>• Adding new data elements</li>
                          <li>• Building collections dynamically</li>
                          <li>• Implementing stacks and queues</li>
                          <li>• Data stream processing</li>
                        </>
                      )}
                      {operation === 'delete' && (
                        <>
                          <li>• Removing outdated data</li>
                          <li>• Memory management</li>
                          <li>• Implementing undo operations</li>
                          <li>• Data filtering</li>
                        </>
                      )}
                      {operation === 'search' && (
                        <>
                          <li>• Finding specific elements</li>
                          <li>• Data validation</li>
                          <li>• Counting occurrences</li>
                          <li>• Small to medium datasets</li>
                        </>
                      )}
                      {operation === 'update' && (
                        <>
                          <li>• Modifying existing data</li>
                          <li>• Real-time data updates</li>
                          <li>• Configuration changes</li>
                          <li>• State management</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Real-world Applications */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Real-world Applications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Image Processing</h5>
                      <p className="text-gray-300">Arrays store pixel data for images, enabling fast access and manipulation.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Game Development</h5>
                      <p className="text-gray-300">Store game objects, player inventories, and level data efficiently.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Database Systems</h5>
                      <p className="text-gray-300">Used in buffer pools, index structures, and temporary storage.</p>
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

export default ArrayVisualizer;