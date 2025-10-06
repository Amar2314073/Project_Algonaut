// components/visualizers/BacktrackingVisualizer.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';

class BacktrackingCell {
  constructor(row, col, value = null) {
    this.row = row;
    this.col = col;
    this.id = `cell-${row}-${col}`;
    this.value = value;
    this.original = value !== null;
    this.state = 'empty'; // 'empty', 'filled', 'conflict', 'current', 'visited', 'solution', 'backtracked'
    this.highlighted = false;
    this.isSolutionPath = false;
    this.backtracked = false;
    this.animation = '';
  }

  reset() {
    if (!this.original) {
      this.value = null;
    }
    this.state = this.original ? 'filled' : 'empty';
    this.highlighted = false;
    this.isSolutionPath = false;
    this.backtracked = false;
    this.animation = '';
  }
}

class BacktrackingAlgorithms {
  static nQueens(boardSize) {
    const board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    const solutions = [];
    const steps = [];

    const isSafe = (board, row, col) => {
      // Check left side of current row
      for (let i = 0; i < col; i++) {
        if (board[row][i] === 1) return false;
      }

      // Check upper diagonal on left side
      for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j] === 1) return false;
      }

      // Check lower diagonal on left side
      for (let i = row, j = col; i < boardSize && j >= 0; i++, j--) {
        if (board[i][j] === 1) return false;
      }

      return true;
    };

    const solve = (board, col, currentSolution = []) => {
      if (col >= boardSize) {
        solutions.push(board.map(row => [...row]));
        steps.push({
          type: 'solution',
          board: board.map(row => [...row]),
          description: `🎉 Found solution ${solutions.length}! All queens placed safely.`,
          solutionNumber: solutions.length
        });
        return true;
      }

      let found = false;
      for (let row = 0; row < boardSize; row++) {
        steps.push({
          type: 'try',
          row,
          col,
          description: `🔍 Testing position (${row}, ${col}) for queen placement`,
          currentQueens: [...currentSolution]
        });

        if (isSafe(board, row, col)) {
          board[row][col] = 1;
          currentSolution.push({ row, col });

          steps.push({
            type: 'place',
            row,
            col,
            description: `✅ Placed queen at (${row}, ${col}) - position is safe`,
            currentQueens: [...currentSolution]
          });

          if (solve(board, col + 1, currentSolution)) {
            found = true;
          }

          // Backtrack
          steps.push({
            type: 'backtrack',
            row,
            col,
            description: `🔄 Backtracking: removing queen from (${row}, ${col})`,
            currentQueens: [...currentSolution]
          });

          board[row][col] = 0;
          currentSolution.pop();
        } else {
          steps.push({
            type: 'conflict',
            row,
            col,
            description: `❌ Conflict at (${row}, ${col}) - queen would be attacked`,
            currentQueens: [...currentSolution]
          });
        }
      }

      return found;
    };

    steps.push({
      type: 'start',
      description: `🚀 Starting N-Queens solver for ${boardSize}×${boardSize} board`,
      board: board.map(row => [...row])
    });

    solve(board, 0);
    
    steps.push({
      type: 'complete',
      description: `✅ Completed! Found ${solutions.length} solution(s)`,
      totalSolutions: solutions.length
    });

    return { steps, solutions, totalSolutions: solutions.length };
  }

  static sudokuSolver(initialBoard) {
    const board = initialBoard.map(row => [...row]);
    const steps = [];
    const solutions = [];

    const findEmpty = (board) => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) {
            return [row, col];
          }
        }
      }
      return null;
    };

    const isValid = (board, row, col, num) => {
      // Check row
      for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
      }

      // Check column
      for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
      }

      // Check 3x3 box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[boxRow + i][boxCol + j] === num) return false;
        }
      }

      return true;
    };

    const solve = () => {
      const empty = findEmpty(board);
      if (!empty) {
        solutions.push(board.map(row => [...row]));
        steps.push({
          type: 'solution',
          board: board.map(row => [...row]),
          description: '🎉 Sudoku solved completely!'
        });
        return true;
      }

      const [row, col] = empty;

      steps.push({
        type: 'try-cell',
        row,
        col,
        description: `🔍 Focusing on empty cell at (${row}, ${col})`
      });

      for (let num = 1; num <= 9; num++) {
        steps.push({
          type: 'try-number',
          row,
          col,
          num,
          description: `🔢 Testing number ${num} at (${row}, ${col})`
        });

        if (isValid(board, row, col, num)) {
          board[row][col] = num;
          steps.push({
            type: 'place-number',
            row,
            col,
            num,
            description: `✅ Placed ${num} at (${row}, ${col}) - valid placement`
          });

          if (solve()) {
            return true;
          }

          // Backtrack
          steps.push({
            type: 'backtrack',
            row,
            col,
            description: `🔄 Backtracking: clearing cell (${row}, ${col}) - dead end reached`
          });
          board[row][col] = 0;
        } else {
          steps.push({
            type: 'conflict',
            row,
            col,
            num,
            description: `❌ Conflict: ${num} violates Sudoku rules at (${row}, ${col})`
          });
        }
      }

      return false;
    };

    steps.push({
      type: 'start',
      description: '🚀 Starting Sudoku solver',
      board: board.map(row => [...row])
    });

    solve();
    
    steps.push({
      type: 'complete',
      description: `✅ Completed! ${solutions.length > 0 ? 'Puzzle solved!' : 'No solution found'}`,
      totalSolutions: solutions.length
    });

    return { steps, solutions, totalSolutions: solutions.length };
  }

  static mazeSolver(maze) {
    const steps = [];
    const solutions = [];
    const path = [];
    const visited = Array(maze.length).fill().map(() => Array(maze[0].length).fill(false));

    const isSafe = (row, col) => {
      return row >= 0 && row < maze.length && 
             col >= 0 && col < maze[0].length && 
             maze[row][col] === 0 && 
             !visited[row][col];
    };

    const solve = (row, col) => {
      // Check if we reached the destination (bottom-right corner)
      if (row === maze.length - 1 && col === maze[0].length - 1) {
        path.push([row, col]);
        solutions.push([...path]);
        steps.push({
          type: 'solution',
          path: [...path],
          description: '🎉 Found path to exit! Maze solved!'
        });
        path.pop();
        return true;
      }

      if (!isSafe(row, col)) {
        return false;
      }

      // Mark cell as part of solution path
      visited[row][col] = true;
      path.push([row, col]);

      steps.push({
        type: 'visit',
        row,
        col,
        path: [...path],
        description: `📍 Visiting cell (${row}, ${col}) - path length: ${path.length}`
      });

      // Move in all four directions
      const directions = [
        [1, 0, 'down'],
        [0, 1, 'right'],
        [-1, 0, 'up'],
        [0, -1, 'left']
      ];

      let found = false;
      for (const [dr, dc, direction] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        steps.push({
          type: 'try-direction',
          row: newRow,
          col: newCol,
          direction,
          description: `➡️ Trying to move ${direction} to (${newRow}, ${newCol})`
        });

        if (solve(newRow, newCol)) {
          found = true;
        }
      }

      // If no direction worked, backtrack
      if (!found) {
        steps.push({
          type: 'backtrack',
          row,
          col,
          description: `🔄 Backtracking from (${row}, ${col}) - dead end reached`
        });
      }

      path.pop();
      visited[row][col] = false;
      return found;
    };

    steps.push({
      type: 'start',
      description: '🚀 Starting maze solver from (0,0) to exit'
    });

    solve(0, 0);
    
    steps.push({
      type: 'complete',
      description: `✅ Completed! Found ${solutions.length} path(s) through the maze`,
      totalSolutions: solutions.length
    });

    return { steps, solutions, totalSolutions: solutions.length };
  }

  static permutationGenerator(elements) {
    const steps = [];
    const solutions = [];
    const current = [];

    const generate = (used) => {
      if (current.length === elements.length) {
        solutions.push([...current]);
        steps.push({
          type: 'solution',
          permutation: [...current],
          description: `🎉 Found permutation ${solutions.length}: [${current.join(', ')}]`
        });
        return;
      }

      for (let i = 0; i < elements.length; i++) {
        if (!used[i]) {
          steps.push({
            type: 'try',
            element: elements[i],
            index: i,
            currentPermutation: [...current],
            description: `🔍 Trying element ${elements[i]} at position ${current.length}`
          });

          used[i] = true;
          current.push(elements[i]);

          steps.push({
            type: 'place',
            element: elements[i],
            position: current.length - 1,
            currentPermutation: [...current],
            description: `✅ Placed ${elements[i]} at position ${current.length - 1}`
          });

          generate(used);

          // Backtrack
          steps.push({
            type: 'backtrack',
            element: elements[i],
            currentPermutation: [...current],
            description: `🔄 Backtracking: removing ${elements[i]} from position ${current.length - 1}`
          });

          current.pop();
          used[i] = false;
        }
      }
    };

    steps.push({
      type: 'start',
      description: `🚀 Generating all permutations of [${elements.join(', ')}]`
    });

    generate(Array(elements.length).fill(false));
    
    steps.push({
      type: 'complete',
      description: `✅ Completed! Generated ${solutions.length} permutations`,
      totalSolutions: solutions.length
    });

    return { steps, solutions, totalSolutions: solutions.length };
  }

  static subsetSum(numbers, target) {
    const steps = [];
    const solutions = [];
    const current = [];

    const findSubsets = (index, currentSum) => {
      steps.push({
        type: 'explore',
        index,
        currentSum,
        currentSubset: [...current],
        description: `🔍 Exploring index ${index}, current sum: ${currentSum}, subset: [${current.join(', ') || 'empty'}]`
      });

      if (currentSum === target) {
        solutions.push([...current]);
        steps.push({
          type: 'solution',
          subset: [...current],
          description: `🎉 Found subset that sums to ${target}: [${current.join(', ')}]`
        });
        return;
      }

      if (index >= numbers.length || currentSum > target) {
        steps.push({
          type: 'prune',
          index,
          currentSum,
          description: `✂️ Pruning: current sum ${currentSum} ${currentSum > target ? 'exceeds target' : 'reached end'}`
        });
        return;
      }

      // Include current element
      steps.push({
        type: 'include',
        element: numbers[index],
        currentSubset: [...current],
        description: `➕ Including ${numbers[index]} in subset`
      });

      current.push(numbers[index]);
      findSubsets(index + 1, currentSum + numbers[index]);
      
      // Backtrack - exclude current element
      steps.push({
        type: 'exclude',
        element: numbers[index],
        currentSubset: [...current],
        description: `➖ Excluding ${numbers[index]} from subset (backtracking)`
      });

      current.pop();
      findSubsets(index + 1, currentSum);
    };

    steps.push({
      type: 'start',
      description: `🚀 Finding subsets of [${numbers.join(', ')}] that sum to ${target}`
    });

    findSubsets(0, 0);
    
    steps.push({
      type: 'complete',
      description: `✅ Completed! Found ${solutions.length} subset(s) that sum to ${target}`,
      totalSolutions: solutions.length
    });

    return { steps, solutions, totalSolutions: solutions.length };
  }
}

function BacktrackingVisualizer() {
  const navigate = useNavigate();
  const [algorithm, setAlgorithm] = useState('nqueens');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100); // Default to medium speed
  const [message, setMessage] = useState('Select a backtracking algorithm to visualize.');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [steps, setSteps] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [currentSolution, setCurrentSolution] = useState(0);
  const [showExplanations, setShowExplanations] = useState(true);
  const [showComplexity, setShowComplexity] = useState(true);
  
  // Problem-specific states
  const [boardSize, setBoardSize] = useState(4);
  const [mazeSize, setMazeSize] = useState(5);
  const [permutationSize, setPermutationSize] = useState(3);
  const [subsetNumbers, setSubsetNumbers] = useState('1,2,3,4,5');
  const [subsetTarget, setSubsetTarget] = useState(5);

  const shouldStopRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentStepRef = useRef(0);

  // Initialize problems
  const initializeNQueens = useCallback(() => {
    return Array(boardSize).fill().map((_, row) => 
      Array(boardSize).fill().map((_, col) => new BacktrackingCell(row, col))
    );
  }, [boardSize]);

  const initializeSudoku = useCallback(() => {
    // A sample Sudoku puzzle (0 represents empty cells)
    const puzzle = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    return puzzle.map((row, rowIndex) => 
      row.map((value, colIndex) => new BacktrackingCell(rowIndex, colIndex, value || null))
    );
  }, []);

  const initializeMaze = useCallback(() => {
    // Generate maze based on size
    const generateMaze = (size) => {
      // Simple maze generation
      const maze = Array(size).fill().map(() => Array(size).fill(0));
      
      // Add some random walls (1s)
      for (let i = 0; i < size * size / 3; i++) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        if ((row !== 0 || col !== 0) && (row !== size-1 || col !== size-1)) {
          maze[row][col] = 1;
        }
      }
      
      // Ensure start and end are open
      maze[0][0] = 0;
      maze[size-1][size-1] = 0;
      
      return maze;
    };

    const maze = generateMaze(mazeSize);
    return maze.map((row, rowIndex) => 
      row.map((value, colIndex) => new BacktrackingCell(rowIndex, colIndex, value))
    );
  }, [mazeSize]);

  const [board, setBoard] = useState(initializeNQueens());

  // Reset visualization - FIXED
  const resetVisualization = useCallback(() => {
    shouldStopRef.current = true;
    isPausedRef.current = false;
    setIsAnimating(false);
    setIsPaused(false);
    setCurrentStep(0);
    currentStepRef.current = 0;
    setSteps([]);
    setSolutions([]);
    setCurrentSolution(0);
    
    switch (algorithm) {
      case 'nqueens':
        setBoard(initializeNQueens());
        break;
      case 'sudoku':
        setBoard(initializeSudoku());
        break;
      case 'maze':
        setBoard(initializeMaze());
        break;
      default:
        setBoard(initializeNQueens());
    }
    
    setMessage('Visualization reset. Ready to solve.');
  }, [algorithm, initializeNQueens, initializeSudoku, initializeMaze]);

  useEffect(() => {
    resetVisualization();
  }, [algorithm, boardSize, mazeSize, resetVisualization]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Solve problem with step-by-step animation - FIXED
  const solveProblem = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsPaused(false);
    isPausedRef.current = false;
    setCurrentStep(0);
    currentStepRef.current = 0;
    setSolutions([]);
    setCurrentSolution(0);
    shouldStopRef.current = false;

    let result;
    switch (algorithm) {
      case 'nqueens':
        result = BacktrackingAlgorithms.nQueens(boardSize);
        break;
      case 'sudoku':
        const sudokuBoard = board.map(row => row.map(cell => cell.original ? cell.value : 0));
        result = BacktrackingAlgorithms.sudokuSolver(sudokuBoard);
        break;
      case 'maze':
        const mazeBoard = board.map(row => row.map(cell => cell.value));
        result = BacktrackingAlgorithms.mazeSolver(mazeBoard);
        break;
      case 'permutations':
        const elements = Array.from({ length: permutationSize }, (_, i) => i + 1);
        result = BacktrackingAlgorithms.permutationGenerator(elements);
        break;
      case 'subset-sum':
        const numbers = subsetNumbers.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
        result = BacktrackingAlgorithms.subsetSum(numbers, parseInt(subsetTarget));
        break;
      default:
        result = { steps: [], solutions: [], totalSolutions: 0 };
    }

    setSteps(result.steps);
    setSolutions(result.solutions);
    setTotalSteps(result.steps.length);

    // Execute animations step by step - FIXED with proper pause/resume
    for (let i = currentStepRef.current; i < result.steps.length; i++) {
      if (shouldStopRef.current) break;
      
      // Handle pause - FIXED
      while (isPausedRef.current && !shouldStopRef.current) {
        await sleep(100);
      }
      
      if (shouldStopRef.current) break;

      const step = result.steps[i];
      setCurrentStep(i + 1);
      currentStepRef.current = i;
      setMessage(step.description);

      // Update visualization based on step type and algorithm
      updateVisualization(step, i);

      // FIXED: Reverse the speed logic like ArrayVisualizer - higher value = faster
      const delay = 500 - animationSpeed;
      await sleep(Math.max(delay, 50)); // Minimum 50ms delay
    }

    if (!shouldStopRef.current) {
      if (result.solutions.length > 0) {
        setMessage(`✅ Found ${result.solutions.length} solution(s)! Visualization complete.`);
      } else {
        setMessage('❌ No solution found for this problem.');
      }
    }

    setIsAnimating(false);
    shouldStopRef.current = false;
  };

  // Handle pause/resume - FIXED
  const handlePauseResume = () => {
    if (!isAnimating) return;
    
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    isPausedRef.current = newPausedState;
    
    if (newPausedState) {
      setMessage('⏸️ Animation paused');
    } else {
      setMessage('▶️ Animation resumed');
    }
  };

  // Update visualization based on current step
  const updateVisualization = (step, stepIndex) => {
    if (algorithm === 'nqueens') {
      const newBoard = initializeNQueens();
      
      // Show current queens placement
      if (step.currentQueens) {
        step.currentQueens.forEach(({ row, col }) => {
          newBoard[row][col].value = 'Q';
          newBoard[row][col].state = 'filled';
        });
      }
      
      // Highlight current cell being evaluated
      if (step.row !== undefined && step.col !== undefined) {
        newBoard[step.row][step.col].state = 
          step.type === 'place' ? 'solution' :
          step.type === 'conflict' ? 'conflict' : 
          step.type === 'backtrack' ? 'backtracked' : 'current';
        
        if (step.type === 'backtrack') {
          newBoard[step.row][step.col].animation = 'pulse';
        }
      }
      
      setBoard(newBoard);
    } 
    else if (algorithm === 'sudoku') {
      const newBoard = initializeSudoku();
      
      // Update board state from step
      if (step.board) {
        step.board.forEach((row, rowIndex) => {
          row.forEach((value, colIndex) => {
            if (value !== 0) {
              newBoard[rowIndex][colIndex].value = value;
              newBoard[rowIndex][colIndex].state = 
                newBoard[rowIndex][colIndex].original ? 'filled' : 'solution';
            }
          });
        });
      }
      
      // Highlight current cell
      if (step.row !== undefined && step.col !== undefined) {
        newBoard[step.row][step.col].state = 
          step.type === 'place-number' ? 'solution' :
          step.type === 'conflict' ? 'conflict' :
          step.type === 'backtrack' ? 'backtracked' : 'current';
      }
      
      setBoard(newBoard);
    }
    else if (algorithm === 'maze') {
      const newBoard = initializeMaze();
      
      // Show solution path
      if (step.path) {
        step.path.forEach(([row, col]) => {
          newBoard[row][col].state = 'solution';
          newBoard[row][col].isSolutionPath = true;
        });
      }
      
      // Highlight current cell
      if (step.row !== undefined && step.col !== undefined) {
        newBoard[step.row][step.col].state = 
          step.type === 'backtrack' ? 'backtracked' : 'current';
      }
      
      setBoard(newBoard);
    }
  };

  // Get cell color based on state
  const getCellColor = (cell) => {
    switch (cell.state) {
      case 'filled':
        return '#3B82F6'; // Blue - original filled cell
      case 'conflict':
        return '#EF4444'; // Red - conflict
      case 'current':
        return '#F59E0B'; // Yellow - current cell being evaluated
      case 'solution':
        return '#10B981'; // Green - part of solution
      case 'visited':
        return '#6B7280'; // Gray - visited
      case 'backtracked':
        return '#8B5CF6'; // Purple - backtracked
      default:
        return cell.value === 1 ? '#1F2937' : '#4B5563'; // Dark for walls, gray for empty
    }
  };

  // Get algorithm description
  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case 'nqueens':
        return 'Place N queens on an N×N chessboard so that no two queens threaten each other.';
      case 'sudoku':
        return 'Fill the 9×9 grid with digits so that each column, row, and 3×3 subgrid contains all digits from 1 to 9.';
      case 'maze':
        return 'Find a path from the start (top-left) to the end (bottom-right) of the maze.';
      case 'permutations':
        return 'Generate all possible arrangements of a set of elements.';
      case 'subset-sum':
        return 'Find all subsets of numbers that add up to a given target sum.';
      default:
        return 'Select a backtracking algorithm to see its description.';
    }
  };

  // Get algorithm complexity
  const getAlgorithmComplexity = () => {
    switch (algorithm) {
      case 'nqueens':
        return {
          time: 'O(N!)',
          space: 'O(N)',
          description: 'Factorial time due to N! possible arrangements'
        };
      case 'sudoku':
        return {
          time: 'O(9^M)',
          space: 'O(1)',
          description: 'Exponential in number of empty cells M'
        };
      case 'maze':
        return {
          time: 'O(4^N)',
          space: 'O(N)',
          description: 'Exponential in path length N'
        };
      case 'permutations':
        return {
          time: 'O(N!)',
          space: 'O(N)',
          description: 'Factorial time for N elements'
        };
      case 'subset-sum':
        return {
          time: 'O(2^N)',
          space: 'O(N)',
          description: 'Exponential - all subsets of N elements'
        };
      default:
        return { time: '', space: '', description: '' };
    }
  };

  const complexity = getAlgorithmComplexity();

  // Render specific controls based on algorithm
  const renderAlgorithmControls = () => {
    switch (algorithm) {
      case 'nqueens':
        return (
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300">Board Size (N)</span>
            </label>
            <input 
              type="range" 
              min="4" 
              max="8" 
              value={boardSize}
              onChange={(e) => setBoardSize(parseInt(e.target.value))}
              className="range range-primary"
              disabled={isAnimating}
            />
            <div className="text-center text-sm text-gray-400">
              {boardSize} × {boardSize} board
            </div>
          </div>
        );
      case 'maze':
        return (
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300">Maze Size</span>
            </label>
            <select 
              className="select select-bordered bg-gray-700 text-white border-gray-600"
              value={mazeSize}
              onChange={(e) => setMazeSize(parseInt(e.target.value))}
              disabled={isAnimating}
            >
              <option value="5">5 × 5</option>
              <option value="8">8 × 8</option>
              <option value="10">10 × 10</option>
            </select>
          </div>
        );
      case 'permutations':
        return (
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300">Number of Elements</span>
            </label>
            <input 
              type="range" 
              min="3" 
              max="6" 
              value={permutationSize}
              onChange={(e) => setPermutationSize(parseInt(e.target.value))}
              className="range range-primary"
              disabled={isAnimating}
            />
            <div className="text-center text-sm text-gray-400">
              {permutationSize} elements - {Array.from({length: permutationSize}, (_, i) => i + 1).join(', ')}
            </div>
          </div>
        );
      case 'subset-sum':
        return (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Numbers (comma-separated)</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered bg-gray-700 text-white border-gray-600"
                value={subsetNumbers}
                onChange={(e) => setSubsetNumbers(e.target.value)}
                placeholder="e.g., 1,2,3,4,5"
                disabled={isAnimating}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Target Sum</span>
              </label>
              <input 
                type="number" 
                className="input input-bordered bg-gray-700 text-white border-gray-600"
                value={subsetTarget}
                onChange={(e) => setSubsetTarget(parseInt(e.target.value))}
                disabled={isAnimating}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Get speed label based on animation speed value - FIXED for reversed logic
  const getSpeedLabel = () => {
    if (animationSpeed >= 400) return 'Very Fast';
    if (animationSpeed >= 300) return 'Fast';
    if (animationSpeed >= 200) return 'Medium';
    if (animationSpeed >= 100) return 'Slow';
    return 'Very Slow';
  };

  // Render visualization based on algorithm
  const renderVisualization = () => {
    if (algorithm === 'permutations' || algorithm === 'subset-sum') {
      return (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-96">
          <div className="text-center text-gray-400 py-8">
            {algorithm === 'permutations' 
              ? `Permutations of ${permutationSize} elements will be generated step by step.`
              : `Subset sum solutions for numbers [${subsetNumbers}] and target ${subsetTarget} will be found.`
            }
          </div>
          
          {solutions.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-white">
                  Solutions ({solutions.length} found)
                </h4>
                <div className="text-sm text-gray-400">
                  {solutions.length > 1 && (
                    <select 
                      className="select select-bordered select-sm bg-gray-700 text-white"
                      value={currentSolution}
                      onChange={(e) => setCurrentSolution(parseInt(e.target.value))}
                    >
                      {solutions.map((_, index) => (
                        <option key={index} value={index}>
                          Solution {index + 1}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {solutions.map((solution, index) => (
                  <div 
                    key={index} 
                    className={`bg-gray-800 p-4 rounded-lg border-2 transition-all ${
                      index === currentSolution ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'
                    }`}
                  >
                    <div className="text-sm font-mono text-gray-300">
                      {algorithm === 'permutations' 
                        ? `[${solution.join(', ')}]`
                        : `{${solution.join(', ')}} = ${subsetTarget}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Solution {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        {/* Fixed grid layout */}
        <div 
          className="grid gap-1 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${board[0]?.length || boardSize}, minmax(0, 1fr))`,
            width: 'fit-content'
          }}
        >
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <div
                key={cell.id}
                className={`
                  w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border transition-all duration-300
                  ${algorithm === 'sudoku' 
                    ? `border-gray-600 ${(colIndex === 2 || colIndex === 5) ? 'border-r-2 border-r-gray-400' : ''} ${(rowIndex === 2 || rowIndex === 5) ? 'border-b-2 border-b-gray-400' : ''}`
                    : 'border-gray-700'
                  }
                  ${cell.animation === 'pulse' ? 'animate-pulse' : ''}
                `}
                style={{
                  backgroundColor: getCellColor(cell),
                  boxShadow: cell.highlighted ? '0 0 10px rgba(245, 158, 11, 0.8)' : 'none'
                }}
              >
                {cell.value && (
                  <span className={`font-bold text-sm ${
                    cell.original ? 'text-white' : 
                    cell.state === 'solution' ? 'text-green-100' : 
                    cell.state === 'backtracked' ? 'text-purple-100' : 'text-gray-200'
                  }`}>
                    {cell.value}
                  </span>
                )}
              </div>
            ))
          ))}
        </div>

        {algorithm === 'nqueens' && (
          <div className="mt-4 text-center text-sm text-gray-400">
            {boardSize} Queens Problem - Place queens so none attack each other
          </div>
        )}

        {algorithm === 'maze' && (
          <div className="mt-4 text-center text-sm text-gray-400">
            🟢 Start (0,0) → 🔴 End ({board.length-1},{board[0]?.length-1}) | Green path shows solution
          </div>
        )}
      </div>
    );
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
          <h1 className="text-4xl font-bold text-white mb-2">Backtracking Algorithm Visualizer</h1>
          <p className="text-lg text-gray-300">Visualize systematic exploration of solution spaces with backtracking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Algorithm Selection */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Backtracking Problems</h3>
                
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
                    <option value="nqueens">N-Queens Problem</option>
                    <option value="sudoku">Sudoku Solver</option>
                    <option value="maze">Maze Solver</option>
                    <option value="permutations">Permutations</option>
                    <option value="subset-sum">Subset Sum</option>
                  </select>
                </div>

                {renderAlgorithmControls()}

                <div className="flex gap-2 mt-4">
                  <button 
                    className="btn btn-primary flex-1"
                    onClick={solveProblem}
                    disabled={isAnimating}
                  >
                    {isAnimating ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      `Solve ${algorithm.charAt(0).toUpperCase() + algorithm.slice(1)}`
                    )}
                  </button>
                  
                  <button 
                    className="btn btn-outline btn-error"
                    onClick={resetVisualization}
                    disabled={!isAnimating && currentStep === 0}
                  >
                    Reset
                  </button>
                </div>

                {isAnimating && (
                  <div className="form-control">
                    <button 
                      className="btn btn-outline btn-warning mt-2"
                      onClick={handlePauseResume}
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
                    max="450" 
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                    className="range range-primary"
                    disabled={isAnimating}
                  />
                  {/* FIXED: Correct speed labels - higher value = faster animation */}
                  <div className="text-center text-sm text-gray-400">
                    {getSpeedLabel()} (delay: {500 - animationSpeed}ms)
                  </div>
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

                {solutions.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-gray-700">
                    <div className="text-lg font-bold text-green-400">
                      ✅ Found {solutions.length} solution(s)
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {algorithm === 'nqueens' && `${solutions.length} valid arrangement(s)`}
                      {algorithm === 'permutations' && `${solutions.length} permutation(s)`}
                      {algorithm === 'subset-sum' && `${solutions.length} subset(s) sum to ${subsetTarget}`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time Complexity */}
            {showComplexity && (
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
                    <div className="text-xs text-gray-400 mt-2">
                      {complexity.description}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backtracking Explanation */}
            {showExplanations && (
              <div className="card bg-gray-800 shadow-lg border border-gray-700">
                <div className="card-body">
                  <h3 className="card-title text-white">Backtracking Concept</h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p><strong>Backtracking</strong> systematically explores decision trees by:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li><strong>Choose</strong>: Make a candidate choice</li>
                      <li><strong>Explore</strong>: Recursively solve with the choice</li>
                      <li><strong>Unchoose</strong>: Backtrack if choice leads to dead end</li>
                    </ol>
                    <p><strong>Key Insight</strong>: Prunes impossible branches early, more efficient than brute force.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700">
              <div className="card-body">
                <h3 className="card-title text-white">Visual Legend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-gray-300">Filled/Original</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-300">Current Cell</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-300">Solution Path</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-300">Conflict</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-gray-300">Backtracked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    <span className="text-gray-300">Empty/Wall</span>
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
                  <div className="text-sm text-gray-400 text-right max-w-md">
                    {getAlgorithmDescription()}
                  </div>
                </div>

                {renderVisualization()}

                {/* Algorithm Process */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Backtracking Process</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">How It Works</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Systematically explores all possibilities</li>
                        <li>• Abandons partial candidates that cannot be completed</li>
                        <li>• Uses recursion to explore decision tree</li>
                        <li>• Backtracks when constraints are violated</li>
                        <li>• More efficient than brute force</li>
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-bold text-white mb-2">Key Steps</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>1. <strong>Base Case</strong>: Check if solution is complete</li>
                        <li>2. <strong>Choose</strong>: Make a candidate choice</li>
                        <li>3. <strong>Validate</strong>: Check if choice is valid</li>
                        <li>4. <strong>Explore</strong>: Recursively solve with choice</li>
                        <li>5. <strong>Backtrack</strong>: Undo choice if it fails</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Applications and Optimization */}
            <div className="card bg-gray-800 shadow-lg border border-gray-700 mt-6">
              <div className="card-body">
                <h3 className="card-title text-white">Backtracking Applications & Optimization</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-2">Common Applications</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Puzzle Solving</strong>: Sudoku, Crosswords, N-Queens</li>
                      <li>• <strong>Combinatorial Problems</strong>: Permutations, Combinations</li>
                      <li>• <strong>Path Finding</strong>: Mazes, Route Planning</li>
                      <li>• <strong>Constraint Satisfaction</strong>: Graph Coloring, Scheduling</li>
                      <li>• <strong>Optimization</strong>: Knapsack, Subset Sum</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Optimization Techniques</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Pruning</strong>: Eliminate impossible branches early</li>
                      <li>• <strong>Heuristics</strong>: Choose most promising paths first</li>
                      <li>• <strong>Memoization</strong>: Cache previously computed results</li>
                      <li>• <strong>Constraint Propagation</strong>: Reduce search space</li>
                      <li>• <strong>Symmetry Breaking</strong>: Avoid duplicate solutions</li>
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

export default BacktrackingVisualizer;

