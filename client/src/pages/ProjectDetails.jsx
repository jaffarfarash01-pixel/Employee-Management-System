
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `http://localhost:5000/api/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load project");
          return;
        }

        setProject(data);
      } catch (error) {
        console.error(error);
        alert("Server connection failed");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return <p>Loading project details...</p>;
  }

  if (!project) {
    return <p>Project not found.</p>;
  }

  const taskStats = project.taskStats || {
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    progress: 0,
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "-";

  return (
    <div className="admin-dashboard project-details-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <p>View project information and track its tasks</p>
        </div>

        <button onClick={() => navigate("/projects")}>
          Back to Projects
        </button>
      </div>

      {/* Project Information */}
      <div className="project-details-card">
        <h2>Project Information</h2>

        <p>
          <strong>Description:</strong>{" "}
          {project.description || "No description available"}
        </p>

        <p>
          <strong>Department:</strong>{" "}
          {project.department?.name || "Not assigned"}
        </p>

        <p>
          <strong>Manager:</strong>{" "}
          {project.manager?.name || "Not assigned"}
        </p>

        <p>
          <strong>Manager Email:</strong>{" "}
          {project.manager?.email || "-"}
        </p>

        <p>
          <strong>Start Date:</strong>{" "}
          {formatDate(project.startDate)}
        </p>

        <p>
          <strong>End Date:</strong>{" "}
          {formatDate(project.endDate)}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span className={`project-status ${project.status}`}>
            {project.status}
          </span>
        </p>

        <p>
          <strong>Created:</strong>{" "}
          {formatDate(project.createdAt)}
        </p>
      </div>

      {/* Task Summary */}
      <div className="project-task-summary">
        <div className="project-summary-card">
          <h3>Total Tasks</h3>
          <p>{taskStats.total}</p>
        </div>

        <div className="project-summary-card">
          <h3>Completed</h3>
          <p>{taskStats.completed}</p>
        </div>

        <div className="project-summary-card">
          <h3>In Progress</h3>
          <p>{taskStats.inProgress}</p>
        </div>

        <div className="project-summary-card">
          <h3>To Do</h3>
          <p>{taskStats.todo}</p>
        </div>
      </div>

      {/* Overall Task Progress */}
      <div className="project-details-card">
        <div className="project-progress-header">
          <h2>Overall Task Progress</h2>
          <span>{taskStats.progress}%</span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${taskStats.progress}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="project-details-card project-tasks-card">
        <div className="project-tasks-header">
          <div>
            <h2>Project Tasks</h2>
            <p>Tasks assigned to this project and their current status</p>
          </div>

          <span>{taskStats.total} tasks</span>
        </div>

        {!project.tasks || project.tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>There are no tasks assigned to this project.</p>
          </div>
        ) : (
          <div className="project-tasks-table-wrapper">
            <table className="project-tasks-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {project.tasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div className="task-title">
                        {task.title}
                      </div>

                      <div className="task-description">
                        {task.description || "No description"}
                      </div>
                    </td>

                    <td>
                      {task.assignedTo?.length > 0
                        ? task.assignedTo
                            .map((employee) => employee.name)
                            .join(", ")
                        : "Unassigned"}
                    </td>

                    <td>
                      <span
                        className={`task-priority ${task.priority}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td>{formatDate(task.dueDate)}</td>

                    <td>
                      <span
                        className={`task-status ${task.status}`}
                      >
                        {task.status === "in-progress"
                          ? "In Progress"
                          : task.status === "todo"
                          ? "To Do"
                          : task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetails;
