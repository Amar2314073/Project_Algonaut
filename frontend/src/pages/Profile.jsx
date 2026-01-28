import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate, useLocation } from "react-router";
import axiosClient from "../utils/axiosClient";
import { logoutUser, updateUser } from "../authSlice";
import { fetchAllProblems } from "../problemSlice";
import { Home } from "lucide-react";

// Circular progress component
const CircularProgress = ({ progress }) => {
  const radius = 50;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#22c55e"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#2563eb"
        fontSize="18"
        fontWeight="bold"
      >
        {progress}%
      </text>
    </svg>
  );
};

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { data: allProblems, loading: problemsLoading } = useSelector((state) => state.allProblems);
  const [solvedProblems, setSolvedProblems] = useState(null); // Start with null to track loading
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    age: "",
    image: ""
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signup");
    }
  }, [isAuthenticated, navigate]);

  // Fetch all problems if not already loaded
  useEffect(() => {
    if (isAuthenticated && (!allProblems || allProblems.length === 0)) {
      dispatch(fetchAllProblems());
    }
  }, [isAuthenticated, allProblems, dispatch]);

  // Fetch user info and solved problems
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        emailId: user.emailId || "",
        age: user.age || "",
        image: user.image || "https://www.gravatar.com/avatar/?d=mp&s=200"
      });

      const fetchSolved = async () => {
        try {
          setLoading(true);
          const { data } = await axiosClient.get("/problem/problemSolvedByUser");
          setSolvedProblems(data || []);
        } catch (err) {
          console.error("Error fetching solved problems:", err);
          setSolvedProblems([]);
        } finally {
          setLoading(false);
        }
      };
      fetchSolved();
    }
  }, [user, isAuthenticated]);

  // Calculate progress only when both allProblems and solvedProblems are available
  const totalProblems = allProblems ? allProblems.length : 0;
  const solvedCount = solvedProblems ? solvedProblems.length : 0;
  const progressPercent = totalProblems > 0 && solvedProblems !== null 
    ? Math.round((solvedCount / totalProblems) * 100) 
    : 0;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const { data } = await axiosClient.put("/user/profile", formData);
      dispatch(updateUser(data));
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleLogout = () => dispatch(logoutUser());

  const handleHomeClick = () => {
    navigate("/");
  };

  // Show loading state
  if (loading || solvedProblems === null) {
    return (
      <div className="min-h-screen bg-base-200 p-6 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg mb-4"></span>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 flex flex-col md:flex-row gap-6">

      {/* Left Sidebar: User Info */}
      <div className="w-full md:w-1/5 flex flex-col items-center md:items-start">
        <div className="card w-full bg-base-100 shadow-xl p-6 flex flex-col items-center md:items-start">
          <div className="avatar">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img 
                src={formData.image} 
                alt="profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {editMode ? (
            <div className="w-full mt-4 flex flex-col gap-2">
              <input className="input input-bordered w-full" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
              <input className="input input-bordered w-full" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
              <input className="input input-bordered w-full" name="emailId" value={formData.emailId} onChange={handleChange} placeholder="Email" />
              <input className="input input-bordered w-full" name="age" value={formData.age} onChange={handleChange} placeholder="Age" type="number"/>
              <input className="input input-bordered w-full" name="image" value={formData.image} onChange={handleChange} placeholder="Profile Image URL" />
              <div className="flex gap-2 mt-2">
                <button className="btn btn-primary" onClick={handleSave} disabled={!editMode}>Save</button>
                <button className="btn btn-ghost" onClick={()=>setEditMode(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="card-title mt-4 text-2xl text-center md:text-left">
                {user.firstName} {user.lastName || ""}
              </h2>
              <p className="opacity-70">{user.emailId}</p>
              {user.age && <p className="opacity-70">Age: {user.age}</p>}
              {user.role === 'admin' && (
                <p
                  className="badge badge-primary mt-2 cursor-pointer text-gray-800"
                  onClick={() => navigate("/admin")}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                </p>
              )}
              <button className="btn btn-primary mt-2 w-full" onClick={handleHomeClick}>
                <Home size={18} />
                Back to Home
              </button>
              <button className="btn btn-error mt-2 w-full" onClick={handleLogout}>Logout</button>
              <button className="btn btn-sm btn-outline mt-2 w-full" onClick={()=>setEditMode(true)}>Edit Profile</button>
            </>
          )}
        </div>
      </div>

      {/* Right Side: Progress + Solved Problems */}
      <div className="w-full md:w-4/5 flex flex-col gap-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat bg-base-100 rounded-lg shadow-sm">
            <div className="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Total Problems</div>
            <div className="stat-value text-primary">{totalProblems}</div>
          </div>
          
          <div className="stat bg-base-100 rounded-lg shadow-sm">
            <div className="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Solved Problems</div>
            <div className="stat-value text-secondary">{solvedCount}</div>
          </div>
          
          <div className="stat bg-base-100 rounded-lg shadow-sm">
            <div className="stat-figure text-accent">
              <div className="flex items-center justify-center">
                <CircularProgress progress={progressPercent} />
              </div>
            </div>
            <div className="stat-title">Progress</div>
            <div className="stat-value text-accent">{progressPercent}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="card bg-base-100 shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Your Progress</h3>
            <span className="text-lg font-bold">{solvedCount}/{totalProblems} problems solved</span>
          </div>
          <progress 
            className="progress progress-primary w-full h-4" 
            value={solvedCount} 
            max={totalProblems}
          ></progress>
        </div>

        {/* Problems list */}
        <div className="card bg-base-100 shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Solved Problems</h3>
          
          {solvedProblems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg opacity-70 mb-2">No problems solved yet.</p>
              <p className="text-sm opacity-50 mb-4">Start solving problems to see them here!</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate("/")}
              >
                Browse Problems
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-base-300">
              {solvedProblems.map((solvedProblem) => {
                // Use solvedProblem directly since it contains all the problem data
                const problemData = solvedProblem;
                
                return (
                  <NavLink
                    key={problemData._id}
                    to={`/problem/${problemData._id}`}
                    className="flex items-center justify-between py-4 px-4 hover:bg-base-200 transition rounded-lg group"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {problemData.title}
                      </h4>
                      <p className="text-sm opacity-70 mt-1 line-clamp-2">
                        {problemData.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2 flex-wrap justify-end">
                        <span className={`badge ${getDifficultyBadgeColor(problemData.difficulty)} px-3 py-2`}>
                          {problemData.difficulty}
                        </span>
                        <span className="badge badge-info px-3 py-2">
                          {problemData.tags}
                        </span>
                        {problemData.type && (
                          <span className="badge badge-accent px-3 py-2">
                            {problemData.type}
                          </span>
                        )}
                      </div>
                      <span className="badge badge-success ml-4 px-3 py-2">
                        ✅ Solved
                      </span>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  if (!difficulty) return "badge-neutral";
  
  switch (difficulty.toLowerCase()) {
    case "easy": return "badge-success";
    case "medium": return "badge-warning";
    case "hard": return "badge-error";
    default: return "badge-neutral";
  }
};

export default Profile;