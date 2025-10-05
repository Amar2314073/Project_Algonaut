// components/visualizers/RecursionVisualizer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

class RecursionCall {
  constructor(functionName, parameters, returnValue = null, depth = 0, parent = null) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.functionName = functionName;
    this.parameters = parameters;
    this.returnValue = returnValue;
    this.depth = depth;
    this.parent = parent;
    this.children = [];
    this.state = 'pending'; // 'pending', 'active', 'completed', 'base-case'
    this.stepDescription = '';
    this.isBaseCase = false;
    this.isRecursiveCase = false;
    this.startTime = null;
    this.endTime = null;
  }

  getDescription() {
    if (this.isBaseCase) {
      return `Base case: ${this.functionName}(${this.parameters.join(', ')}) = ${this.returnValue}`;
    }
    if (this.returnValue !== null) {
      return `${this.functionName}(${this.parameters.join(', ')}) = ${this.returnValue}`;
    }
    return `${this.functionName}(${this.parameters.join(', ')})`;
  }
}

class RecursionAlgorithms {
  static factorial(n) {
    const steps = [];
    const rootCall = new RecursionCall('factorial', [n]);
    steps.push({
      type: 'call',
      call: rootCall,
      description: `Computing factorial(${n})`
    });

    const compute = (n, parent, depth) => {
      const call = new RecursionCall('factorial', [n], null, depth, parent);
      parent.children.push(call);

      steps.push({
        type: 'call',
        call: call,
        description: `Calling factorial(${n})`
      });

      // Base case
      if (n === 0 || n === 1) {
        call.isBaseCase = true;
        call.returnValue = 1;
        call.state = 'base-case';
        
        steps.push({
          type: 'base-case',
          call: call,
          description: `Base case: factorial(${n}) = 1`
        });

        steps.push({
          type: 'return',
          call: call,
          description: `Returning from base case: 1`
        });

        return 1;
      }

      // Recursive case
      call.isRecursiveCase = true;
      call.state = 'active';

      steps.push({
        type: 'recursive-call',
        call: call,
        description: `Recursive case: factorial(${n}) = ${n} × factorial(${n-1})`
      });

      const result = n * compute(n - 1, call, depth + 1);
      call.returnValue = result;
      call.state = 'completed';

      steps.push({
        type: 'return',
        call: call,
        description: `Returning factorial(${n}) = ${n} × ${call.children[0].returnValue} = ${result}`
      });

      return result;
    };

    const result = compute(n, rootCall, 1);
    rootCall.returnValue = result;
    rootCall.state = 'completed';

    steps.push({
      type: 'final-result',
      call: rootCall,
      description: `Final result: factorial(${n}) = ${result}`
    });

    return { steps, result, callTree: rootCall };
  }

  static fibonacci(n) {
    const steps = [];
    const rootCall = new RecursionCall('fibonacci', [n]);
    steps.push({
      type: 'call',
      call: rootCall,
      description: `Computing fibonacci(${n})`
    });

    const compute = (n, parent, depth) => {
      const call = new RecursionCall('fibonacci', [n], null, depth, parent);
      parent.children.push(call);

      steps.push({
        type: 'call',
        call: call,
        description: `Calling fibonacci(${n})`
      });

      // Base cases
      if (n === 0) {
        call.isBaseCase = true;
        call.returnValue = 0;
        call.state = 'base-case';
        
        steps.push({
          type: 'base-case',
          call: call,
          description: `Base case: fibonacci(0) = 0`
        });

        steps.push({
          type: 'return',
          call: call,
          description: `Returning from base case: 0`
        });

        return 0;
      }

      if (n === 1) {
        call.isBaseCase = true;
        call.returnValue = 1;
        call.state = 'base-case';
        
        steps.push({
          type: 'base-case',
          call: call,
          description: `Base case: fibonacci(1) = 1`
        });

        steps.push({
          type: 'return',
          call: call,
          description: `Returning from base case: 1`
        });

        return 1;
      }

      // Recursive case
      call.isRecursiveCase = true;
      call.state = 'active';

      steps.push({
        type: 'recursive-call',
        call: call,
        description: `Recursive case: fibonacci(${n}) = fibonacci(${n-1}) + fibonacci(${n-2})`
      });

      steps.push({
        type: 'left-call',
        call: call,
        description: `Computing left branch: fibonacci(${n-1})`
      });

      const leftResult = compute(n - 1, call, depth + 1);

      steps.push({
        type: 'right-call',
        call: call,
        description: `Computing right branch: fibonacci(${n-2})`
      });

      const rightResult = compute(n - 2, call, depth + 1);

      const result = leftResult + rightResult;
      call.returnValue = result;
      call.state = 'completed';

      steps.push({
        type: 'return',
        call: call,
        description: `Returning fibonacci(${n}) = ${leftResult} + ${rightResult} = ${result}`
      });

      return result;
    };

    const result = compute(n, rootCall, 1);
    rootCall.returnValue = result;
    rootCall.state = 'completed';

    steps.push({
      type: 'final-result',
      call: rootCall,
      description: `Final result: fibonacci(${n}) = ${result}`
    });

    return { steps, result, callTree: rootCall };
  }

  static towerOfHanoi(n, fromRod = 'A', toRod = 'C', auxRod = 'B') {
    const steps = [];
    const rootCall = new RecursionCall('hanoi', [n, fromRod, toRod, auxRod]);
    steps.push({
      type: 'call',
      call: rootCall,
      description: `Solving Tower of Hanoi for ${n} disks from ${fromRod} to ${toRod}`
    });

    const compute = (n, from, to, aux, parent, depth) => {
      const call = new RecursionCall('hanoi', [n, from, to, aux], null, depth, parent);
      parent.children.push(call);

      steps.push({
        type: 'call',
        call: call,
        description: `hanoi(${n}, ${from}, ${to}, ${aux})`
      });

      // Base case
      if (n === 1) {
        call.isBaseCase = true;
        call.returnValue = [[from, to]];
        call.state = 'base-case';
        
        steps.push({
          type: 'base-case',
          call: call,
          description: `Base case: Move disk 1 from ${from} to ${to}`
        });

        steps.push({
          type: 'move',
          call: call,
          from,
          to,
          disk: 1,
          description: `Moving disk 1 from ${from} to ${to}`
        });

        steps.push({
          type: 'return',
          call: call,
          description: `Returning single move`
        });

        return [[from, to]];
      }

      // Recursive case
      call.isRecursiveCase = true;
      call.state = 'active';

      steps.push({
        type: 'recursive-call',
        call: call,
        description: `Recursive case: Move ${n-1} disks from ${from} to ${aux}, then move disk ${n} to ${to}, then move ${n-1} disks from ${aux} to ${to}`
      });

      // Move n-1 disks from source to auxiliary
      steps.push({
        type: 'first-recursive',
        call: call,
        description: `Step 1: Move ${n-1} disks from ${from} to ${aux} (using ${to} as auxiliary)`
      });

      const moves1 = compute(n - 1, from, aux, to, call, depth + 1);

      // Move nth disk from source to destination
      steps.push({
        type: 'move',
        call: call,
        from,
        to,
        disk: n,
        description: `Step 2: Move disk ${n} from ${from} to ${to}`
      });

      const currentMove = [[from, to]];

      // Move n-1 disks from auxiliary to destination
      steps.push({
        type: 'second-recursive',
        call: call,
        description: `Step 3: Move ${n-1} disks from ${aux} to ${to} (using ${from} as auxiliary)`
      });

      const moves2 = compute(n - 1, aux, to, from, call, depth + 1);

      const result = [...moves1, ...currentMove, ...moves2];
      call.returnValue = result;
      call.state = 'completed';

      steps.push({
        type: 'return',
        call: call,
        description: `Returning ${result.length} moves for hanoi(${n}, ${from}, ${to}, ${aux})`
      });

      return result;
    };

    const result = compute(n, fromRod, toRod, auxRod, rootCall, 1);
    rootCall.returnValue = result;
    rootCall.state = 'completed';

    steps.push({
      type: 'final-result',
      call: rootCall,
      description: `Solved Tower of Hanoi in ${result.length} moves`
    });

    return { steps, result, callTree: rootCall };
  }

  static binarySearch(arr, target, low = 0, high = null) {
    const steps = [];
    high = high === null ? arr.length - 1 : high;
    const rootCall = new RecursionCall('binarySearch', [arr, target, low, high]);
    
    steps.push({
      type: 'call',
      call: rootCall,
      description: `Searching for ${target} in array [${arr.join(', ')}] from index ${low} to ${high}`
    });

    const compute = (arr, target, low, high, parent, depth) => {
      const call = new RecursionCall('binarySearch', [arr, target, low, high], null, depth, parent);
      parent.children.push(call);

      steps.push({
        type: 'call',
        call: call,
        description: `binarySearch(arr, ${target}, ${low}, ${high})`
      });

      // Base case: element not found
      if (low > high) {
        call.isBaseCase = true;
        call.returnValue = -1;
        call.state = 'base-case';
        
        steps.push({
          type: 'base-case',
          call: call,
          description: `Base case: low (${low}) > high (${high}) - element not found`
        });

        steps.push({
          type: 'return',
          call: call,
          description: `Returning -1 (not found)`
        });

        return -1;
      }

      const mid = Math.floor((low + high) / 2);
      const midValue = arr[mid];

      steps.push({
        type: 'calculate-mid',
        call: call,
        mid,
        midValue,
        description: `Calculating mid = floor((${low} + ${high}) / 2) = ${mid}, arr[${mid}] = ${midValue}`
      });

      // Base case: element found
      if (midValue === target) {
        call.isBaseCase = true;
        call.returnValue = mid;
        call.state = 'base-case';
        
        steps.push({
          type: 'base-case',
          call: call,
          description: `Base case: Found ${target} at index ${mid}!`
        });

        steps.push({
          type: 'return',
          call: call,
          description: `Returning index ${mid}`
        });

        return mid;
      }

      // Recursive cases
      call.isRecursiveCase = true;
      call.state = 'active';

      if (target < midValue) {
        steps.push({
          type: 'recursive-call',
          call: call,
          description: `${target} < ${midValue}, searching left half [${low}, ${mid-1}]`
        });

        const result = compute(arr, target, low, mid - 1, call, depth + 1);
        call.returnValue = result;
        call.state = 'completed';

        steps.push({
          type: 'return',
          call: call,
          description: `Returning result from left search: ${result}`
        });

        return result;
      } else {
        steps.push({
          type: 'recursive-call',
          call: call,
          description: `${target} > ${midValue}, searching right half [${mid+1}, ${high}]`
        });

        const result = compute(arr, target, mid + 1, high, call, depth + 1);
        call.returnValue = result;
        call.state = 'completed';

        steps.push({
          type: 'return',
          call: call,
          description: `Returning result from right search: ${result}`
        });

        return result;
      }
    };

    const result = compute(arr, target, low, high, rootCall, 1);
    rootCall.returnValue = result;
    rootCall.state = 'completed';

    if (result === -1) {
      steps.push({
        type: 'final-result',
        call: rootCall,
        description: `Element ${target} not found in array`
      });
    } else {
      steps.push({
        type: 'final-result',
        call: rootCall,
        description: `Found ${target} at index ${result}`
      });
    }

    return { steps, result, callTree: rootCall };
  }

  static power(base, exponent) {
    const steps = [];
    const rootCall = new RecursionCall('power', [base, exponent]);
    steps.push({
      type: 'call',
      call: rootCall,
      description: `Computing ${base}^${exponent}`
    });

    const compute = (base, exponent, parent, depth) => {
      const call = new RecursionCall('power', [base, exponent], null, depth, parent);
      parent.children.push(call);

      steps.push({
        type: 'call',
        call: call,
        description: `power(${base}, ${exponent})`
      });

      // Base cases
      if (exponent === 0) {
        call.isBaseCase = true;
        call.returnValue = 1;
        call.state = 'base-case';
        
        steps.push({
          type: 'base-case',
          call: call,
          description: `Base case: ${base}^0 = 1`
        });

        steps.push({
          type: 'return',
          call: call,
          description: `Returning 1`
        });

        return 1;
      }

      if (exponent === 1) {
        call.isBaseCase = true;
        call.returnValue = base;
        call.state = 'base-case';
        
        steps.push({
          type: 'base-case',
          call: call,
          description: `Base case: ${base}^1 = ${base}`
        });

        steps.push({
          type: 'return',
          call: call,
          description: `Returning ${base}`
        });

        return base;
      }

      // Recursive case
      call.isRecursiveCase = true;
      call.state = 'active';

      steps.push({
        type: 'recursive-call',
        call: call,
        description: `Recursive case: ${base}^${exponent} = ${base} × ${base}^${exponent-1}`
      });

      const result = base * compute(base, exponent - 1, call, depth + 1);
      call.returnValue = result;
      call.state = 'completed';

      steps.push({
        type: 'return',
        call: call,
        description: `Returning ${base}^${exponent} = ${base} × ${call.children[0].returnValue} = ${result}`
      });

      return result;
    };

    const result = compute(base, exponent, rootCall, 1);
    rootCall.returnValue = result;
    rootCall.state = 'completed';

    steps.push({
      type: 'final-result',
      call: rootCall,
      description: `Final result: ${base}^${exponent} = ${result}`
    });

    return { steps, result, callTree: rootCall };
  }
}

function RecursionVisualizer() {
  const navigate = useNavigate();
  const [algorithm, setAlgorithm] = useState('factorial');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(300);
  const [message, setMessage] = useState('Select a recursive algorithm to visualize.');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showCallStack, setShowCallStack] = useState(true);
  const [callTree, setCallTree] = useState(null);
  const [activeCalls, setActiveCalls] = useState(new Set());

  // Algorithm-specific states
  const [factorialN, setFactorialN] = useState(5);
  const [fibonacciN, setFibonacciN] = useState(5);
  const [hanoiDisks, setHanoiDisks] = useState(3);
  const [binarySearchArray, setBinarySearchArray] = useState('1,3,5,7,9,11,13,15');
  const [binarySearchTarget, setBinarySearchTarget] = useState(7);
  const [powerBase, setPowerBase] = useState(2);
  const [powerExponent, setPowerExponent] = useState(4);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Solve problem
  const solveProblem = async () => {
    setIsAnimating(true);
    setIsPaused(false);
    setCurrentStep(0);
    setResult(null);
    setSteps([]);
    setCallTree(null);
    setActiveCalls(new Set());

    let solution;
    switch (algorithm) {
      case 'factorial':
        solution = RecursionAlgorithms.factorial(factorialN);
        break;
      case 'fibonacci':
        solution = RecursionAlgorithms.fibonacci(fibonacciN);
        break;
      case 'hanoi':
        solution = RecursionAlgorithms.towerOfHanoi(hanoiDisks);
        break;
      case 'binary-search':
        const arr = binarySearchArray.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
        solution = RecursionAlgorithms.binarySearch(arr, parseInt(binarySearchTarget));
        break;
      case 'power':
        solution = RecursionAlgorithms.power(powerBase, powerExponent);
        break;
      default:
        solution = { steps: [], result: null, callTree: null };
    }

    setSteps(solution.steps);
    setResult(solution.result);
    setCallTree(solution.callTree);
    setTotalSteps(solution.steps.length);

    // Execute animations
    const currentActiveCalls = new Set();
    
    for (let i = 0; i < solution.steps.length; i++) {
      if (isPaused) {
        while (isPaused) {
          await sleep(100);
        }
      }

      const step = solution.steps[i];
      setCurrentStep(i + 1);
      setMessage(step.description);

      // Update active calls based on step type
      switch (step.type) {
        case 'call':
          currentActiveCalls.add(step.call.id);
          break;
        case 'return':
        case 'final-result':
          currentActiveCalls.delete(step.call.id);
          break;
        case 'base-case':
          // Keep it active until return
          break;
      }

      setActiveCalls(new Set(currentActiveCalls));
      await sleep(animationSpeed);
    }

    setMessage(`Final result: ${solution.result}`);
    setIsAnimating(false);
  };

  // Get algorithm description
  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case 'factorial':
        return 'Compute factorial using recursion: n! = n × (n-1)! with base case 0! = 1';
      case 'fibonacci':
        return 'Compute Fibonacci sequence: F(n) = F(n-1) + F(n-2) with base cases F(0)=0, F(1)=1';
      case 'hanoi':
        return 'Solve Tower of Hanoi puzzle by moving disks between rods using recursion';
      case 'binary-search':
        return 'Search sorted array by repeatedly dividing search interval in half';
      case 'power':
        return 'Compute power using recursion: base^exp = base × base^(exp-1) with base case base^0=1';
      default:
        return 'Select a recursive algorithm to see its description.';
    }
  };

  // Get algorithm complexity
  const getAlgorithmComplexity = () => {
    switch (algorithm) {
      case 'factorial':
        return { time: 'O(n)', space: 'O(n)', description: 'Linear time and space due to recursion depth' };
      case 'fibonacci':
        return { time: 'O(2^n)', space: 'O(n)', description: 'Exponential time due to repeated calculations' };
      case 'hanoi':
        return { time: 'O(2^n)', space: 'O(n)', description: 'Exponential time, linear space for recursion' };
      case 'binary-search':
        return { time: 'O(log n)', space: 'O(log n)', description: 'Logarithmic time and space' };
      case 'power':
        return { time: 'O(n)', space: 'O(n)', description: 'Linear time and space' };
      default:
        return { time: 'O(1)', space: 'O(1)', description: '' };
    }
  };

  // Render algorithm-specific controls
  const renderAlgorithmControls = () => {
    switch (algorithm) {
      case 'factorial':
        return (
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300">Number (n)</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="10" 
              value={factorialN}
              onChange={(e) => setFactorialN(parseInt(e.target.value))}
              className="range range-primary"
              disabled={isAnimating}
            />
            <div className="text-center text-sm text-gray-400">
              Compute {factorialN}!
            </div>
          </div>
        );
      
      case 'fibonacci':
        return (
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300">Fibonacci Number (n)</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="10" 
              value={fibonacciN}
              onChange={(e) => setFibonacciN(parseInt(e.target.value))}
              className="range range-primary"
              disabled={isAnimating}
            />
            <div className="text-center text-sm text-gray-400">
              Compute F({fibonacciN})
            </div>
          </div>
        );
      
      case 'hanoi':
        return (
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300">Number of Disks</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="6" 
              value={hanoiDisks}
              onChange={(e) => setHanoiDisks(parseInt(e.target.value))}
              className="range range-primary"
              disabled={isAnimating}
            />
            <div className="text-center text-sm text-gray-400">
              {hanoiDisks} disks
            </div>
          </div>
        );
      
      case 'binary-search':
        return (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Sorted Array (comma-separated)</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered bg-gray-700 text-white"
                value={binarySearchArray}
                onChange={(e) => setBinarySearchArray(e.target.value)}
                placeholder="e.g., 1,3,5,7,9"
                disabled={isAnimating}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Target Number</span>
              </label>
              <input 
                type="number" 
                className="input input-bordered bg-gray-700 text-white"
                value={binarySearchTarget}
                onChange={(e) => setBinarySearchTarget(parseInt(e.target.value))}
                disabled={isAnimating}
              />
            </div>
          </>
        );
      
      case 'power':
        return (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Base</span>
              </label>
              <input 
                type="number" 
                className="input input-bordered bg-gray-700 text-white"
                value={powerBase}
                onChange={(e) => setPowerBase(parseInt(e.target.value))}
                disabled={isAnimating}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Exponent</span>
              </label>
              <input 
                type="number" 
                className="input input-bordered bg-gray-700 text-white"
                value={powerExponent}
                onChange={(e) => setPowerExponent(parseInt(e.target.value))}
                disabled={isAnimating}
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  // Render call stack visualization
  const renderCallStack = () => {
    if (!showCallStack || !steps.length) return null;

    const currentStepData = steps[Math.min(currentStep - 1, steps.length - 1)];
    if (!currentStepData) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-4 mt-4">
        <h4 className="font-bold text-white mb-3">Call Stack</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {Array.from(activeCalls).map(callId => {
            const step = steps.find(s => s.call && s.call.id === callId);
            if (!step) return null;
            
            return (
              <div
                key={callId}
                className="p-2 rounded border border-gray-600 bg-gray-700 text-sm"
              >
                <div className="font-mono text-blue-300">
                  {step.call.functionName}({step.call.parameters.join(', ')})
                </div>
                <div className="text-gray-400 text-xs">
                  Depth: {step.call.depth} • State: {step.call.state}
                </div>
              </div>
            );
          })}
          {activeCalls.size === 0 && (
            <div className="text-gray-500 text-center py-4">
              Call stack is empty
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render recursive call tree
  const renderCallTree = (node, level = 0) => {
    if (!node) return null;

    const isActive = activeCalls.has(node.id);
    const borderColor = isActive ? 'border-yellow-400' : 
                       node.state === 'base-case' ? 'border-green-400' : 
                       node.state === 'completed' ? 'border-blue-400' : 'border-gray-600';

    return (
      <div className="ml-4 border-l-2 border-gray-600 pl-4">
        <div className={`p-3 rounded-lg border-2 ${borderColor} bg-gray-800 mb-2 transition-all duration-300`}>
          <div className="font-mono text-sm">
            <span className="text-white">{node.functionName}</span>
            <span className="text-yellow-300">({node.parameters.join(', ')})</span>
            {node.returnValue !== null && (
              <span className="text-green-400"> = {node.returnValue}</span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Depth: {level} • {node.state === 'base-case' ? 'Base Case' : 
                            node.state === 'completed' ? 'Completed' : 
                            node.state === 'active' ? 'Active' : 'Pending'}
          </div>
        </div>
        <div className="space-y-1">
          {node.children.map(child => renderCallTree(child, level + 1))}
        </div>
      </div>
    );
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
          <h1 className="text-4xl font-bold text-white mb-2">Recursion Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize recursive function calls, call stack, and recursion trees</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Algorithm Selection */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Recursive Algorithms</h3>
                
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
                    <option value="factorial">Factorial</option>
                    <option value="fibonacci">Fibonacci</option>
                    <option value="hanoi">Tower of Hanoi</option>
                    <option value="binary-search">Binary Search</option>
                    <option value="power">Power Function</option>
                  </select>
                </div>

                {renderAlgorithmControls()}

                <div className="form-control mt-4">
                  <button 
                    className="btn btn-primary"
                    onClick={solveProblem}
                    disabled={isAnimating}
                  >
                    {isAnimating ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      `Visualize ${algorithm.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`
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
                    min="100" 
                    max="1000" 
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                    className="range range-primary"
                    disabled={isAnimating}
                  />
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text text-gray-300">Show Call Stack</span>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary"
                      checked={showCallStack}
                      onChange={(e) => setShowCallStack(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Recursion Status</h3>
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

                {result !== null && (
                  <div className="mt-4 p-3 rounded-lg bg-gray-700">
                    <div className="text-lg font-bold text-green-400">
                      Result: {result}
                    </div>
                    {algorithm === 'hanoi' && Array.isArray(result) && (
                      <div className="text-sm text-gray-300 mt-1">
                        Total moves: {result.length}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recursion Concept Explanation */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Recursion Principles</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <p><strong>Base Case:</strong> The condition that stops the recursion.</p>
                  <p><strong>Recursive Case:</strong> The part that calls the function itself.</p>
                  <p><strong>Call Stack:</strong> Where function calls are stored during execution.</p>
                  <p><strong>Stack Overflow:</strong> Occurs when recursion depth is too large.</p>
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Time Complexity</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-bold text-yellow-400">{complexity.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Space:</span>
                    <span className="font-bold text-blue-400">{complexity.space}</span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {complexity.description}
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
                    {algorithm.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')} Recursion Visualization
                  </h3>
                  <div className="text-sm text-gray-400">
                    {getAlgorithmDescription()}
                  </div>
                </div>

                {/* Recursion Tree Visualization */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-96">
                  {callTree ? (
                    <div className="overflow-x-auto">
                      {renderCallTree(callTree)}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-16">
                      Run the algorithm to see the recursion tree visualization
                    </div>
                  )}
                </div>

                {renderCallStack()}

                {/* Algorithm Information */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Recursion Process</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">How Recursion Works</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Function calls itself with smaller inputs</li>
                        <li>• Each call is added to the call stack</li>
                        <li>• Base case stops the recursion</li>
                        <li>• Results propagate back up the call stack</li>
                        <li>• Stack unwinding returns final result</li>
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">Recursion vs Iteration</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Recursion: Elegant but can be inefficient</li>
                        <li>• Iteration: More efficient but less intuitive</li>
                        <li>• Recursion uses stack, iteration uses loops</li>
                        <li>• Some problems are naturally recursive</li>
                        <li>• Tail recursion can optimize space</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications and Optimization */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Recursion Applications & Optimization</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-2">Common Recursive Patterns</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Divide and Conquer</strong>: Binary Search, Merge Sort</li>
                      <li>• <strong>Tree/Graph Traversal</strong>: DFS, Tree operations</li>
                      <li>• <strong>Backtracking</strong>: N-Queens, Sudoku, Maze solving</li>
                      <li>• <strong>Dynamic Programming</strong>: Fibonacci, Knapsack</li>
                      <li>• <strong>Mathematical Sequences</strong>: Factorial, Fibonacci</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Optimization Techniques</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Memoization</strong>: Cache results of expensive calls</li>
                      <li>• <strong>Tail Recursion</strong>: Optimize to use constant space</li>
                      <li>• <strong>Iteration Conversion</strong>: Convert recursion to loops</li>
                      <li>• <strong>Pruning</strong>: Stop unnecessary recursive calls</li>
                      <li>• <strong>Dynamic Programming</strong>: Avoid repeated calculations</li>
                    </ul>
                  </div>
                </div>

                {/* Real-world Applications */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Real-world Applications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">File Systems</h5>
                      <p className="text-gray-300">Directory traversal, file search, and folder size calculation using tree recursion.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Compiler Design</h5>
                      <p className="text-gray-300">Syntax tree parsing, expression evaluation, and code generation using recursive descent.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">AI and Games</h5>
                      <p className="text-gray-300">Game tree search, decision making, and puzzle solving using recursive backtracking.</p>
                    </div>
                  </div>
                </div>

                {/* Common Pitfalls */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Common Recursion Pitfalls</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-red-400 mb-2">Stack Overflow</h5>
                      <p className="text-gray-300">Occurs when recursion depth is too large. Solution: Use iteration or increase stack size.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-red-400 mb-2">No Base Case</h5>
                      <p className="text-gray-300">Infinite recursion occurs without proper base case. Always define stopping condition.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-red-400 mb-2">Inefficient Recursion</h5>
                      <p className="text-gray-300">Repeated calculations in algorithms like Fibonacci. Solution: Use memoization.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-red-400 mb-2">Memory Usage</h5>
                      <p className="text-gray-300">Each recursive call uses stack space. Consider space complexity in design.</p>
                    </div>
                  </div>
                </div>

                {/* Comparison with Iteration */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Recursion vs Iteration Comparison</h4>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th className="bg-gray-700 text-white">Aspect</th>
                          <th className="bg-gray-700 text-white">Recursion</th>
                          <th className="bg-gray-700 text-white">Iteration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Code Readability</td>
                          <td>Elegant for recursive problems</td>
                          <td>Straightforward for simple loops</td>
                        </tr>
                        <tr>
                          <td>Memory Usage</td>
                          <td>Higher (stack frames)</td>
                          <td>Lower (no stack overhead)</td>
                        </tr>
                        <tr>
                          <td>Performance</td>
                          <td>Slower (function call overhead)</td>
                          <td>Faster (direct execution)</td>
                        </tr>
                        <tr>
                          <td>Problem Suitability</td>
                          <td>Tree structures, divide and conquer</td>
                          <td>Sequential processing, simple loops</td>
                        </tr>
                        <tr>
                          <td>Debugging</td>
                          <td>Harder (complex call stack)</td>
                          <td>Easier (linear execution)</td>
                        </tr>
                      </tbody>
                    </table>
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

export default RecursionVisualizer;