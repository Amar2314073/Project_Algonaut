// components/visualizers/DynamicProgrammingVisualizer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

class DPCell {
  constructor(row, col, value = null) {
    this.row = row;
    this.col = col;
    this.id = `cell-${row}-${col}`;
    this.value = value;
    this.state = 'normal'; // 'normal', 'current', 'result', 'dependency', 'optimal', 'visited'
    this.highlighted = false;
    this.explanation = '';
    this.dependencies = [];
    this.isBaseCase = false;
  }

  reset() {
    this.state = 'normal';
    this.highlighted = false;
    this.explanation = '';
    this.dependencies = [];
    this.isBaseCase = false;
  }
}

class DynamicProgrammingAlgorithms {
  static fibonacci(n) {
    const steps = [];
    const dp = new Array(n + 1);
    
    steps.push({
      type: 'initialize',
      description: `Initializing Fibonacci array for n = ${n}`,
      dp: [...dp]
    });

    // Base cases
    dp[0] = 0;
    dp[1] = 1;
    
    steps.push({
      type: 'base-case',
      index: 0,
      value: 0,
      description: 'Base case: F(0) = 0'
    });

    steps.push({
      type: 'base-case',
      index: 1,
      value: 1,
      description: 'Base case: F(1) = 1'
    });

    // Fill DP table
    for (let i = 2; i <= n; i++) {
      steps.push({
        type: 'compute',
        index: i,
        dependencies: [i - 1, i - 2],
        description: `Computing F(${i}) = F(${i-1}) + F(${i-2}) = ${dp[i-1]} + ${dp[i-2]}`
      });

      dp[i] = dp[i - 1] + dp[i - 2];

      steps.push({
        type: 'result',
        index: i,
        value: dp[i],
        description: `F(${i}) = ${dp[i]}`
      });
    }

    return { 
      steps, 
      result: dp[n],
      dpTable: dp.map((val, idx) => ({ index: idx, value: val }))
    };
  }

  static knapsack(weights, values, capacity) {
    const steps = [];
    const n = weights.length;
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));

    steps.push({
      type: 'initialize',
      description: `Initializing DP table: ${n} items, capacity ${capacity}`,
      dp: JSON.parse(JSON.stringify(dp))
    });

    for (let i = 1; i <= n; i++) {
      for (let w = 1; w <= capacity; w++) {
        steps.push({
          type: 'consider-item',
          item: i - 1,
          weight: weights[i - 1],
          value: values[i - 1],
          currentCapacity: w,
          description: `Considering item ${i} (weight: ${weights[i-1]}, value: ${values[i-1]}) at capacity ${w}`
        });

        if (weights[i - 1] <= w) {
          // Item can be included
          const include = values[i - 1] + dp[i - 1][w - weights[i - 1]];
          const exclude = dp[i - 1][w];
          
          steps.push({
            type: 'compare',
            item: i - 1,
            capacity: w,
            includeValue: include,
            excludeValue: exclude,
            description: `Include: ${values[i-1]} + dp[${i-1}][${w - weights[i-1]}] = ${include}, Exclude: dp[${i-1}][${w}] = ${exclude}`
          });

          if (include > exclude) {
            dp[i][w] = include;
            steps.push({
              type: 'include',
              item: i - 1,
              capacity: w,
              value: include,
              description: `Including item ${i} - better value: ${include}`
            });
          } else {
            dp[i][w] = exclude;
            steps.push({
              type: 'exclude',
              item: i - 1,
              capacity: w,
              value: exclude,
              description: `Excluding item ${i} - better value: ${exclude}`
            });
          }
        } else {
          // Item too heavy
          dp[i][w] = dp[i - 1][w];
          steps.push({
            type: 'skip',
            item: i - 1,
            capacity: w,
            value: dp[i - 1][w],
            description: `Item ${i} too heavy (${weights[i-1]} > ${w}), skipping`
          });
        }

        steps.push({
          type: 'update',
          dp: JSON.parse(JSON.stringify(dp)),
          description: `Updated dp[${i}][${w}] = ${dp[i][w]}`
        });
      }
    }

    // Backtrack to find selected items
    const selectedItems = [];
    let w = capacity;
    for (let i = n; i > 0 && w > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        selectedItems.push(i - 1);
        w -= weights[i - 1];
      }
    }

    steps.push({
      type: 'backtrack',
      selectedItems: [...selectedItems],
      description: `Selected items: [${selectedItems.join(', ')}] with total value ${dp[n][capacity]}`
    });

    return {
      steps,
      result: dp[n][capacity],
      selectedItems,
      dpTable: dp
    };
  }

  static longestCommonSubsequence(text1, text2) {
    const steps = [];
    const m = text1.length;
    const n = text2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

    steps.push({
      type: 'initialize',
      description: `Finding LCS between "${text1}" (length ${m}) and "${text2}" (length ${n})`,
      dp: JSON.parse(JSON.stringify(dp))
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        steps.push({
          type: 'compare-chars',
          i: i - 1,
          j: j - 1,
          char1: text1[i - 1],
          char2: text2[j - 1],
          description: `Comparing text1[${i-1}] = '${text1[i-1]}' with text2[${j-1}] = '${text2[j-1]}'`
        });

        if (text1[i - 1] === text2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          steps.push({
            type: 'match',
            i, j,
            value: dp[i][j],
            description: `Characters match! dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i][j]}`
          });
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          steps.push({
            type: 'no-match',
            i, j,
            value: dp[i][j],
            description: `No match. dp[${i}][${j}] = max(dp[${i-1}][${j}] = ${dp[i-1][j]}, dp[${i}][${j-1}] = ${dp[i][j-1]}) = ${dp[i][j]}`
          });
        }

        steps.push({
          type: 'update',
          dp: JSON.parse(JSON.stringify(dp)),
          description: `Updated dp[${i}][${j}] = ${dp[i][j]}`
        });
      }
    }

    // Backtrack to find LCS string
    let lcs = '';
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (text1[i - 1] === text2[j - 1]) {
        lcs = text1[i - 1] + lcs;
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    steps.push({
      type: 'backtrack',
      lcs,
      description: `LCS: "${lcs}" with length ${dp[m][n]}`
    });

    return {
      steps,
      result: dp[m][n],
      lcs,
      dpTable: dp
    };
  }

  static coinChange(coins, amount) {
    const steps = [];
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;

    steps.push({
      type: 'initialize',
      description: `Initializing DP array for amount ${amount}. Coins: [${coins.join(', ')}]`,
      dp: [...dp]
    });

    steps.push({
      type: 'base-case',
      index: 0,
      value: 0,
      description: 'Base case: dp[0] = 0 (0 coins needed for amount 0)'
    });

    for (let i = 1; i <= amount; i++) {
      steps.push({
        type: 'compute-amount',
        amount: i,
        description: `Computing minimum coins for amount ${i}`
      });

      for (const coin of coins) {
        if (coin <= i) {
          steps.push({
            type: 'try-coin',
            amount: i,
            coin,
            remaining: i - coin,
            currentMin: dp[i],
            candidate: dp[i - coin] + 1,
            description: `Trying coin ${coin} for amount ${i}. dp[${i}] = min(${dp[i]}, dp[${i-coin}] + 1 = ${dp[i-coin] + 1})`
          });

          dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        } else {
          steps.push({
            type: 'skip-coin',
            amount: i,
            coin,
            description: `Skipping coin ${coin} - too large for amount ${i}`
          });
        }
      }

      steps.push({
        type: 'result',
        amount: i,
        value: dp[i],
        description: dp[i] === Infinity ? 
          `Amount ${i} cannot be made with given coins` :
          `Minimum coins for amount ${i}: ${dp[i]}`
      });
    }

    return {
      steps,
      result: dp[amount] === Infinity ? -1 : dp[amount],
      dpTable: dp.map((val, idx) => ({ amount: idx, coins: val }))
    };
  }

  static editDistance(word1, word2) {
    const steps = [];
    const m = word1.length;
    const n = word2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

    steps.push({
      type: 'initialize',
      description: `Computing edit distance between "${word1}" and "${word2}"`,
      dp: JSON.parse(JSON.stringify(dp))
    });

    // Initialize first row and column
    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
      steps.push({
        type: 'base-case',
        i, j: 0,
        value: i,
        description: `Base case: dp[${i}][0] = ${i} (delete all ${i} characters from word1)`
      });
    }

    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
      steps.push({
        type: 'base-case',
        i: 0, j,
        value: j,
        description: `Base case: dp[0][${j}] = ${j} (insert all ${j} characters into word1)`
      });
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        steps.push({
          type: 'compare-chars',
          i: i - 1,
          j: j - 1,
          char1: word1[i - 1],
          char2: word2[j - 1],
          description: `Comparing word1[${i-1}]='${word1[i-1]}' with word2[${j-1}]='${word2[j-1]}'`
        });

        if (word1[i - 1] === word2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
          steps.push({
            type: 'match',
            i, j,
            value: dp[i][j],
            description: `Characters match! dp[${i}][${j}] = dp[${i-1}][${j-1}] = ${dp[i][j]}`
          });
        } else {
          const insert = dp[i][j - 1] + 1;
          const deleteOp = dp[i - 1][j] + 1;
          const replace = dp[i - 1][j - 1] + 1;
          
          dp[i][j] = Math.min(insert, deleteOp, replace);
          
          steps.push({
            type: 'no-match',
            i, j,
            insert,
            delete: deleteOp,
            replace,
            value: dp[i][j],
            description: `No match. Min(insert: ${insert}, delete: ${deleteOp}, replace: ${replace}) = ${dp[i][j]}`
          });
        }

        steps.push({
          type: 'update',
          dp: JSON.parse(JSON.stringify(dp)),
          description: `Updated dp[${i}][${j}] = ${dp[i][j]}`
        });
      }
    }

    return {
      steps,
      result: dp[m][n],
      dpTable: dp
    };
  }
}

function DynamicProgrammingVisualizer() {
  const navigate = useNavigate();
  const [algorithm, setAlgorithm] = useState('fibonacci');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(200);
  const [message, setMessage] = useState('Select a dynamic programming algorithm to visualize.');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showExplanations, setShowExplanations] = useState(true);
  const [dpTable, setDpTable] = useState([]);

  // Algorithm-specific states
  const [fibN, setFibN] = useState(6);
  const [knapsackItems, setKnapsackItems] = useState([
    { weight: 2, value: 3 },
    { weight: 3, value: 4 },
    { weight: 4, value: 5 },
    { weight: 5, value: 6 }
  ]);
  const [knapsackCapacity, setKnapsackCapacity] = useState(5);
  const [lcsText1, setLcsText1] = useState('ABCDGH');
  const [lcsText2, setLcsText2] = useState('AEDFHR');
  const [coinChangeCoins, setCoinChangeCoins] = useState('1,2,5');
  const [coinChangeAmount, setCoinChangeAmount] = useState(11);
  const [editDistanceWord1, setEditDistanceWord1] = useState('kitten');
  const [editDistanceWord2, setEditDistanceWord2] = useState('sitting');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Initialize DP table based on algorithm
  const initializeDpTable = useCallback(() => {
    switch (algorithm) {
      case 'fibonacci':
        return Array(fibN + 1).fill().map((_, i) => new DPCell(0, i));
      case 'knapsack':
        return Array(knapsackItems.length + 1).fill().map((_, i) => 
          Array(knapsackCapacity + 1).fill().map((_, j) => new DPCell(i, j))
        );
      case 'lcs':
        return Array(lcsText1.length + 1).fill().map((_, i) => 
          Array(lcsText2.length + 1).fill().map((_, j) => new DPCell(i, j))
        );
      case 'coin-change':
        return Array(parseInt(coinChangeAmount) + 1).fill().map((_, i) => new DPCell(0, i));
      case 'edit-distance':
        return Array(editDistanceWord1.length + 1).fill().map((_, i) => 
          Array(editDistanceWord2.length + 1).fill().map((_, j) => new DPCell(i, j))
        );
      default:
        return [];
    }
  }, [algorithm, fibN, knapsackItems, knapsackCapacity, lcsText1, lcsText2, coinChangeAmount, editDistanceWord1, editDistanceWord2]);

  const [table, setTable] = useState(initializeDpTable());

  useEffect(() => {
    setTable(initializeDpTable());
  }, [initializeDpTable]);

  // Solve problem
  const solveProblem = async () => {
    setIsAnimating(true);
    setIsPaused(false);
    setCurrentStep(0);
    setResult(null);
    setSteps([]);

    let solution;
    switch (algorithm) {
      case 'fibonacci':
        solution = DynamicProgrammingAlgorithms.fibonacci(fibN);
        break;
      case 'knapsack':
        const weights = knapsackItems.map(item => item.weight);
        const values = knapsackItems.map(item => item.value);
        solution = DynamicProgrammingAlgorithms.knapsack(weights, values, knapsackCapacity);
        break;
      case 'lcs':
        solution = DynamicProgrammingAlgorithms.longestCommonSubsequence(lcsText1, lcsText2);
        break;
      case 'coin-change':
        const coins = coinChangeCoins.split(',').map(coin => parseInt(coin.trim())).filter(coin => !isNaN(coin));
        solution = DynamicProgrammingAlgorithms.coinChange(coins, parseInt(coinChangeAmount));
        break;
      case 'edit-distance':
        solution = DynamicProgrammingAlgorithms.editDistance(editDistanceWord1, editDistanceWord2);
        break;
      default:
        solution = { steps: [], result: null, dpTable: [] };
    }

    setSteps(solution.steps);
    setResult(solution.result);
    setDpTable(solution.dpTable);
    setTotalSteps(solution.steps.length);

    // Execute animations
    for (let i = 0; i < solution.steps.length; i++) {
      if (isPaused) {
        while (isPaused) {
          await sleep(100);
        }
      }

      const step = solution.steps[i];
      setCurrentStep(i + 1);
      setMessage(step.description);

      // Update table visualization based on step type
      const newTable = initializeDpTable();
      
      switch (step.type) {
        case 'base-case':
          if (algorithm === 'fibonacci' || algorithm === 'coin-change') {
            newTable[step.index].state = 'result';
            newTable[step.index].value = step.value;
            newTable[step.index].isBaseCase = true;
          } else {
            newTable[step.i][step.j].state = 'result';
            newTable[step.i][step.j].value = step.value;
            newTable[step.i][step.j].isBaseCase = true;
          }
          break;
        
        case 'compute':
        case 'consider-item':
        case 'compute-amount':
        case 'compare-chars':
          if (step.dependencies) {
            step.dependencies.forEach(dep => {
              newTable[dep].state = 'dependency';
            });
          }
          newTable[step.index].state = 'current';
          break;
        
        case 'result':
          if (algorithm === 'fibonacci' || algorithm === 'coin-change') {
            newTable[step.index || step.amount].state = 'result';
            newTable[step.index || step.amount].value = step.value;
          } else {
            newTable[step.i][step.j].state = 'result';
            newTable[step.i][step.j].value = step.value;
          }
          break;
        
        case 'include':
        case 'exclude':
        case 'match':
        case 'update':
          // Update the entire table state
          if (step.dp) {
            step.dp.forEach((row, i) => {
              if (Array.isArray(row)) {
                row.forEach((value, j) => {
                  if (newTable[i] && newTable[i][j]) {
                    newTable[i][j].value = value;
                    if (value !== 0 && !newTable[i][j].isBaseCase) {
                      newTable[i][j].state = 'visited';
                    }
                  }
                });
              }
            });
          }
          break;
      }

      setTable(newTable);
      await sleep(animationSpeed);
    }

    setMessage(`Solution: ${result !== null ? result : solution.result}`);
    setIsAnimating(false);
  };

  // Get cell color based on state
  const getCellColor = (cell) => {
    switch (cell.state) {
      case 'current':
        return '#F59E0B'; // Yellow - current cell
      case 'result':
        return '#10B981'; // Green - result cell
      case 'dependency':
        return '#3B82F6'; // Blue - dependency
      case 'optimal':
        return '#8B5CF6'; // Purple - optimal choice
      case 'visited':
        return '#6B7280'; // Gray - visited
      case 'base-case':
        return '#EF4444'; // Red - base case
      default:
        return '#4B5563'; // Dark gray - normal
    }
  };

  // Get algorithm description
  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case 'fibonacci':
        return 'Compute Fibonacci numbers using memoization to avoid redundant calculations.';
      case 'knapsack':
        return 'Select items with maximum total value without exceeding weight capacity.';
      case 'lcs':
        return 'Find the longest subsequence common to two sequences.';
      case 'coin-change':
        return 'Find minimum number of coins needed to make a given amount.';
      case 'edit-distance':
        return 'Compute minimum operations (insert, delete, replace) to convert one string to another.';
      default:
        return 'Select a dynamic programming algorithm to see its description.';
    }
  };

  // Get algorithm complexity
  const getAlgorithmComplexity = () => {
    switch (algorithm) {
      case 'fibonacci':
        return { time: 'O(n)', space: 'O(n)', description: 'Linear time and space' };
      case 'knapsack':
        return { time: 'O(n*W)', space: 'O(n*W)', description: 'Pseudopolynomial - depends on capacity' };
      case 'lcs':
        return { time: 'O(m*n)', space: 'O(m*n)', description: 'Quadratic in sequence lengths' };
      case 'coin-change':
        return { time: 'O(n*amount)', space: 'O(amount)', description: 'Pseudopolynomial - depends on amount' };
      case 'edit-distance':
        return { time: 'O(m*n)', space: 'O(m*n)', description: 'Quadratic in string lengths' };
      default:
        return { time: 'O(1)', space: 'O(1)', description: '' };
    }
  };

  // Render algorithm-specific controls
  const renderAlgorithmControls = () => {
    switch (algorithm) {
      case 'fibonacci':
        return (
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300">Fibonacci Number (n)</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="15" 
              value={fibN}
              onChange={(e) => setFibN(parseInt(e.target.value))}
              className="range range-primary"
              disabled={isAnimating}
            />
            <div className="text-center text-sm text-gray-400">
              Compute F({fibN})
            </div>
          </div>
        );
      
      case 'knapsack':
        return (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Knapsack Capacity</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={knapsackCapacity}
                onChange={(e) => setKnapsackCapacity(parseInt(e.target.value))}
                className="range range-primary"
                disabled={isAnimating}
              />
              <div className="text-center text-sm text-gray-400">
                Capacity: {knapsackCapacity}
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Items (weight, value)</span>
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {knapsackItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input 
                      type="number" 
                      className="input input-bordered input-sm flex-1 bg-gray-700 text-white"
                      value={item.weight}
                      onChange={(e) => {
                        const newItems = [...knapsackItems];
                        newItems[index].weight = parseInt(e.target.value);
                        setKnapsackItems(newItems);
                      }}
                      placeholder="Weight"
                      disabled={isAnimating}
                    />
                    <input 
                      type="number" 
                      className="input input-bordered input-sm flex-1 bg-gray-700 text-white"
                      value={item.value}
                      onChange={(e) => {
                        const newItems = [...knapsackItems];
                        newItems[index].value = parseInt(e.target.value);
                        setKnapsackItems(newItems);
                      }}
                      placeholder="Value"
                      disabled={isAnimating}
                    />
                  </div>
                ))}
              </div>
              <button 
                className="btn btn-sm btn-outline mt-2"
                onClick={() => setKnapsackItems([...knapsackItems, { weight: 1, value: 1 }])}
                disabled={isAnimating}
              >
                Add Item
              </button>
            </div>
          </>
        );
      
      case 'lcs':
        return (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">First String</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered bg-gray-700 text-white"
                value={lcsText1}
                onChange={(e) => setLcsText1(e.target.value)}
                disabled={isAnimating}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Second String</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered bg-gray-700 text-white"
                value={lcsText2}
                onChange={(e) => setLcsText2(e.target.value)}
                disabled={isAnimating}
              />
            </div>
          </>
        );
      
      case 'coin-change':
        return (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Coins (comma-separated)</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered bg-gray-700 text-white"
                value={coinChangeCoins}
                onChange={(e) => setCoinChangeCoins(e.target.value)}
                placeholder="e.g., 1,2,5"
                disabled={isAnimating}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Target Amount</span>
              </label>
              <input 
                type="number" 
                className="input input-bordered bg-gray-700 text-white"
                value={coinChangeAmount}
                onChange={(e) => setCoinChangeAmount(parseInt(e.target.value))}
                disabled={isAnimating}
              />
            </div>
          </>
        );
      
      case 'edit-distance':
        return (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">First Word</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered bg-gray-700 text-white"
                value={editDistanceWord1}
                onChange={(e) => setEditDistanceWord1(e.target.value)}
                disabled={isAnimating}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Second Word</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered bg-gray-700 text-white"
                value={editDistanceWord2}
                onChange={(e) => setEditDistanceWord2(e.target.value)}
                disabled={isAnimating}
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  // Render DP table visualization
  const renderDpTable = () => {
    if (!table || table.length === 0) return null;

    if (algorithm === 'fibonacci' || algorithm === 'coin-change') {
      // 1D DP table
      return (
        <div className="flex flex-wrap justify-center gap-2">
          {table.map((cell, index) => (
            <div
              key={cell.id}
              className="flex flex-col items-center transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: getCellColor(cell),
                  borderColor: cell.isBaseCase ? '#EF4444' : '#4B5563'
                }}
              >
                <span className="text-white font-bold text-sm">
                  {cell.value !== null && cell.value !== undefined ? cell.value : ''}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {algorithm === 'fibonacci' ? `F(${index})` : `dp[${index}]`}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      // 2D DP table
      return (
        <div className="overflow-x-auto">
          <div className="inline-block">
            <div className="grid gap-1">
              {/* Header row */}
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${table[0].length + 1}, 1fr)` }}>
                <div className="w-12 h-12"></div>
                {table[0].map((_, j) => (
                  <div key={j} className="w-12 h-12 flex items-center justify-center text-gray-400 text-sm font-bold">
                    {algorithm === 'knapsack' ? j : 
                     algorithm === 'lcs' ? (j > 0 ? lcsText2[j-1] : '') :
                     algorithm === 'edit-distance' ? (j > 0 ? editDistanceWord2[j-1] : '') : j}
                  </div>
                ))}
              </div>
              
              {/* Data rows */}
              {table.map((row, i) => (
                <div key={i} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${row.length + 1}, 1fr)` }}>
                  <div className="w-12 h-12 flex items-center justify-center text-gray-400 text-sm font-bold">
                    {algorithm === 'knapsack' ? (i > 0 ? `Item ${i}` : '') :
                     algorithm === 'lcs' ? (i > 0 ? lcsText1[i-1] : '') :
                     algorithm === 'edit-distance' ? (i > 0 ? editDistanceWord1[i-1] : '') : i}
                  </div>
                  {row.map((cell, j) => (
                    <div
                      key={cell.id}
                      className="w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor: getCellColor(cell),
                        borderColor: cell.isBaseCase ? '#EF4444' : '#4B5563'
                      }}
                    >
                      <span className="text-white font-bold text-sm">
                        {cell.value !== null && cell.value !== undefined ? cell.value : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
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
          <h1 className="text-4xl font-bold text-white mb-2">Dynamic Programming Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize how DP solves complex problems by breaking them into overlapping subproblems</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Algorithm Selection */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">DP Problems</h3>
                
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
                    <option value="fibonacci">Fibonacci Sequence</option>
                    <option value="knapsack">0/1 Knapsack</option>
                    <option value="lcs">Longest Common Subsequence</option>
                    <option value="coin-change">Coin Change</option>
                    <option value="edit-distance">Edit Distance</option>
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
                      `Solve ${algorithm.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`
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
                    min="50" 
                    max="1000" 
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                    className="range range-primary"
                    disabled={isAnimating}
                  />
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text text-gray-300">Show Explanations</span>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary"
                      checked={showExplanations}
                      onChange={(e) => setShowExplanations(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Solution Status</h3>
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
                    {algorithm === 'lcs' && dpTable.lcs && (
                      <div className="text-sm text-gray-300 mt-1">
                        LCS: "{dpTable.lcs}"
                      </div>
                    )}
                    {algorithm === 'knapsack' && dpTable.selectedItems && (
                      <div className="text-sm text-gray-300 mt-1">
                        Selected items: [{dpTable.selectedItems.join(', ')}]
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* DP Concept Explanation */}
            {showExplanations && (
              <div className="card bg-gray-800 shadow-lg border border-gray-700">
                <div className="card-body">
                  <h3 className="card-title text-white">DP Principles</h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p><strong>Optimal Substructure:</strong> Optimal solution contains optimal solutions to subproblems.</p>
                    <p><strong>Overlapping Subproblems:</strong> Problems can be broken into smaller, reusable subproblems.</p>
                    <p><strong>Memoization:</strong> Store results of expensive function calls.</p>
                    <p><strong>Tabulation:</strong> Build table bottom-up with dependencies.</p>
                  </div>
                </div>
              </div>
            )}

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

            {/* Legend */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Legend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-300">Current Cell</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-300">Result</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-gray-300">Dependency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-300">Base Case</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    <span className="text-gray-300">Uncomputed</span>
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
                    ).join(' ')} Visualization
                  </h3>
                  <div className="text-sm text-gray-400">
                    {getAlgorithmDescription()}
                  </div>
                </div>

                {/* DP Table Visualization */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  {renderDpTable()}
                </div>

                {/* Algorithm Information */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Dynamic Programming Process</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">How It Works</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Identify overlapping subproblems</li>
                        <li>• Define recurrence relation</li>
                        <li>• Handle base cases</li>
                        <li>• Choose memoization or tabulation</li>
                        <li>• Build solution bottom-up or top-down</li>
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">When to Use DP</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Optimization problems</li>
                        <li>• Counting problems</li>
                        <li>• Problems with optimal substructure</li>
                        <li>• Problems with overlapping subproblems</li>
                        <li>• Sequence alignment problems</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications and Comparison */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">DP Applications & Techniques</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-2">Common DP Patterns</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>1D DP</strong>: Fibonacci, Coin Change, Climbing Stairs</li>
                      <li>• <strong>2D DP</strong>: LCS, Edit Distance, Knapsack</li>
                      <li>• <strong>Interval DP</strong>: Matrix Chain Multiplication</li>
                      <li>• <strong>Tree DP</strong>: Binary Tree Problems</li>
                      <li>• <strong>Bitmask DP</strong>: Traveling Salesman</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Optimization Techniques</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>State Compression</strong>: Reduce space complexity</li>
                      <li>• <strong>Sliding Window</strong>: Optimize space for sequences</li>
                      <li>• <strong>Precomputation</strong>: Compute values in advance</li>
                      <li>• <strong>Approximation</strong>: Trade accuracy for efficiency</li>
                      <li>• <strong>Parallelization</strong>: Compute independent states in parallel</li>
                    </ul>
                  </div>
                </div>

                {/* Real-world Applications */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Real-world Applications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Bioinformatics</h5>
                      <p className="text-gray-300">Sequence alignment, DNA matching, protein folding using LCS and edit distance.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Finance</h5>
                      <p className="text-gray-300">Portfolio optimization, risk management using knapsack and optimization DP.</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">Natural Language</h5>
                      <p className="text-gray-300">Spell checking, autocomplete, machine translation using edit distance algorithms.</p>
                    </div>
                  </div>
                </div>

                {/* Comparison with Other Techniques */}
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">DP vs Other Techniques</h4>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th className="bg-gray-700 text-white">Technique</th>
                          <th className="bg-gray-700 text-white">When to Use</th>
                          <th className="bg-gray-700 text-white">Pros</th>
                          <th className="bg-gray-700 text-white">Cons</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Dynamic Programming</td>
                          <td>Overlapping subproblems, optimal substructure</td>
                          <td>Optimal solution, avoids recomputation</td>
                          <td>Can be memory intensive</td>
                        </tr>
                        <tr>
                          <td>Greedy Algorithms</td>
                          <td>Local optimal choice leads to global optimum</td>
                          <td>Fast, simple to implement</td>
                          <td>May not find optimal solution</td>
                        </tr>
                        <tr>
                          <td>Divide and Conquer</td>
                          <td>Independent subproblems</td>
                          <td>Efficient, parallelizable</td>
                          <td>Recomputes overlapping subproblems</td>
                        </tr>
                        <tr>
                          <td>Backtracking</td>
                          <td>Constraint satisfaction, combinatorial problems</td>
                          <td>Finds all solutions, systematic</td>
                          <td>Exponential time in worst case</td>
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

export default DynamicProgrammingVisualizer;