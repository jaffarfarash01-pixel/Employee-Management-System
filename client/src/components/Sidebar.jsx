import { Link } from "react-router-dom";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <aside>
      <h3>Menu</h3>

      <ul>
        <li>
          <Link to={`/${user.role}`}>Dashboard</Link>
        </li>

        {user.role === "employee" && (
          <>
            <li>
              <Link to="/employee/apply-leave">Apply Leave</Link>
            </li>

            <li>
              <Link to="/employee/my-leaves">My Leaves</Link>
            </li>
          </>
        )}

        {(user.role === "admin" || user.role === "manager") && (
          <>
            <li>
              <Link to={`/${user.role}/leaves`}>Leave Requests</Link>
            </li>
            <li>
              <Link to="/create-announcement">Announcements</Link>
            </li>
            <li>
              <Link to="/employees">Employees</Link>
            </li>
          </>
        )}

        <li>Departments</li>
        <li>Projects</li>
        <li>Tasks</li>
      </ul>
    </aside>
  );
}

export default Sidebar;
