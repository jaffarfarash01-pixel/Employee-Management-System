
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

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <p>View project information and details</p>
        </div>

        <button onClick={() => navigate("/projects")}>
          Back to Projects
        </button>
      </div>

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

        <p>
          <strong>Status:</strong>{" "}
          <span className={`project-status ${project.status}`}>
            {project.status}
          </span>
        </p>

        <p>
          <strong>Created:</strong>{" "}
          {project.createdAt
            ? new Date(project.createdAt).toLocaleDateString()
            : "-"}
        </p>
      </div>
    </div>
  );
}

export default ProjectDetails;
