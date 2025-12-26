// components/visualizers/SortingVisualizer.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';

class ArrayElement {
  constructor(value, index) {
    this.value = value;
    this.index = index;
    this.id = `element-${index}-${value}`;
    this.state = 'default';
    this.height = value;
    this.color = '#3B82F6';
  }

  reset() {
    this.state = 'default';
    this.color = '#3B82F6';
  }
}

class SortingAlgorithms {
  static bubbleSort(array) {
    const steps = [];
    const arr = array.map(el => new ArrayElement(el.value, el.index));
    const n = arr.length;
    let swapped;

    steps.push({
      type: 'start',
      description: 'Starting Bubble Sort: Repeatedly swap adjacent elements if they are in wrong order',
      array: JSON.parse(JSON.stringify(arr))
    });

    for (let i = 0; i < n - 1; i++) {
      swapped = false;
      
      steps.push({
        type: 'pass',
        pass: i + 1,
        description: `Pass ${i + 1}: Comparing adjacent elements`,
        array: JSON.parse(JSON.stringify(arr))
      });

      for (let j = 0; j < n - i - 1; j++) {
        arr[j].state = 'comparing';
        arr[j + 1].state = 'comparing';
        
        steps.push({
          type: 'compare',
          indices: [j, j + 1],
          description: `Comparing arr[${j}] = ${arr[j].value} and arr[${j + 1}] = ${arr[j + 1].value}`,
          array: JSON.parse(JSON.stringify(arr))
        });

        if (arr[j].value > arr[j + 1].value) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;
          
          steps.push({
            type: 'swap',
            indices: [j, j + 1],
            description: `Swapping ${arr[j].value} and ${arr[j + 1].value}`,
            array: JSON.parse(JSON.stringify(arr))
          });
        } else {
          steps.push({
            type: 'no-swap',
            indices: [j, j + 1],
            description: `No swap needed - elements are in order`,
            array: JSON.parse(JSON.stringify(arr))
          });
        }

        arr[j].state = 'default';
        arr[j + 1].state = 'default';
      }

      arr[n - i - 1].state = 'sorted';
      
      steps.push({
        type: 'element-sorted',
        index: n - i - 1,
        description: `Element at index ${n - i - 1} is now in its final position`,
        array: JSON.parse(JSON.stringify(arr))
      });

      if (!swapped) {
        steps.push({
          type: 'early-exit',
          description: 'No swaps occurred in this pass - array is sorted!',
          array: JSON.parse(JSON.stringify(arr))
        });
        break;
      }
    }

    arr.forEach((el, idx) => {
      el.state = 'sorted';
    });

    steps.push({
      type: 'complete',
      description: 'Bubble Sort completed! Array is now sorted',
      array: JSON.parse(JSON.stringify(arr))
    });

    return { steps, sortedArray: arr };
  }

  static selectionSort(array) {
    const steps = [];
    const arr = array.map(el => new ArrayElement(el.value, el.index));
    const n = arr.length;

    steps.push({
      type: 'start',
      description: 'Starting Selection Sort: Find minimum element and place it at beginning',
      array: JSON.parse(JSON.stringify(arr))
    });

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      arr[minIndex].state = 'min';
      
      steps.push({
        type: 'new-min',
        index: i,
        description: `Starting from index ${i}, looking for minimum element`,
        array: JSON.parse(JSON.stringify(arr))
      });

      for (let j = i + 1; j < n; j++) {
        arr[j].state = 'comparing';
        
        steps.push({
          type: 'compare',
          indices: [minIndex, j],
          description: `Comparing current min (${arr[minIndex].value}) with arr[${j}] = ${arr[j].value}`,
          array: JSON.parse(JSON.stringify(arr))
        });

        if (arr[j].value < arr[minIndex].value) {
          if (minIndex !== i) arr[minIndex].state = 'default';
          minIndex = j;
          arr[minIndex].state = 'min';
          
          steps.push({
            type: 'new-min-found',
            index: j,
            description: `New minimum found: ${arr[j].value} at index ${j}`,
            array: JSON.parse(JSON.stringify(arr))
          });
        } else {
          arr[j].state = 'default';
          steps.push({
            type: 'no-swap',
            indices: [minIndex, j],
            description: `${arr[j].value} is not smaller than current min`,
            array: JSON.parse(JSON.stringify(arr))
          });
        }
      }

      if (minIndex !== i) {
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        
        steps.push({
          type: 'swap',
          indices: [i, minIndex],
          description: `Swapping ${arr[i].value} and ${arr[minIndex].value}`,
          array: JSON.parse(JSON.stringify(arr))
        });
      }

      arr[i].state = 'sorted';
      if (minIndex !== i && minIndex < n) arr[minIndex].state = 'default';
      
      steps.push({
        type: 'element-sorted',
        index: i,
        description: `Element ${arr[i].value} placed at its correct position ${i}`,
        array: JSON.parse(JSON.stringify(arr))
      });
    }

    arr[n - 1].state = 'sorted';
    
    steps.push({
      type: 'complete',
      description: 'Selection Sort completed! Array is now sorted',
      array: JSON.parse(JSON.stringify(arr))
    });

    return { steps, sortedArray: arr };
  }

  static insertionSort(array) {
    const steps = [];
    const arr = array.map(el => new ArrayElement(el.value, el.index));
    const n = arr.length;

    steps.push({
      type: 'start',
      description: 'Starting Insertion Sort: Build sorted array one element at a time',
      array: JSON.parse(JSON.stringify(arr))
    });

    arr[0].state = 'sorted';
    
    steps.push({
      type: 'element-sorted',
      index: 0,
      description: 'First element is already sorted',
      array: JSON.parse(JSON.stringify(arr))
    });

    for (let i = 1; i < n; i++) {
      let key = arr[i].value;
      let j = i - 1;
      arr[i].state = 'comparing';
      
      steps.push({
        type: 'key-selected',
        index: i,
        description: `Selecting element ${key} at index ${i} to insert into sorted portion`,
        array: JSON.parse(JSON.stringify(arr))
      });

      while (j >= 0 && arr[j].value > key) {
        arr[j].state = 'comparing';
        arr[j + 1].value = arr[j].value;
        arr[j + 1].state = 'swapping';
        
        steps.push({
          type: 'shift',
          from: j,
          to: j + 1,
          description: `Shifting element ${arr[j].value} from index ${j} to ${j + 1}`,
          array: JSON.parse(JSON.stringify(arr))
        });

        arr[j].state = 'default';
        j--;
      }

      arr[j + 1].value = key;
      arr[j + 1].state = 'sorted';
      
      steps.push({
        type: 'insert',
        index: j + 1,
        value: key,
        description: `Inserting ${key} at correct position ${j + 1}`,
        array: JSON.parse(JSON.stringify(arr))
      });
    }

    steps.push({
      type: 'complete',
      description: 'Insertion Sort completed! Array is now sorted',
      array: JSON.parse(JSON.stringify(arr))
    });

    return { steps, sortedArray: arr };
  }

  static mergeSort(array) {
    const steps = [];
    const arr = array.map(el => new ArrayElement(el.value, el.index));

    steps.push({
      type: 'start',
      description: 'Starting Merge Sort: Divide and conquer algorithm',
      array: JSON.parse(JSON.stringify(arr))
    });

    const merge = (left, right, startIndex) => {
      const merged = [];
      let i = 0, j = 0;

      steps.push({
        type: 'merge-start',
        left: left.map(el => el.value),
        right: right.map(el => el.value),
        description: `Merging two sorted subarrays: [${left.map(el => el.value)}] and [${right.map(el => el.value)}]`,
        array: JSON.parse(JSON.stringify(arr))
      });

      while (i < left.length && j < right.length) {
        left[i].state = 'comparing';
        right[j].state = 'comparing';
        
        steps.push({
          type: 'compare',
          indices: [startIndex + i, startIndex + left.length + j],
          description: `Comparing ${left[i].value} and ${right[j].value}`,
          array: JSON.parse(JSON.stringify(arr))
        });

        if (left[i].value <= right[j].value) {
          merged.push(left[i]);
          left[i].state = 'default';
          i++;
        } else {
          merged.push(right[j]);
          right[j].state = 'default';
          j++;
        }
      }

      while (i < left.length) {
        merged.push(left[i]);
        left[i].state = 'default';
        i++;
      }
      while (j < right.length) {
        merged.push(right[j]);
        right[j].state = 'default';
        j++;
      }

      merged.forEach((el, idx) => {
        el.state = 'sorted';
      });

      steps.push({
        type: 'merge-complete',
        merged: merged.map(el => el.value),
        description: `Merged subarray: [${merged.map(el => el.value)}]`,
        array: JSON.parse(JSON.stringify(arr))
      });

      return merged;
    };

    const sort = (arr, startIndex = 0) => {
      if (arr.length <= 1) {
        arr[0].state = 'sorted';
        return arr;
      }

      const mid = Math.floor(arr.length / 2);
      const left = arr.slice(0, mid);
      const right = arr.slice(mid);

      steps.push({
        type: 'split',
        left: left.map(el => el.value),
        right: right.map(el => el.value),
        description: `Splitting array at index ${mid}: [${left.map(el => el.value)}] | [${right.map(el => el.value)}]`,
        array: JSON.parse(JSON.stringify(arr))
      });

      return merge(
        sort(left, startIndex),
        sort(right, startIndex + mid),
        startIndex
      );
    };

    const sortedArray = sort(arr);
    
    steps.push({
      type: 'complete',
      description: 'Merge Sort completed! Array is now sorted',
      array: JSON.parse(JSON.stringify(arr))
    });

    return { steps, sortedArray };
  }

  static quickSort(array) {
    const steps = [];
    const arr = array.map(el => new ArrayElement(el.value, el.index));

    steps.push({
      type: 'start',
      description: 'Starting Quick Sort: Divide and conquer with pivot selection',
      array: JSON.parse(JSON.stringify(arr))
    });

    const partition = (low, high) => {
      const pivot = arr[high].value;
      arr[high].state = 'pivot';
      
      steps.push({
        type: 'pivot-select',
        index: high,
        value: pivot,
        description: `Selecting pivot: ${pivot} at index ${high}`,
        array: JSON.parse(JSON.stringify(arr))
      });

      let i = low - 1;

      for (let j = low; j < high; j++) {
        arr[j].state = 'comparing';
        
        steps.push({
          type: 'compare',
          indices: [j, high],
          description: `Comparing arr[${j}] = ${arr[j].value} with pivot ${pivot}`,
          array: JSON.parse(JSON.stringify(arr))
        });

        if (arr[j].value <= pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          
          if (i !== j) {
            steps.push({
              type: 'swap',
              indices: [i, j],
              description: `Swapping ${arr[j].value} and ${arr[i].value}`,
              array: JSON.parse(JSON.stringify(arr))
            });
          }
        }
        arr[j].state = 'default';
      }

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      arr[high].state = 'default';
      arr[i + 1].state = 'sorted';
      
      steps.push({
        type: 'pivot-place',
        index: i + 1,
        description: `Pivot ${pivot} placed at correct position ${i + 1}`,
        array: JSON.parse(JSON.stringify(arr))
      });

      return i + 1;
    };

    const sort = (low, high) => {
      if (low < high) {
        steps.push({
          type: 'partition-range',
          low,
          high,
          description: `Partitioning subarray from index ${low} to ${high}`,
          array: JSON.parse(JSON.stringify(arr))
        });

        const pi = partition(low, high);

        steps.push({
          type: 'recursive-call',
          left: [low, pi - 1],
          right: [pi + 1, high],
          description: `Recursively sorting left [${low}, ${pi - 1}] and right [${pi + 1}, ${high}] partitions`,
          array: JSON.parse(JSON.stringify(arr))
        });

        sort(low, pi - 1);
        sort(pi + 1, high);
      } else if (low === high) {
        arr[low].state = 'sorted';
        
        steps.push({
          type: 'element-sorted',
          index: low,
          description: `Single element at index ${low} is sorted`,
          array: JSON.parse(JSON.stringify(arr))
        });
      }
    };

    sort(0, arr.length - 1);
    
    steps.push({
      type: 'complete',
      description: 'Quick Sort completed! Array is now sorted',
      array: JSON.parse(JSON.stringify(arr))
    });

    return { steps, sortedArray: arr };
  }

  static heapSort(array) {
    const steps = [];
    const arr = array.map(el => new ArrayElement(el.value, el.index));
    const n = arr.length;

    steps.push({
      type: 'start',
      description: 'Starting Heap Sort: Build max heap and repeatedly extract maximum element',
      array: JSON.parse(JSON.stringify(arr))
    });

    const heapify = (n, i) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      arr[i].state = 'comparing';
      if (left < n) arr[left].state = 'comparing';
      if (right < n) arr[right].state = 'comparing';

      steps.push({
        type: 'heapify',
        root: i,
        left,
        right,
        description: `Heapifying node at index ${i} with children at ${left} and ${right}`,
        array: JSON.parse(JSON.stringify(arr))
      });

      if (left < n && arr[left].value > arr[largest].value) {
        largest = left;
      }

      if (right < n && arr[right].value > arr[largest].value) {
        largest = right;
      }

      if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        
        steps.push({
          type: 'swap',
          indices: [i, largest],
          description: `Swapping ${arr[largest].value} and ${arr[i].value} to maintain heap property`,
          array: JSON.parse(JSON.stringify(arr))
        });

        arr[i].state = 'default';
        if (left < n) arr[left].state = 'default';
        if (right < n) arr[right].state = 'default';

        heapify(n, largest);
      } else {
        arr[i].state = 'default';
        if (left < n) arr[left].state = 'default';
        if (right < n) arr[right].state = 'default';
      }
    };

    steps.push({
      type: 'build-heap',
      description: 'Building max heap from array',
      array: JSON.parse(JSON.stringify(arr))
    });

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    steps.push({
      type: 'extract-start',
      description: 'Extracting elements from heap in sorted order',
      array: JSON.parse(JSON.stringify(arr))
    });

    for (let i = n - 1; i > 0; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]];
      arr[i].state = 'sorted';
      
      steps.push({
        type: 'swap',
        indices: [0, i],
        description: `Moving current maximum from root to position ${i}`,
        array: JSON.parse(JSON.stringify(arr))
      });

      steps.push({
        type: 'element-sorted',
        index: i,
        description: `Element ${arr[i].value} placed at final position ${i}`,
        array: JSON.parse(JSON.stringify(arr))
      });

      heapify(i, 0);
    }

    arr[0].state = 'sorted';
    
    steps.push({
      type: 'complete',
      description: 'Heap Sort completed! Array is now sorted',
      array: JSON.parse(JSON.stringify(arr))
    });

    return { steps, sortedArray: arr };
  }
}

function SortingVisualizer() {
  const navigate = useNavigate();
  const [array, setArray] = useState([]);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [message, setMessage] = useState('Array generated. Select a sorting algorithm to begin.');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [steps, setSteps] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [arraySize, setArraySize] = useState(15);
  const [showComplexity, setShowComplexity] = useState(true);
  const [arrayType, setArrayType] = useState('random');
  
  const animationRef = useRef(null);
  const shouldStopRef = useRef(false);

  // Initialize array with proper height scaling
  const generateArray = useCallback(() => {
    const newArray = [];
    const maxHeight = 80; // Maximum height percentage for bars
    
    if (arrayType === 'random') {
      for (let i = 0; i < arraySize; i++) {
        const value = Math.floor(Math.random() * 95) + 5;
        newArray.push(new ArrayElement(value, i));
      }
    } else if (arrayType === 'nearly-sorted') {
      for (let i = 0; i < arraySize; i++) {
        const value = Math.floor((i * maxHeight) / arraySize) + 10;
        newArray.push(new ArrayElement(value, i));
      }
      // Shuffle slightly
      for (let i = 0; i < arraySize / 5; i++) {
        const idx1 = Math.floor(Math.random() * arraySize);
        const idx2 = Math.floor(Math.random() * arraySize);
        [newArray[idx1], newArray[idx2]] = [newArray[idx2], newArray[idx1]];
      }
    } else if (arrayType === 'reversed') {
      for (let i = 0; i < arraySize; i++) {
        const value = Math.floor(((arraySize - i - 1) * maxHeight) / arraySize) + 10;
        newArray.push(new ArrayElement(value, i));
      }
    } else if (arrayType === 'few-unique') {
      const values = [20, 40, 60, 80];
      for (let i = 0; i < arraySize; i++) {
        const value = values[Math.floor(Math.random() * values.length)];
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

  // Sort array
  const sortArray = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsPaused(false);
    setCurrentStep(0);
    shouldStopRef.current = false;

    let result;
    switch (algorithm) {
      case 'bubble':
        result = SortingAlgorithms.bubbleSort(array);
        break;
      case 'selection':
        result = SortingAlgorithms.selectionSort(array);
        break;
      case 'insertion':
        result = SortingAlgorithms.insertionSort(array);
        break;
      case 'merge':
        result = SortingAlgorithms.mergeSort(array);
        break;
      case 'quick':
        result = SortingAlgorithms.quickSort(array);
        break;
      case 'heap':
        result = SortingAlgorithms.heapSort(array);
        break;
      default:
        result = { steps: [], sortedArray: array };
    }

    setSteps(result.steps);
    setTotalSteps(result.steps.length);

    // Execute animations
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

      // Always update array from step data
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

    if (!shouldStopRef.current) {
      // Final update with sorted array
      if (result.sortedArray) {
        setArray(result.sortedArray.map((el, idx) => {
          const newEl = new ArrayElement(el.value, idx);
          newEl.state = 'sorted';
          return newEl;
        }));
      }
    }
    
    setIsAnimating(false);
    shouldStopRef.current = false;
  };

  // Get element color based on state
  const getElementColor = (element) => {
    switch (element.state) {
      case 'comparing':
        return '#F59E0B'; // Yellow
      case 'swapping':
        return '#EF4444'; // Red
      case 'sorted':
        return '#10B981'; // Green
      case 'pivot':
        return '#8B5CF6'; // Purple
      case 'min':
        return '#EC4899'; // Pink
      case 'max':
        return '#F97316'; // Orange
      default:
        return '#3B82F6'; // Blue
    }
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

  // Get algorithm complexity
  const getAlgorithmComplexity = () => {
    switch (algorithm) {
      case 'bubble':
        return { 
          time: {
            best: 'O(n)',
            average: 'O(n²)',
            worst: 'O(n²)'
          },
          space: 'O(1)',
          stable: 'Yes'
        };
      case 'selection':
        return { 
          time: {
            best: 'O(n²)',
            average: 'O(n²)',
            worst: 'O(n²)'
          },
          space: 'O(1)',
          stable: 'No'
        };
      case 'insertion':
        return { 
          time: {
            best: 'O(n)',
            average: 'O(n²)',
            worst: 'O(n²)'
          },
          space: 'O(1)',
          stable: 'Yes'
        };
      case 'merge':
        return { 
          time: {
            best: 'O(n log n)',
            average: 'O(n log n)',
            worst: 'O(n log n)'
          },
          space: 'O(n)',
          stable: 'Yes'
        };
      case 'quick':
        return { 
          time: {
            best: 'O(n log n)',
            average: 'O(n log n)',
            worst: 'O(n²)'
          },
          space: 'O(log n)',
          stable: 'No'
        };
      case 'heap':
        return { 
          time: {
            best: 'O(n log n)',
            average: 'O(n log n)',
            worst: 'O(n log n)'
          },
          space: 'O(1)',
          stable: 'No'
        };
      default:
        return { 
          time: { best: '', average: '', worst: '' },
          space: '',
          stable: ''
        };
    }
  };

  // Get algorithm description
  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case 'bubble':
        return 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.';
      case 'selection':
        return 'Divides the input list into two parts: sorted and unsorted. Repeatedly selects the smallest element from unsorted portion.';
      case 'insertion':
        return 'Builds the final sorted array one item at a time by inserting each element into its proper position.';
      case 'merge':
        return 'Divide and conquer algorithm that divides the array into halves, sorts them, and then merges the sorted halves.';
      case 'quick':
        return 'Divide and conquer algorithm that picks an element as pivot and partitions the array around the pivot.';
      case 'heap':
        return 'Comparison-based algorithm that uses a binary heap data structure to sort elements.';
      default:
        return 'Select a sorting algorithm to see its description.';
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
          <h1 className="text-4xl font-bold text-white mb-2">Sorting Algorithm Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize how different sorting algorithms work with step-by-step animations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Algorithm Selection */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Sorting Algorithms</h3>
                
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
                    <option value="bubble">Bubble Sort</option>
                    <option value="selection">Selection Sort</option>
                    <option value="insertion">Insertion Sort</option>
                    <option value="merge">Merge Sort</option>
                    <option value="quick">Quick Sort</option>
                    <option value="heap">Heap Sort</option>
                  </select>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    className="btn btn-primary flex-1"
                    onClick={sortArray}
                    disabled={isAnimating}
                  >
                    {isAnimating ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      `Run ${algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Sort`
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
                    <option value="random">Random</option>
                    <option value="nearly-sorted">Nearly Sorted</option>
                    <option value="reversed">Reversed</option>
                    <option value="few-unique">Few Unique</option>
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
                <h3 className="card-title text-white">Sorting Status</h3>
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
              </div>
            </div>

            {/* Algorithm Complexity */}
            {showComplexity && (
              <div className="card bg-gray-800 shadow-lg border border-gray-700">
                <div className="card-body">
                  <h3 className="card-title text-white">Time Complexity</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Best Case:</span>
                      <span className="font-bold text-green-400">{complexity.time.best}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Case:</span>
                      <span className="font-bold text-yellow-400">{complexity.time.average}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worst Case:</span>
                      <span className="font-bold text-red-400">{complexity.time.worst}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Space Complexity:</span>
                      <span className="font-bold text-blue-400">{complexity.space}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stable:</span>
                      <span className={`font-bold ${complexity.stable === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
                        {complexity.stable}
                      </span>
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
                    <span className="text-gray-300">Comparing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-300">Swapping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-300">Sorted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-gray-300">Pivot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-500 rounded"></div>
                    <span className="text-gray-300">Minimum</span>
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
                    {algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Sort Visualization
                  </h3>
                  <div className="text-sm text-gray-400">
                    {isAnimating ? `Step ${currentStep} of ${totalSteps}` : 'Ready to sort'}
                  </div>
                </div>

                {/* Array Visualization */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-96">
                  <div className="flex items-end justify-center gap-1 h-80" style={{ minHeight: '320px' }}>
                    {array.map((element) => (
                      <div
                        key={element.id}
                        className="flex flex-col items-center transition-all duration-300 ease-in-out"
                        style={{ 
                          width: `${Math.max(80 / arraySize, 2)}%`,
                          minWidth: '8px'
                        }}
                      >
                        <div
                          className="w-full rounded-t transition-all duration-300 border border-gray-800 border-b-0"
                          style={{
                            height: `${element.value}%`,
                            backgroundColor: getElementColor(element),
                            minHeight: `${element.value*3}px`,
                            transition: 'all 0.3s ease-in-out'
                          }}
                        ></div>
                        <div className="mt-1 text-xs text-gray-400 font-mono">
                          {element.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Algorithm Information */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Algorithm Process</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">How It Works</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {algorithm === 'bubble' && (
                          <>
                            <li>• Repeatedly compares adjacent elements</li>
                            <li>• Swaps them if they are in wrong order</li>
                            <li>• Largest elements "bubble up" to the end</li>
                            <li>• Can stop early if no swaps occur</li>
                          </>
                        )}
                        {algorithm === 'selection' && (
                          <>
                            <li>• Finds minimum element in unsorted portion</li>
                            <li>• Swaps it with first unsorted element</li>
                            <li>• Grows sorted portion from left to right</li>
                            <li>• Always makes O(n) swaps</li>
                          </>
                        )}
                        {algorithm === 'insertion' && (
                          <>
                            <li>• Builds sorted array one element at a time</li>
                            <li>• Takes each element and inserts in correct position</li>
                            <li>• Efficient for small or nearly sorted arrays</li>
                            <li>• Stable sorting algorithm</li>
                          </>
                        )}
                        {algorithm === 'merge' && (
                          <>
                            <li>• Divides array into two halves recursively</li>
                            <li>• Sorts each half separately</li>
                            <li>• Merges sorted halves back together</li>
                            <li>• Guaranteed O(n log n) performance</li>
                          </>
                        )}
                        {algorithm === 'quick' && (
                          <>
                            <li>• Chooses a pivot element</li>
                            <li>• Partitions array around the pivot</li>
                            <li>• Recursively sorts left and right partitions</li>
                            <li>• Efficient in practice, O(n²) worst case</li>
                          </>
                        )}
                        {algorithm === 'heap' && (
                          <>
                            <li>• Builds a max heap from the array</li>
                            <li>• Repeatedly extracts maximum element</li>
                            <li>• Places it at the end of array</li>
                            <li>• Maintains heap property after extraction</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">When to Use</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {algorithm === 'bubble' && (
                          <>
                            <li>• Educational purposes</li>
                            <li>• Small datasets</li>
                            <li>• When simplicity is more important than efficiency</li>
                            <li>• Nearly sorted data</li>
                          </>
                        )}
                        {algorithm === 'selection' && (
                          <>
                            <li>• When memory write is costly</li>
                            <li>• Small datasets</li>
                            <li>• When simplicity is preferred</li>
                            <li>• When auxiliary memory is limited</li>
                          </>
                        )}
                        {algorithm === 'insertion' && (
                          <>
                            <li>• Small datasets</li>
                            <li>• Nearly sorted data</li>
                            <li>• Online sorting (streaming data)</li>
                            <li>• Stable sort requirement</li>
                          </>
                        )}
                        {algorithm === 'merge' && (
                          <>
                            <li>• Large datasets</li>
                            <li>• When worst-case performance matters</li>
                            <li>• Stable sort requirement</li>
                            <li>• External sorting (data doesn't fit in memory)</li>
                          </>
                        )}
                        {algorithm === 'quick' && (
                          <>
                            <li>• General-purpose sorting</li>
                            <li>• When average-case performance matters</li>
                            <li>• In-place sorting preferred</li>
                            <li>• Cache-friendly implementations</li>
                          </>
                        )}
                        {algorithm === 'heap' && (
                          <>
                            <li>• When worst-case O(n log n) is needed</li>
                            <li>• In-place sorting required</li>
                            <li>• Priority queue implementations</li>
                            <li>• External sorting scenarios</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison and Applications */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Sorting Algorithms Comparison</h3>
                
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th className="bg-gray-700 text-white">Algorithm</th>
                        <th className="bg-gray-700 text-white">Best Case</th>
                        <th className="bg-gray-700 text-white">Average Case</th>
                        <th className="bg-gray-700 text-white">Worst Case</th>
                        <th className="bg-gray-700 text-white">Space</th>
                        <th className="bg-gray-700 text-white">Stable</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={algorithm === 'bubble' ? 'bg-blue-900' : ''}>
                        <td>Bubble Sort</td>
                        <td>O(n)</td>
                        <td>O(n²)</td>
                        <td>O(n²)</td>
                        <td>O(1)</td>
                        <td>Yes</td>
                      </tr>
                      <tr className={algorithm === 'selection' ? 'bg-blue-900' : ''}>
                        <td>Selection Sort</td>
                        <td>O(n²)</td>
                        <td>O(n²)</td>
                        <td>O(n²)</td>
                        <td>O(1)</td>
                        <td>No</td>
                      </tr>
                      <tr className={algorithm === 'insertion' ? 'bg-blue-900' : ''}>
                        <td>Insertion Sort</td>
                        <td>O(n)</td>
                        <td>O(n²)</td>
                        <td>O(n²)</td>
                        <td>O(1)</td>
                        <td>Yes</td>
                      </tr>
                      <tr className={algorithm === 'merge' ? 'bg-blue-900' : ''}>
                        <td>Merge Sort</td>
                        <td>O(n log n)</td>
                        <td>O(n log n)</td>
                        <td>O(n log n)</td>
                        <td>O(n)</td>
                        <td>Yes</td>
                      </tr>
                      <tr className={algorithm === 'quick' ? 'bg-blue-900' : ''}>
                        <td>Quick Sort</td>
                        <td>O(n log n)</td>
                        <td>O(n log n)</td>
                        <td>O(n²)</td>
                        <td>O(log n)</td>
                        <td>No</td>
                      </tr>
                      <tr className={algorithm === 'heap' ? 'bg-blue-900' : ''}>
                        <td>Heap Sort</td>
                        <td>O(n log n)</td>
                        <td>O(n log n)</td>
                        <td>O(n log n)</td>
                        <td>O(1)</td>
                        <td>No</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Real-world Applications */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Real-world Applications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Database Systems</h5>
                      <p className="text-gray-300">Quick Sort and Merge Sort used for query optimization and index creation.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Operating Systems</h5>
                      <p className="text-gray-300">Process scheduling, file system organization using various sorting algorithms.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">E-commerce</h5>
                      <p className="text-gray-300">Product ranking, price sorting, and recommendation systems.</p>
                    </div>
                  </div>
                </div>

                {/* Optimization Techniques */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Optimization Techniques</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-green-400 mb-2">Hybrid Algorithms</h5>
                      <p className="text-gray-300">TimSort (Merge + Insertion), IntroSort (Quick + Heap) combine strengths of multiple algorithms.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-green-400 mb-2">Parallel Sorting</h5>
                      <p className="text-gray-300">Bitonic Sort, Sample Sort for multi-core processors and distributed systems.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Algorithm Details */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Algorithm Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-2">Key Characteristics</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• {getAlgorithmDescription()}</li>
                      <li>• Space Complexity: {complexity.space}</li>
                      <li>• Stable: {complexity.stable}</li>
                      <li>• In-place: {complexity.space === 'O(1)' ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Performance Tips</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Choose algorithm based on data characteristics</li>
                      <li>• Consider memory constraints</li>
                      <li>• Use hybrid algorithms for real-world applications</li>
                      <li>• Prefer stable sorts when order matters</li>
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

export default SortingVisualizer;