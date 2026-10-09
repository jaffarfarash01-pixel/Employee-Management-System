import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProjectList() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const role = localStorage.getItem("role");

  // Search Project
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.department?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // project summary calculations
  const totalProjects = projects.length;

  const activeProjects = projects.filter(
    (project) => project.status === "active",
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "completed",
  ).length;

  const planningProjects = projects.filter(
    (project) => project.status === "planning",
  ).length;

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("PROJECTS FROM API:", data);

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setProjects(data);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  // DELETE PROJECT
  const handleDelete = async (projectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete project");
        return;
      }

      alert("project deleted successfully");

      // Remove the deleted project from current list
      setProjects((previousProjects) =>
        previousProjects.filter((project) => project._id !== projectId),
      );
    } catch (error) {
      console.error(error);
      alert("server connection Failed");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return <p>Loading projects...</p>;
  }

  return (
    <div className="admin-dashboard project-list-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Projects</h1>

          <p>Manage and track your organization's projects</p>
        </div>

        {(role === "admin" || role === "manager") && (
          <button onClick={() => navigate("/projects/add")}>
            + Add Project
          </button>
        )}
      </div>

      {/* summary cards */}
      <div className="project-summary-grid">
        <div className="project-summary-card">
          <h3>Total Projects</h3>
          <p>{totalProjects}</p>
        </div>

        <div className="project-summary-card">
          <h3>Active Projects</h3>
          <p>{activeProjects}</p>
        </div>

        <div className="project-summary-card">
          <h3>Completed Projects</h3>
          <p>{completedProjects}</p>
        </div>

        <div className="project-summary-card">
          <h3>Planning Projects</h3>
          <p>{planningProjects}</p>
        </div>
      </div>

      {/* Search project */}
      <div className="project-filters">
        <input
          type="text"
          placeholder="Search by project or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Projects */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <h3>No projects found</h3>
          <p>Try changing your search or status filter.</p>
        </div>
      ) : (
        <div className="project-grid">
          {filteredProjects.map((project) => (
            <div className="project-card" key={project._id}>
              <div className="project-card-header">
                <h2>{project.name}</h2>

                <span className={`project-status ${project.status}`}>
                  {project.status}
                </span>
              </div>

              <p className="project-description">
                {project.description || "No description available."}
              </p>

              <div className="project-details">
                <p>
                  <strong>Department:</strong>{" "}
                  {project.department?.name || "Not assigned"}
                </p>

                <p>
                  <strong>Start Date:</strong>{" "}
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : "-"}
                </p>

                <p>
                  <strong>End Date:</strong>{" "}
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              {/* Project Progress */}
              <div className="project-progress">
                {project.taskStats?.total > 0 ? (
                  <>
                    <div className="project-progress-header">
                      <span>Task Progress</span>
                      <span>{project.taskStats.progress}%</span>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${project.taskStats.progress}%`,
                        }}
                      />
                    </div>

                    <div className="project-task-counts">
                      <span>Total: {project.taskStats.total}</span>
                      <span>Completed: {project.taskStats.completed}</span>
                      <span>In Progress: {project.taskStats.inProgress}</span>
                      <span>To Do: {project.taskStats.todo}</span>
                    </div>
                  </>
                ) : (
                  <p className="no-tasks-message">No tasks yet</p>
                )}
              </div>

              <div className="project-card-actions">
                <button onClick={() => navigate(`/projects/${project._id}`)}>
                  View
                </button>

                {(role === "admin" || role === "manager") && (
                  <>
                    <button
                      onClick={() => navigate(`/projects/${project._id}/edit`)}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(project._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectList;
