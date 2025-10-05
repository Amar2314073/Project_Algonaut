import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { fetchAllProblems } from "../problemSlice";

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
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
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    if (user) fetchSolvedProblems();
    else setSolvedProblems([]);
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  // Filter logic
  const filteredProblems = (problems || []).filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch =
      filters.status === 'all' ||
      (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));
    return difficultyMatch && tagMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-lg px-4">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl">Algonaut</NavLink>
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
                <span className="hidden md:inline">{user?.firstName || 'Guest'}</span>
                <svg className="w-4 h-4 hidden md:inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </label>

            <ul tabIndex={0} className="dropdown-content mt-2 p-0 w-64 shadow-lg">
              <div className="card card-compact w-64 bg-base-100">
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img src={getProfilePicUrl(user)} alt="profile large" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Guest'}
                      </div>
                      <div className="text-xs opacity-60">{user?.emailId || 'User'}</div>
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  <div className="flex flex-col gap-2">
                    <NavLink to="/profile" className="btn btn-ghost justify-start normal-case">View Profile</NavLink>

                    {user?.role === 'admin' && (
                      <NavLink to="/admin" className="btn btn-ghost justify-start normal-case gap-2">
                        {/* Dashboard icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                        Admin Panel
                      </NavLink>
                    )}


                    <button onClick={handleLogout} className="btn btn-error btn-sm mt-1">Logout</button>
                  </div>
                </div>
              </div>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select 
            className="select select-bordered"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
          </select>

          <select 
            className="select select-bordered"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select 
            className="select select-bordered"
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          >
            <option value="all">All Tags</option>
            <option value="array">Array</option>
            <option value="linkedList">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">DP</option>
          </select>
        </div>

        {/* Problems List */}
        {loading && <p className="text-center">Loading problems...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid gap-4">
          {filteredProblems.map(problem => (
            <div key={problem._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">
                    <NavLink to={`/problem/${problem._id}`} className="hover:text-primary">
                      {problem.title}
                    </NavLink>
                  </h2>
                  {solvedProblems.some(sp => sp._id === problem._id) && (
                    <div className="badge badge-success gap-2">
                      ✅ Solved
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </div>
                  <div className="badge badge-info">
                    {problem.tags}
                  </div>
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
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;
