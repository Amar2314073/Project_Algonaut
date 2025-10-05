// components/visualizers/SearchingVisualizer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

class ArrayElement {
  constructor(value, index) {
    this.value = value;
    this.index = index;
    this.id = `element-${index}-${value}`;
    this.state = 'normal'; // 'normal', 'comparing', 'found', 'not-found', 'current', 'pivot', 'range'
    this.highlighted = false;
    this.visited = false;
    this.isTarget = false;
  }

  reset() {
    this.state = 'normal';
    this.highlighted = false;
    this.visited = false;
    this.isTarget = false;
  }
}

class SearchingAlgorithms {
  static linearSearch(array, target) {
    const steps = [];
    const animations = [];
    
    for (let i = 0; i < array.length; i++) {
      // Step: mark current element as comparing
      animations.push({
        type: 'compare',
        indices: [i],
        description: `Comparing element at index ${i} (value: ${array[i].value}) with target ${target}`
      });
      
      if (array[i].value === target) {
        // Step: found the target
        animations.push({
          type: 'found',
          indices: [i],
          description: `Target ${target} found at index ${i}!`
        });
        steps.push({ index: i, found: true });
        return { steps, animations, found: true, index: i };
      } else {
        // Step: mark as visited
        animations.push({
          type: 'visited',
          indices: [i],
          description: `Element at index ${i} is not the target, moving to next element`
        });
        steps.push({ index: i, found: false });
      }
    }
    
    animations.push({
      type: 'not-found',
      indices: [],
      description: `Target ${target} not found in the array`
    });
    return { steps, animations, found: false, index: -1 };
  }

  static binarySearch(array, target) {
    const steps = [];
    const animations = [];
    let left = 0;
    let right = array.length - 1;

    animations.push({
      type: 'range',
      indices: [left, right],
      description: `Initial search range: indices ${left} to ${right}`
    });

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      // Mark current mid as comparing
      animations.push({
        type: 'compare',
        indices: [mid],
        description: `Calculating mid index: (${left} + ${right}) / 2 = ${mid}`
      });

      animations.push({
        type: 'pivot',
        indices: [mid],
        description: `Comparing element at mid index ${mid} (value: ${array[mid].value}) with target ${target}`
      });

      if (array[mid].value === target) {
        animations.push({
          type: 'found',
          indices: [mid],
          description: `Target ${target} found at index ${mid}!`
        });
        steps.push({ left, right, mid, found: true });
        return { steps, animations, found: true, index: mid };
      } else if (array[mid].value < target) {
        animations.push({
          type: 'visited',
          indices: [mid],
          description: `Array[${mid}] = ${array[mid].value} < ${target}, searching right half`
        });
        steps.push({ left, right, mid, found: false });
        left = mid + 1;
      } else {
        animations.push({
          type: 'visited',
          indices: [mid],
          description: `Array[${mid}] = ${array[mid].value} > ${target}, searching left half`
        });
        steps.push({ left, right, mid, found: false });
        right = mid - 1;
      }

      if (left <= right) {
        animations.push({
          type: 'range',
          indices: [left, right],
          description: `New search range: indices ${left} to ${right}`
        });
      }
    }

    animations.push({
      type: 'not-found',
      indices: [],
      description: `Target ${target} not found in the array`
    });
    return { steps, animations, found: false, index: -1 };
  }

  static jumpSearch(array, target) {
    const steps = [];
    const animations = [];
    const n = array.length;
    const step = Math.floor(Math.sqrt(n));
    
    animations.push({
      type: 'info',
      indices: [],
      description: `Jump search: step size = sqrt(${n}) = ${step}`
    });

    let prev = 0;
    let curr = step;

    // Jump forward in steps
    while (curr < n && array[curr].value <= target) {
      animations.push({
        type: 'compare',
        indices: [curr],
        description: `Jumping to index ${curr}, value = ${array[curr].value}`
      });

      if (array[curr].value === target) {
        animations.push({
          type: 'found',
          indices: [curr],
          description: `Target ${target} found at index ${curr}!`
        });
        return { steps, animations, found: true, index: curr };
      }

      animations.push({
        type: 'visited',
        indices: [curr],
        description: `Array[${curr}] = ${array[curr].value} < ${target}, continuing jump`
      });

      prev = curr;
      curr += step;
    }

    // Linear search in the current block
    animations.push({
      type: 'range',
      indices: [prev, Math.min(curr, n - 1)],
      description: `Performing linear search in block [${prev}, ${Math.min(curr, n - 1)}]`
    });

    for (let i = prev; i <= Math.min(curr, n - 1); i++) {
      animations.push({
        type: 'compare',
        indices: [i],
        description: `Linear search: comparing index ${i}, value = ${array[i].value}`
      });

      if (array[i].value === target) {
        animations.push({
          type: 'found',
          indices: [i],
          description: `Target ${target} found at index ${i}!`
        });
        return { steps, animations, found: true, index: i };
      }

      animations.push({
        type: 'visited',
        indices: [i],
        description: `Array[${i}] = ${array[i].value} ≠ ${target}, continuing`
      });
    }

    animations.push({
      type: 'not-found',
      indices: [],
      description: `Target ${target} not found in the array`
    });
    return { steps, animations, found: false, index: -1 };
  }

  static interpolationSearch(array, target) {
    const steps = [];
    const animations = [];
    let low = 0;
    let high = array.length - 1;

    animations.push({
      type: 'range',
      indices: [low, high],
      description: `Initial search range: indices ${low} to ${high}`
    });

    while (low <= high && target >= array[low].value && target <= array[high].value) {
      // Calculate position using interpolation formula
      const pos = low + Math.floor(
        ((target - array[low].value) * (high - low)) / (array[high].value - array[low].value)
      );

      animations.push({
        type: 'info',
        indices: [],
        description: `Interpolation: pos = ${low} + ((${target} - ${array[low].value}) * (${high} - ${low})) / (${array[high].value} - ${array[low].value}) = ${pos}`
      });

      animations.push({
        type: 'compare',
        indices: [pos],
        description: `Checking calculated position ${pos}, value = ${array[pos].value}`
      });

      if (array[pos].value === target) {
        animations.push({
          type: 'found',
          indices: [pos],
          description: `Target ${target} found at index ${pos}!`
        });
        return { steps, animations, found: true, index: pos };
      } else if (array[pos].value < target) {
        animations.push({
          type: 'visited',
          indices: [pos],
          description: `Array[${pos}] = ${array[pos].value} < ${target}, searching right side`
        });
        low = pos + 1;
      } else {
        animations.push({
          type: 'visited',
          indices: [pos],
          description: `Array[${pos}] = ${array[pos].value} > ${target}, searching left side`
        });
        high = pos - 1;
      }

      if (low <= high) {
        animations.push({
          type: 'range',
          indices: [low, high],
          description: `New search range: indices ${low} to ${high}`
        });
      }
    }

    animations.push({
      type: 'not-found',
      indices: [],
      description: `Target ${target} not found in the array`
    });
    return { steps, animations, found: false, index: -1 };
  }

  static exponentialSearch(array, target) {
    const steps = [];
    const animations = [];
    
    // If element is at first position
    if (array[0].value === target) {
      animations.push({
        type: 'found',
        indices: [0],
        description: `Target ${target} found at first position (index 0)!`
      });
      return { steps, animations, found: true, index: 0 };
    }

    // Find range for binary search by repeated doubling
    let i = 1;
    animations.push({
      type: 'info',
      indices: [],
      description: 'Exponential search: finding range by doubling index'
    });

    while (i < array.length && array[i].value <= target) {
      animations.push({
        type: 'compare',
        indices: [i],
        description: `Checking index ${i}, value = ${array[i].value}`
      });

      if (array[i].value === target) {
        animations.push({
          type: 'found',
          indices: [i],
          description: `Target ${target} found at index ${i}!`
        });
        return { steps, animations, found: true, index: i };
      }

      animations.push({
        type: 'visited',
        indices: [i],
        description: `Array[${i}] = ${array[i].value} < ${target}, doubling index`
      });

      i *= 2;
    }

    // Perform binary search in the found range
    const left = Math.floor(i / 2);
    const right = Math.min(i, array.length - 1);

    animations.push({
      type: 'range',
      indices: [left, right],
      description: `Found range [${left}, ${right}], performing binary search`
    });

    // Use binary search in the range [i/2, min(i, n-1)]
    const binaryResult = this.binarySearchInRange(array, target, left, right, animations);
    return { ...binaryResult, steps, animations };
  }

  static binarySearchInRange(array, target, left, right, animations) {
    const steps = [];

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      animations.push({
        type: 'compare',
        indices: [mid],
        description: `Binary search: mid = (${left} + ${right}) / 2 = ${mid}`
      });

      animations.push({
        type: 'pivot',
        indices: [mid],
        description: `Comparing array[${mid}] = ${array[mid].value} with target ${target}`
      });

      if (array[mid].value === target) {
        animations.push({
          type: 'found',
          indices: [mid],
          description: `Target ${target} found at index ${mid}!`
        });
        return { found: true, index: mid };
      } else if (array[mid].value < target) {
        animations.push({
          type: 'visited',
          indices: [mid],
          description: `Array[${mid}] = ${array[mid].value} < ${target}, searching right`
        });
        left = mid + 1;
      } else {
        animations.push({
          type: 'visited',
          indices: [mid],
          description: `Array[${mid}] = ${array[mid].value} > ${target}, searching left`
        });
        right = mid - 1;
      }

      if (left <= right) {
        animations.push({
          type: 'range',
          indices: [left, right],
          description: `New range: [${left}, ${right}]`
        });
      }
    }

    animations.push({
      type: 'not-found',
      indices: [],
      description: `Target ${target} not found in the range`
    });
    return { found: false, index: -1 };
  }
}

function SearchingVisualizer() {
  const navigate = useNavigate();
  const [array, setArray] = useState([]);
  const [algorithm, setAlgorithm] = useState('linear');
  const [target, setTarget] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(150);
  const [message, setMessage] = useState('Array initialized. Choose a search algorithm and target value.');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [searchResult, setSearchResult] = useState(null);
  const [arraySize, setArraySize] = useState(20);
  const [showComplexity, setShowComplexity] = useState(true);
  const [animations, setAnimations] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [arrayType, setArrayType] = useState('sorted'); // 'sorted', 'random', 'reversed'

  // Initialize array
  const initializeArray = useCallback(() => {
    const newArray = [];
    
    if (arrayType === 'sorted') {
      // Create sorted array
      for (let i = 0; i < arraySize; i++) {
        newArray.push(new ArrayElement(i * 5 + Math.floor(Math.random() * 3), i));
      }
    } else if (arrayType === 'random') {
      // Create random array (only for linear search)
      for (let i = 0; i < arraySize; i++) {
        newArray.push(new ArrayElement(Math.floor(Math.random() * 100), i));
      }
      // Sort if algorithm requires sorted array
      if (algorithm !== 'linear') {
        newArray.sort((a, b) => a.value - b.value);
        newArray.forEach((element, index) => element.index = index);
      }
    } else if (arrayType === 'reversed') {
      // Create reversed sorted array
      for (let i = 0; i < arraySize; i++) {
        newArray.push(new ArrayElement((arraySize - i - 1) * 5 + Math.floor(Math.random() * 3), i));
      }
      // For algorithms that require sorted array, we need to sort it properly
      if (algorithm !== 'linear') {
        newArray.sort((a, b) => a.value - b.value);
        newArray.forEach((element, index) => element.index = index);
      }
    }

    setArray(newArray);
    setMessage(`Array initialized with ${arraySize} ${arrayType} elements`);
    setSearchResult(null);
    setCurrentStep(0);
    setTotalSteps(0);
    setAnimations([]);
  }, [arraySize, arrayType, algorithm]);

  useEffect(() => {
    initializeArray();
  }, [initializeArray]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Reset array element states
  const resetArrayStates = () => {
    const newArray = array.map(element => {
      element.reset();
      return element;
    });
    setArray(newArray);
  };

  // Perform search
  const performSearch = async () => {
    if (!target) {
      setMessage('Please enter a target value to search');
      return;
    }

    const targetValue = parseInt(target);
    if (isNaN(targetValue)) {
      setMessage('Please enter a valid number');
      return;
    }

    setIsAnimating(true);
    setIsPaused(false);
    resetArrayStates();
    setCurrentStep(0);
    setSearchResult(null);

    let result;
    switch (algorithm) {
      case 'linear':
        result = SearchingAlgorithms.linearSearch(array, targetValue);
        break;
      case 'binary':
        result = SearchingAlgorithms.binarySearch(array, targetValue);
        break;
      case 'jump':
        result = SearchingAlgorithms.jumpSearch(array, targetValue);
        break;
      case 'interpolation':
        result = SearchingAlgorithms.interpolationSearch(array, targetValue);
        break;
      case 'exponential':
        result = SearchingAlgorithms.exponentialSearch(array, targetValue);
        break;
      default:
        result = SearchingAlgorithms.linearSearch(array, targetValue);
    }

    setAnimations(result.animations);
    setTotalSteps(result.animations.length);

    // Execute animations
    for (let i = 0; i < result.animations.length; i++) {
      if (isPaused) {
        // Wait until resumed
        while (isPaused) {
          await sleep(100);
        }
      }

      const animation = result.animations[i];
      setCurrentStep(i + 1);
      setMessage(animation.description);

      // Update array states based on animation type
      const newArray = [...array];
      
      // Reset all elements to normal first
      newArray.forEach(element => {
        if (element.state !== 'found' && element.state !== 'not-found') {
          element.state = 'normal';
        }
      });

      // Apply animation
      switch (animation.type) {
        case 'compare':
          animation.indices.forEach(index => {
            if (newArray[index]) newArray[index].state = 'comparing';
          });
          break;
        case 'found':
          animation.indices.forEach(index => {
            if (newArray[index]) {
              newArray[index].state = 'found';
              newArray[index].isTarget = true;
            }
          });
          break;
        case 'visited':
          animation.indices.forEach(index => {
            if (newArray[index] && newArray[index].state !== 'found') {
              newArray[index].state = 'visited';
            }
          });
          break;
        case 'pivot':
          animation.indices.forEach(index => {
            if (newArray[index]) newArray[index].state = 'pivot';
          });
          break;
        case 'range':
          // Mark range boundaries
          newArray.forEach((element, index) => {
            if (index >= animation.indices[0] && index <= animation.indices[1]) {
              element.state = 'range';
            }
          });
          break;
        case 'not-found':
          // Optional: mark all as visited or keep as is
          break;
      }

      setArray(newArray);
      await sleep(animationSpeed);
    }

    setSearchResult(result);
    setIsAnimating(false);
  };

  // Get element color based on state
  const getElementColor = (element) => {
    switch (element.state) {
      case 'comparing':
        return '#F59E0B'; // Yellow - currently comparing
      case 'found':
        return '#10B981'; // Green - found target
      case 'visited':
        return '#6B7280'; // Gray - already visited
      case 'pivot':
        return '#8B5CF6'; // Purple - pivot in binary search
      case 'range':
        return '#3B82F6'; // Blue - in current search range
      case 'not-found':
        return '#EF4444'; // Red - not found (if we want to show this)
      default:
        return '#4B5563'; // Dark gray - normal
    }
  };

  // Get algorithm complexity
  const getAlgorithmComplexity = () => {
    switch (algorithm) {
      case 'linear':
        return { time: 'O(n)', space: 'O(1)', best: 'O(1)', worst: 'O(n)' };
      case 'binary':
        return { time: 'O(log n)', space: 'O(1)', best: 'O(1)', worst: 'O(log n)' };
      case 'jump':
        return { time: 'O(√n)', space: 'O(1)', best: 'O(1)', worst: 'O(√n)' };
      case 'interpolation':
        return { time: 'O(log log n)', space: 'O(1)', best: 'O(1)', worst: 'O(n)' };
      case 'exponential':
        return { time: 'O(log n)', space: 'O(1)', best: 'O(1)', worst: 'O(log n)' };
      default:
        return { time: 'O(n)', space: 'O(1)', best: 'O(1)', worst: 'O(n)' };
    }
  };

  // Get algorithm description
  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case 'linear':
        return 'Sequentially checks each element until target is found or end is reached.';
      case 'binary':
        return 'Divides sorted array in half repeatedly, eliminating half of remaining elements each time.';
      case 'jump':
        return 'Jumps ahead by fixed steps, then performs linear search when overshoot is detected.';
      case 'interpolation':
        return 'Uses value distribution to estimate target position, optimal for uniformly distributed data.';
      case 'exponential':
        return 'Finds range by exponential increase, then performs binary search within that range.';
      default:
        return 'Select a search algorithm to see its description.';
    }
  };

  const complexity = getAlgorithmComplexity();

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
          <h1 className="text-4xl font-bold text-white mb-2">Searching Algorithms Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize and compare different searching algorithms with interactive animations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Algorithm Selection */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Search Configuration</h3>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Search Algorithm</span>
                  </label>
                  <select 
                    className="select select-bordered bg-gray-700 text-white border-gray-600"
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    disabled={isAnimating}
                  >
                    <option value="linear">Linear Search</option>
                    <option value="binary">Binary Search</option>
                    <option value="jump">Jump Search</option>
                    <option value="interpolation">Interpolation Search</option>
                    <option value="exponential">Exponential Search</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300">Target Value</span>
                  </label>
                  <input 
                    type="number" 
                    className="input input-bordered bg-gray-700 text-white border-gray-600"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Enter value to search"
                    disabled={isAnimating}
                  />
                </div>

                <div className="form-control mt-4">
                  <button 
                    className="btn btn-primary"
                    onClick={performSearch}
                    disabled={isAnimating || !target}
                  >
                    {isAnimating ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      `Run ${algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Search`
                    )}
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
                    min="10" 
                    max="50" 
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
                    <option value="sorted">Sorted Array</option>
                    <option value="random">Random Array</option>
                    <option value="reversed">Reversed Array</option>
                  </select>
                </div>

                <div className="form-control mt-4">
                  <button 
                    className="btn btn-outline btn-accent"
                    onClick={initializeArray}
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
                <h3 className="card-title text-white">Search Status</h3>
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

                {searchResult && (
                  <div className="mt-4 p-3 rounded-lg bg-gray-700">
                    <div className={`text-lg font-bold ${
                      searchResult.found ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {searchResult.found 
                        ? `✓ Found at index ${searchResult.index}` 
                        : '✗ Not found'
                      }
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      Steps taken: {searchResult.steps?.length || 'N/A'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Algorithm Complexity */}
            {showComplexity && (
              <div className="card bg-gray-800 shadow-lg border border-gray-700">
                <div className="card-body">
                  <h3 className="card-title text-white">Time Complexity</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Average Case:</span>
                      <span className="font-bold text-yellow-400">{complexity.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Case:</span>
                      <span className="font-bold text-green-400">{complexity.best}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worst Case:</span>
                      <span className="font-bold text-red-400">{complexity.worst}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Space Complexity:</span>
                      <span className="font-bold text-blue-400">{complexity.space}</span>
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
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    <span className="text-gray-300">Normal Element</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-300">Comparing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-gray-300">Search Range</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-gray-300">Pivot/Mid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span className="text-gray-300">Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-300">Found</span>
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
                    {algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Search Visualization
                  </h3>
                  <div className="text-sm text-gray-400">
                    {arrayType.charAt(0).toUpperCase() + arrayType.slice(1)} Array • {arraySize} Elements
                  </div>
                </div>

                {/* Algorithm Description */}
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <p className="text-gray-300 text-sm">{getAlgorithmDescription()}</p>
                </div>

                {/* Array Visualization */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex flex-col items-center">
                    {/* Array Elements */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-6xl">
                      {array.map((element, index) => (
                        <div
                          key={element.id}
                          className="flex flex-col items-center transition-all duration-300"
                        >
                          {/* Value Box */}
                          <div
                            className="w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                            style={{
                              backgroundColor: getElementColor(element),
                              borderColor: element.isTarget ? '#10B981' : '#4B5563',
                              boxShadow: element.isTarget 
                                ? '0 0 15px rgba(16, 185, 129, 0.5)' 
                                : '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            <span className="text-white font-bold text-sm">
                              {element.value}
                            </span>
                          </div>
                          
                          {/* Index Label */}
                          <div className="mt-1 text-xs text-gray-400">
                            [{index}]
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Search Progress */}
                    {isAnimating && currentStep > 0 && (
                      <div className="w-full max-w-4xl">
                        <div className="text-center text-sm text-gray-400 mb-2">
                          Step {currentStep} of {totalSteps}
                        </div>
                        <progress 
                          className="progress progress-primary w-full" 
                          value={currentStep} 
                          max={totalSteps}
                        ></progress>
                      </div>
                    )}
                  </div>
                </div>

                {/* Algorithm Information */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Algorithm Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">When to Use</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {algorithm === 'linear' && (
                          <>
                            <li>• Small datasets</li>
                            <li>• Unsorted data</li>
                            <li>• Simple implementation</li>
                            <li>• Frequent searches on small data</li>
                          </>
                        )}
                        {algorithm === 'binary' && (
                          <>
                            <li>• Large sorted datasets</li>
                            <li>• Random access supported</li>
                            <li>• Infrequent insertions/deletions</li>
                            <li>• Predictable performance</li>
                          </>
                        )}
                        {algorithm === 'jump' && (
                          <>
                            <li>• Large sorted datasets</li>
                            <li>• When jumping is cheaper than comparison</li>
                            <li>• Backward traversal is expensive</li>
                            <li>• Moderate dataset sizes</li>
                          </>
                        )}
                        {algorithm === 'interpolation' && (
                          <>
                            <li>• Uniformly distributed sorted data</li>
                            <li>• Very large datasets</li>
                            <li>• When distribution is known</li>
                            <li>• Optimal for telephone directories</li>
                          </>
                        )}
                        {algorithm === 'exponential' && (
                          <>
                            <li>• Unlimited/unbounded sorted data</li>
                            <li>• When target is near beginning</li>
                            <li>• Better than binary for bounded searches</li>
                            <li>• Streaming data applications</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">Key Characteristics</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {algorithm === 'linear' && (
                          <>
                            <li>• Works on any data structure</li>
                            <li>• No preprocessing needed</li>
                            <li>• Simple to implement</li>
                            <li>• Inefficient for large data</li>
                          </>
                        )}
                        {algorithm === 'binary' && (
                          <>
                            <li>• Requires sorted data</li>
                            <li>• Divide and conquer approach</li>
                            <li>• Very efficient for large data</li>
                            <li>• Random access requirement</li>
                          </>
                        )}
                        {algorithm === 'jump' && (
                          <>
                            <li>• Requires sorted data</li>
                            <li>• Better than linear for large data</li>
                            <li>• Optimal step = √n</li>
                            <li>• Between linear and binary in performance</li>
                          </>
                        )}
                        {algorithm === 'interpolation' && (
                          <>
                            <li>• Requires sorted uniform data</li>
                            <li>• Makes educated guesses</li>
                            <li>• Can be faster than binary search</li>
                            <li>• Performance depends on distribution</li>
                          </>
                        )}
                        {algorithm === 'exponential' && (
                          <>
                            <li>• Requires sorted data</li>
                            <li>• Combines jumping and binary search</li>
                            <li>• Efficient for unbounded data</li>
                            <li>• Good when element is near start</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Searching Algorithms Comparison</h3>
                
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th className="bg-gray-700 text-white">Algorithm</th>
                        <th className="bg-gray-700 text-white">Best Case</th>
                        <th className="bg-gray-700 text-white">Average Case</th>
                        <th className="bg-gray-700 text-white">Worst Case</th>
                        <th className="bg-gray-700 text-white">Space</th>
                        <th className="bg-gray-700 text-white">Requires Sorted Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={algorithm === 'linear' ? 'bg-blue-900' : ''}>
                        <td>Linear Search</td>
                        <td>O(1)</td>
                        <td>O(n)</td>
                        <td>O(n)</td>
                        <td>O(1)</td>
                        <td>No</td>
                      </tr>
                      <tr className={algorithm === 'binary' ? 'bg-blue-900' : ''}>
                        <td>Binary Search</td>
                        <td>O(1)</td>
                        <td>O(log n)</td>
                        <td>O(log n)</td>
                        <td>O(1)</td>
                        <td>Yes</td>
                      </tr>
                      <tr className={algorithm === 'jump' ? 'bg-blue-900' : ''}>
                        <td>Jump Search</td>
                        <td>O(1)</td>
                        <td>O(√n)</td>
                        <td>O(√n)</td>
                        <td>O(1)</td>
                        <td>Yes</td>
                      </tr>
                      <tr className={algorithm === 'interpolation' ? 'bg-blue-900' : ''}>
                        <td>Interpolation Search</td>
                        <td>O(1)</td>
                        <td>O(log log n)</td>
                        <td>O(n)</td>
                        <td>O(1)</td>
                        <td>Yes</td>
                      </tr>
                      <tr className={algorithm === 'exponential' ? 'bg-blue-900' : ''}>
                        <td>Exponential Search</td>
                        <td>O(1)</td>
                        <td>O(log n)</td>
                        <td>O(log n)</td>
                        <td>O(1)</td>
                        <td>Yes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Real-world Applications */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Real-world Applications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Database Systems</h5>
                      <p className="text-gray-300">Binary search used in B-tree indexes for efficient record retrieval.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Game Development</h5>
                      <p className="text-gray-300">Interpolation search used for sprite sheets and texture atlases.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Networking</h5>
                      <p className="text-gray-300">Jump search used in routing tables and IP address lookups.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">File Systems</h5>
                      <p className="text-gray-300">Exponential search used for finding file blocks in storage systems.</p>
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

export default SearchingVisualizer;