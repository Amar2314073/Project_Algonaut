// pages/DSAVisualizer.js
import React from 'react';
import { useNavigate } from 'react-router';

function DSAVisualizer() {
  const navigate = useNavigate();

  const dataStructures = [
    { 
      name: 'Array Visualizer', 
      description: 'Visualize array operations, sorting, and searching algorithms', 
      icon: '📊',
      route: '/dsaVisualizer/array'
    },
    { 
      name: 'Linked List Visualizer', 
      description: 'See linked list operations, insertion, deletion, and traversal', 
      icon: '🔗',
      route: '/dsaVisualizer/linked-list'
    },
    { 
      name: 'Stack Visualizer', 
      description: 'LIFO operations - push, pop, and stack algorithms', 
      icon: '📚',
      route: '/dsaVisualizer/stack'
    },
    { 
      name: 'Queue Visualizer', 
      description: 'FIFO operations - enqueue, dequeue, and queue algorithms', 
      icon: '🎯',
      route: '/dsaVisualizer/queue'
    },
    { 
      name: 'Tree Visualizer', 
      description: 'Binary tree, BST operations, and tree traversal algorithms', 
      icon: '🌳',
      route: '/dsaVisualizer/tree'
    },
    { 
      name: 'Graph Visualizer', 
      description: 'Graph traversal, pathfinding, and network algorithms', 
      icon: '🕸️',
      route: '/dsaVisualizer/graph'
    },
  ];

  const algorithms = [
    { 
      name: 'Sorting Visualizer', 
      description: 'Bubble Sort, Quick Sort, Merge Sort, Heap Sort visualizations', 
      icon: '🔄',
      route: '/dsaVisualizer/sorting'
    },
    { 
      name: 'Searching Visualizer', 
      description: 'Linear Search, Binary Search algorithm visualizations', 
      icon: '🔍',
      route: '/dsaVisualizer/searching'
    },
    { 
      name: 'Pathfinding Visualizer', 
      description: 'Dijkstra, A*, BFS, DFS pathfinding algorithms', 
      icon: '🧭',
      route: '/dsaVisualizer/pathfinding'
    },
    { 
      name: 'Backtracking Visualizer', 
      description: 'N-Queens, Sudoku solver, Maze solving algorithms', 
      icon: '♟️',
      route: '/dsaVisualizer/backtracking'
    },
    { 
      name: 'Dynamic Programming Visualizer', 
      description: 'Knapsack, Fibonacci, LCS algorithm visualizations', 
      icon: '⚡',
      route: '/dsaVisualizer/dynamicProgramming'
    },
    { 
      name: 'Recursion Visualizer', 
      description: 'Visualize recursive function calls and stack frames', 
      icon: '🔄',
      route: '/dsaVisualizer/recursion'
    },
  ];

  const handleVisualizerClick = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <button 
            className="btn btn-ghost mb-4 hover:bg-gray-700 text-white border-gray-600"
            onClick={() => navigate('/')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-5xl font-bold text-white mb-4">DSA Visualizer</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Interactive visualization of Data Structures and Algorithms. 
            See how algorithms work step by step with beautiful animations and real-time execution.
          </p>
        </div>

        {/* Data Structures Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Data Structures</h2>
            <p className="text-lg text-gray-400">Visualize fundamental data structures and their operations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataStructures.map((ds, index) => (
              <div 
                key={index} 
                className="card bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-blue-500"
                onClick={() => handleVisualizerClick(ds.route)}
              >
                <div className="card-body text-center">
                  <div className="text-6xl mb-4">{ds.icon}</div>
                  <h3 className="card-title justify-center text-xl font-bold text-white">{ds.name}</h3>
                  <p className="text-gray-300 mb-4">{ds.description}</p>
                  <div className="card-actions justify-center">
                    <button className="btn btn-primary btn-outline border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                      Explore
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Algorithms Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Algorithms</h2>
            <p className="text-lg text-gray-400">Step-by-step visualization of popular algorithms</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {algorithms.map((algo, index) => (
              <div 
                key={index} 
                className="card bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-purple-500"
                onClick={() => handleVisualizerClick(algo.route)}
              >
                <div className="card-body text-center">
                  <div className="text-5xl mb-4">{algo.icon}</div>
                  <h3 className="card-title justify-center text-lg font-bold text-white">{algo.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{algo.description}</p>
                  <div className="card-actions justify-center">
                    <button className="btn btn-secondary btn-outline border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white btn-sm">
                      Visualize
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-lg mb-12 border border-gray-700">
          <h3 className="text-3xl font-bold text-center mb-8 text-white">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="font-bold text-lg mb-2 text-white">Step-by-Step Execution</h4>
              <p className="text-gray-300">See each step of the algorithm with detailed explanations</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="font-bold text-lg mb-2 text-white">Real-time Animation</h4>
              <p className="text-gray-300">Watch algorithms in action with smooth animations</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h4 className="font-bold text-lg mb-2 text-white">Interactive Controls</h4>
              <p className="text-gray-300">Pause, play, and step through algorithms at your own pace</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Alert */}
        <div className="alert bg-gray-800 border-gray-700 shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-gray-300">More visualizations and features coming soon! Stay tuned for updates.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DSAVisualizer;