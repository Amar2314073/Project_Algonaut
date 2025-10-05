import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { fetchAllProblems } from "../problemSlice";

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  const getProfilePicUrl = (user) => {
    if (!user) return 'https://www.gravatar.com/avatar/?d=mp&s=200';
    return user.image || 'https://www.gravatar.com/avatar/?d=mp&s=200';
  };

  // Fetch all problems from redux thunk
  const { data: problems, loading, error } = useSelector((state) => state.allProblems);

  useEffect(() => {
    dispatch(fetchAllProblems());
  }, [dispatch]);

  // Fetch solved problems
  useEffect(() => {
    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data || []);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
        setSolvedProblems([]);
      }
    };

    if (isAuthenticated && user) {
      fetchSolvedProblems();
    } else {
      setSolvedProblems([]);
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleAdminClick = () => {
    navigate("/admin", { replace: true });
  };

  const handleProfileClick = () => {
    navigate("/profile", { replace: true });
  };

  const handleDSAVisualizerClick = () => {
    navigate('/dsaVisualizer', {replace:true});
  }

  // Filter logic
  const filteredProblems = (problems || []).filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty?.toLowerCase() === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags?.toLowerCase() === filters.tag;
    const statusMatch = filters.status === 'all' || 
      (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));
    return difficultyMatch && tagMatch && statusMatch;
  });

  // Get unique tags for filter dropdown
  const uniqueTags = [...new Set((problems || []).map(problem => problem.tags).filter(Boolean))];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to continue</h1>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-lg px-4 sticky top-0 z-50">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl">Algonaut</NavLink>
        </div>

         {/* Center: DSA Visualizer Button */}
        <div className="flex-none">
          <button 
            className="btn btn-outline btn-success mx-2"
            onClick={handleDSAVisualizerClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            DSA Visualizer
          </button>
        </div>

        {/* Profile / Avatar Dropdown */}
        <div className="flex-none gap-4">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost gap-2 normal-case cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src={getProfilePicUrl(user)} alt="profile" />
                  </div>
                </div>
                <span className="hidden md:inline">{user?.firstName || 'User'}</span>
                <svg className="w-4 h-4 hidden md:inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </label>

            <ul tabIndex={0} className="dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-64">
              <div className="card card-compact w-full bg-base-100">
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img src={getProfilePicUrl(user)} alt="profile large" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User'}
                      </div>
                      <div className="text-xs opacity-60">{user?.emailId || 'No email'}</div>
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={handleProfileClick}
                      className="btn btn-ghost justify-start normal-case"
                    >
                      View Profile
                    </button>

                    {user?.role === 'admin' && (
                      <button 
                        onClick={handleAdminClick}
                        className="btn btn-ghost justify-start normal-case gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                        Admin Panel
                      </button>
                    )}

                    <button 
                      onClick={handleLogout} 
                      className="btn btn-error btn-sm mt-1"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-base-content mb-2">
            Welcome back, {user?.firstName || 'Coder'}!
          </h1>
          <p className="text-lg text-base-content/70">
            {solvedProblems.length > 0 
              ? `You've solved ${solvedProblems.length} problem${solvedProblems.length > 1 ? 's' : ''} so far. Keep going!`
              : 'Start your coding journey by solving your first problem!'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-base-100 rounded-lg shadow-sm">
          <select 
            className="select select-bordered select-sm md:select-md"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
          </select>

          <select 
            className="select select-bordered select-sm md:select-md"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select 
            className="select select-bordered select-sm md:select-md"
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          >
            <option value="all">All Tags</option>
            {uniqueTags.map(tag => (
              <option key={tag} value={tag.toLowerCase()}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </option>
            ))}
          </select>

          <div className="flex-1"></div>
          
          <div className="stat p-0">
            <div className="stat-title text-sm">Problems Solved</div>
            <div className="stat-value text-2xl">{solvedProblems.length}</div>
          </div>
        </div>

        {/* Problems List */}
        {loading && (
          <div className="flex justify-center my-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
        
        {error && (
          <div className="alert alert-error mb-4">
            <span>Error loading problems: {error}</span>
          </div>
        )}

        {!loading && filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No problems found</h3>
            <p className="text-base-content/70 mb-4">
              Try adjusting your filters to see more problems.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setFilters({ difficulty: 'all', tag: 'all', status: 'all' })}
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="grid gap-4">
          {filteredProblems.map(problem => (
            <div key={problem._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="card-body">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="card-title text-lg md:text-xl hover:text-primary transition-colors">
                      <NavLink to={`/problem/${problem._id}`} className="hover:text-primary">
                        {problem.title}
                      </NavLink>
                    </h2>
                    <p className="text-base-content/70 text-sm mt-1 line-clamp-2">
                      {problem.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)} badge-lg`}>
                        {problem.difficulty}
                      </div>
                      <div className="badge badge-info badge-lg">
                        {problem.tags}
                      </div>
                    </div>
                    
                    {solvedProblems.some(sp => sp._id === problem._id) && (
                      <div className="badge badge-success badge-lg gap-2">
                        ✅ Solved
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="card-actions justify-end mt-4">
                  <NavLink 
                    to={`/problem/${problem._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Solve Problem
                  </NavLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  if (!difficulty) return 'badge-neutral';
  
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;