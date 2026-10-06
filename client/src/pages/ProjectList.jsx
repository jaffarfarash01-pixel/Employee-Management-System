import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProjectList() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("role");

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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

          <p>
            Manage and track your organization's projects
          </p>
        </div>

        {(role === "admin" || role === "manager") && (
          <button
            onClick={() => navigate("/projects/add")}
          >
            + Add Project
          </button>
        )}
      </div>

      {/* Projects */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <h3>No projects found</h3>

          <p>
            There are no projects available.
          </p>
        </div>
      ) : (
        <div className="project-grid">

          {projects.map((project) => (
            <div
              className="project-card"
              key={project._id}
            >
              <div className="project-card-header">
                <h2>{project.name}</h2>

                <span
                  className={`project-status ${project.status}`}
                >
                  {project.status}
                </span>
              </div>

              <p className="project-description">
                {project.description ||
                  "No description available."}
              </p>

              <div className="project-details">

                <p>
                  <strong>Department:</strong>{" "}
                  {project.department?.name ||
                    "Not assigned"}
                </p>

                <p>
                  <strong>Start Date:</strong>{" "}
                  {project.startDate
                    ? new Date(
                        project.startDate,
                      ).toLocaleDateString()
                    : "-"}
                </p>

                <p>
                  <strong>End Date:</strong>{" "}
                  {project.endDate
                    ? new Date(
                        project.endDate,
                      ).toLocaleDateString()
                    : "-"}
                </p>

              </div>

              <div className="project-card-actions">

                <button
                  onClick={() =>
                    navigate(
                      `/projects/${project._id}`,
                    )
                  }
                >
                  View
                </button>

                {(role === "admin" ||
                  role === "manager") && (
                  <button
                    onClick={() =>
                      navigate(
                        `/projects/${project._id}/edit`,
                      )
                    }
                  >
                    Edit
                  </button>
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