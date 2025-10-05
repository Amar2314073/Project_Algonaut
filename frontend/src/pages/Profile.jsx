import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate, useLocation } from "react-router";
import axiosClient from "../utils/axiosClient";
import { logoutUser, updateUser } from "../authSlice";

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
  const location = useLocation(); // for refresh stay
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { data: allProblems } = useSelector((state) => state.allProblems);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    image: ""
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signup");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user info and solved problems
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        age: user.age || "",
        image: user.image || ""
      });

      const fetchSolved = async () => {
        try {
          const { data } = await axiosClient.get("/problem/problemSolvedByUser");
          setSolvedProblems(data || []);
        } catch (err) {
          console.error("Error fetching solved problems:", err);
        }
      };
      fetchSolved();
    }
  }, [user]);

  const totalProblems = allProblems ? allProblems.length : 0;
  const solvedCount = solvedProblems.length;
  const progressPercent = totalProblems ? Math.round((solvedCount / totalProblems) * 100) : 0;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const updatedUser = await axiosClient.put("/user/updateProfile", formData);
      dispatch(updateUser(updatedUser.data));
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleLogout = () => dispatch(logoutUser());

  return (
    <div className="min-h-screen bg-base-200 p-6 flex flex-col md:flex-row gap-6">

      {/* Left Sidebar: User Info */}
      <div className="w-full md:w-1/5 flex flex-col items-center md:items-start">
        <div className="card w-full bg-base-100 shadow-xl p-6 flex flex-col items-center md:items-start">
          <div className="avatar">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img src={formData.image || "https://www.gravatar.com/avatar/?d=mp&s=200"} alt="profile" />
            </div>
          </div>

          {editMode ? (
            <div className="w-full mt-4 flex flex-col gap-2">
              <input className="input input-bordered w-full" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
              <input className="input input-bordered w-full" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
              <input className="input input-bordered w-full" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
              <input className="input input-bordered w-full" name="age" value={formData.age} onChange={handleChange} placeholder="Age" type="number"/>
              <input className="input input-bordered w-full" name="image" value={formData.image} onChange={handleChange} placeholder="Profile Image URL" />
              <div className="flex gap-2 mt-2">
                <button className="btn btn-primary" onClick={handleSave}>Save</button>
                <button className="btn btn-ghost" onClick={()=>setEditMode(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="card-title mt-4 text-2xl text-center md:text-left">
                {user.firstName} {user.lastName || ""}
              </h2>
              <p className="opacity-70">{user.email}</p>
              {user.role === 'admin' && (
                <p
                  className="badge badge-primary mt-2 cursor-pointer text-gray-800"
                  onClick={() => navigate("/admin")}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                </p>
              )}
              <button className="btn btn-error mt-2 w-full" onClick={handleLogout}>Logout</button>
              <button className="btn btn-sm btn-outline mt-2 w-full" onClick={()=>setEditMode(true)}>Edit Profile</button>
            </>
          )}
        </div>
      </div>

      {/* Right Side: Progress + Solved Problems */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Circular progress */}
        <div className="flex justify-center md:justify-start mb-4">
          <CircularProgress progress={progressPercent} />
        </div>
        <h3 className="text-xl font-semibold">Problems Solved: {solvedCount}</h3>

        {/* Problems list */}
        <div className="flex flex-col divide-y divide-gray-300">
          {solvedProblems.length === 0 && <p className="opacity-70 py-2">No problems solved yet.</p>}

          {solvedProblems.map((solvedProblem) => {
            const problemData = allProblems?.find((p)=>p._id === solvedProblem._id);
            if(!problemData) return null;

            return (
              <NavLink
                key={problemData._id}
                to={`/problem/${problemData._id}`}
                className="flex items-center justify-between py-3 px-4 hover:bg-base-200 transition rounded-lg"
              >
                <h4 className="font-semibold flex-1">{problemData.title}</h4>
                <div className="flex justify-evenly flex-1 gap-2 flex-wrap">
                  <span className={`badge ${getDifficultyBadgeColor(problemData.difficulty)} px-3 py-1`}>{problemData.difficulty}</span>
                  <span className="badge badge-info px-3 py-1">{problemData.tags}</span>
                  {problemData.type && <span className="badge badge-accent px-3 py-1">{problemData.type}</span>}
                </div>
                <span className="badge badge-success ml-4 px-3 py-1">Solved</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy": return "badge-success";
    case "medium": return "badge-warning";
    case "hard": return "badge-error";
    default: return "badge-neutral";
  }
};

export default Profile;
