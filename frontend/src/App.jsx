import {Routes, Route, Navigate, useLocation} from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage"
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo"
import AdminDelete from "./components/AdminDelete"
import AdminUpload from "./components/AdminUpload"
import AdminUpdate from "./components/AdminUpdate";
import Profile from "./pages/Profile";
import DSAVisualizer from "./pages/DsaVisualizer";
import SortingVisualizer from "./components/visualizers/SortingVisualizer";
import PathfindingVisualizer from "./components/visualizers/PathfindingVisualizer";
import ArrayVisualizer from "./components/visualizers/ArrayVisualizer";
import LinkedListVisualizer from "./components/visualizers/LinkedListVisualizer";
import TreeVisualizer from "./components/visualizers/TreeVisualizer";
import GraphVisualizer from "./components/visualizers/GraphVisualizer";
import StackVisualizer from "./components/visualizers/StackVisualizer";
import QueueVisualizer from "./components/visualizers/QueueVisualizer";
import SearchingVisualizer from "./components/visualizers/SearchingVisualizer";
import BacktrackingVisualizer from "./components/visualizers/BacktrackingVisualizer";
import DynamicProgrammingVisualizer from "./components/visualizers/DynamicProgrammingVisualizer";
import RecursionVisualizer from "./components/visualizers/RecursionVisualizer";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const {isAuthenticated, user, loading} = useSelector((state)=>state.auth);

  // Check authentication on app load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Show loading spinner only during initial auth check
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Protected Route wrapper function
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!isAuthenticated) {
      return <Navigate to="/signup" state={{ from: location }} replace />;
    }
    
    if (adminOnly && user?.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  // Public Route wrapper function (for login/signup when already authenticated)
  const PublicRoute = ({ children }) => {
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <>
      <Routes>
        {/* Public routes - only accessible when not authenticated */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* DSA Visualizer Routes */}
        <Route path="/dsaVisualizer" element={<ProtectedRoute><DSAVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/sorting" element={<ProtectedRoute><SortingVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/pathfinding" element={<ProtectedRoute><PathfindingVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/array" element={<ProtectedRoute><ArrayVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/linked-list" element={<ProtectedRoute><LinkedListVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/tree" element={<ProtectedRoute><TreeVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/graph" element={<ProtectedRoute><GraphVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/stack" element={<ProtectedRoute><StackVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/queue" element={<ProtectedRoute><QueueVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/searching" element={<ProtectedRoute><SearchingVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/backtracking" element={<ProtectedRoute><BacktrackingVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/dynamicProgramming" element={<ProtectedRoute><DynamicProgrammingVisualizer /></ProtectedRoute>} />
        <Route path="/dsaVisualizer/recursion" element={<ProtectedRoute><RecursionVisualizer /></ProtectedRoute>} />


        {/* Admin only routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
        <Route path="/admin/create" element={<ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>} />
        <Route path="/admin/delete" element={<ProtectedRoute adminOnly={true}><AdminDelete /></ProtectedRoute>} />
        <Route path="/admin/video" element={<ProtectedRoute adminOnly={true}><AdminVideo /></ProtectedRoute>} />
        <Route path="/admin/update" element={<ProtectedRoute adminOnly={true}><AdminUpdate /></ProtectedRoute>} />
        <Route path="/admin/upload/:problemId" element={<ProtectedRoute adminOnly={true}><AdminUpload /></ProtectedRoute>} />

        {/* Problem page - accessible to all authenticated users */}
        <Route path="/problem/:problemId" element={<ProtectedRoute><ProblemPage /></ProtectedRoute>} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;