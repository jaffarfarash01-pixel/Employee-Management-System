import { Link } from "react-router-dom";
import { FolderKanban } from "lucide-react";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <aside>
      <h3>Menu</h3>

      <ul>
        {/* Dashboard */}
        <li>
          <Link to={`/${user.role}`}>
            Dashboard
          </Link>
        </li>

        {/* Employee Menu */}
        {user.role === "employee" && (
          <>
            <li>
              <Link to="/employee/apply-leave">
                Apply Leave
              </Link>
            </li>

            <li>
              <Link to="/employee/my-leaves">
                My Leaves
              </Link>
            </li>
          </>
        )}

        {/* Admin / Manager Menu */}
        {(user.role === "admin" ||
          user.role === "manager") && (
          <>
            <li>
              <Link to={`/${user.role}/leaves`}>
                Leave Requests
              </Link>
            </li>

            <li>
              <Link to="/create-announcement">
                Announcements
              </Link>
            </li>

            <li>
              <Link to="/employees">
                Employees
              </Link>
            </li>

            <li>
              <Link to="/departments">
                Departments
              </Link>
            </li>

            {/* Projects */}
            <li>
              <Link to="/projects">
                <FolderKanban size={18} />
                Projects
              </Link>
            </li>

            <li>
              <Link to="/tasks">
                Tasks
              </Link>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
}

export default Sidebar;