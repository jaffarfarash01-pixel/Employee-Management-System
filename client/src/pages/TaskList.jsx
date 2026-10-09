
import { useEffect, useState } from "react";

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");

  // Fetch tasks from backend
  const fetchTasks = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load tasks");
      }

      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Update task status
  const updateStatus = async (taskId, status) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      // Update the task shown on the page
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === taskId
            ? { ...task, status: data.task.status }
            : task
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update task status");
    }
  };

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  return (
    <div className="admin-dashboard task-list-page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>View and manage project tasks</p>
        </div>

        <button onClick={fetchTasks}>Refresh</button>
      </div>

      {error && <p className="task-error">{error}</p>}

      {!error && tasks.length === 0 && (
        <div className="task-empty">
          <h3>No tasks found</h3>
          <p>Tasks assigned to you or available for your role will appear here.</p>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="task-table-wrapper">
          <table className="task-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => {
                const assignedUsers = Array.isArray(task.assignedTo)
                  ? task.assignedTo
                  : [];

                const isAssignedEmployee = assignedUsers.some(
                  (user) =>
                    user._id ===
                    JSON.parse(localStorage.getItem("user") || "{}").id
                );

                const canUpdateStatus =
                  role === "admin" ||
                  role === "manager" ||
                  (role === "employee" && isAssignedEmployee);

                return (
                  <tr key={task._id}>
                    <td>
                      <strong>{task.title}</strong>
                      <p className="task-description">
                        {task.description || "No description"}
                      </p>
                    </td>

                    <td>{task.project?.name || "—"}</td>

                    <td>
                      {assignedUsers.length > 0
                        ? assignedUsers
                            .map((user) => user.name)
                            .join(", ")
                        : "—"}
                    </td>

                    <td>
                      <span className={`task-priority ${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>

                    <td>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      {canUpdateStatus ? (
                        <select
                          className={`task-status-select ${task.status}`}
                          value={task.status}
                          onChange={(event) =>
                            updateStatus(task._id, event.target.value)
                          }
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        task.status
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TaskList;
