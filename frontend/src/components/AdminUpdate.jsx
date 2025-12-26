import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { fetchAllProblems } from "../problemSlice";

const AdminUpdate = () => {
  const dispatch = useDispatch();
  const { data: problems, loading, error } = useSelector(
    (state) => state.allProblems
  );

  const [editingProblem, setEditingProblem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "",
    tags: "",
  });

  useEffect(() => {
    if (!problems || problems.length === 0) {
      dispatch(fetchAllProblems());
    }
  }, [dispatch, problems]);

  const handleEditClick = (problem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags,
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/problem/update/${editingProblem._id}`, formData);
      alert("Problem updated successfully!");
      setEditingProblem(null);
      dispatch(fetchAllProblems());
    } catch (err) {
      console.error("Failed to update problem:", err);
      alert("Failed to update problem");
    }
  };

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Update Problems</h1>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems?.map((problem, index) => (
              <tr key={problem._id}>
                <th>{index + 1}</th>
                <td>{problem.title}</td>
                <td>{problem.difficulty}</td>
                <td>{problem.tags}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleEditClick(problem)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update Form */}
      {editingProblem && (
        <div className="mt-6 p-4 border rounded bg-base-100">
          <h2 className="text-xl font-bold mb-4">Update: {editingProblem.title}</h2>
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="select select-bordered"
              required
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <input
              type="text"
              name="tags"
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={handleChange}
              className="input input-bordered"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn btn-success">Update</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingProblem(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUpdate;
