import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock3,
  CalendarDays,
  WalletCards,
  Megaphone,
  Settings,
  LogOut,
  ChevronDown,
  FolderKanban,
} from "lucide-react";
import { useState } from "react";

function Sidebar({ collapsed, mobileOpen, closeMobile }) {
  const navigate = useNavigate();

  const [employeesOpen, setEmployeesOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    window.location.href = "/login";
  };

  const dashboardPath =
    role === "admin" ? "/admin" : role === "manager" ? "/manager" : "/employee";

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={closeMobile} />}

      <aside
        className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Building2 size={22} />
          </div>

          {!collapsed && (
            <div className="logo-text">
              <strong>Employee</strong>
              <span>Management System</span>
            </div>
          )}
        </div>

        {/* Main */}
        <div className="sidebar-section-title">{!collapsed && "MAIN"}</div>

        <nav className="sidebar-nav">
          {/* Dashboard */}
          <NavLink
            to={dashboardPath}
            className="sidebar-link"
            onClick={closeMobile}
          >
            <LayoutDashboard size={20} />

            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          {/* Employees */}
          {(role === "admin" || role === "manager") && (
            <>
              <button
                className="sidebar-link sidebar-menu-button"
                onClick={() => setEmployeesOpen(!employeesOpen)}
              >
                <Users size={20} />

                {!collapsed && (
                  <>
                    <span>Employees</span>

                    <ChevronDown
                      size={16}
                      className={employeesOpen ? "rotate-icon" : ""}
                    />
                  </>
                )}
              </button>

              {!collapsed && employeesOpen && (
                <div className="sidebar-submenu">
                  <NavLink to="/employees" onClick={closeMobile}>
                    All Employees
                  </NavLink>

                  <NavLink to="/employees/add" onClick={closeMobile}>
                    Add Employee
                  </NavLink>
                </div>
              )}
            </>
          )}

          {/* Departments */}
          {(role === "admin" || role === "manager") && (
            <NavLink
              to="/departments"
              className="sidebar-link"
              onClick={closeMobile}
            >
              <Building2 size={20} />

              {!collapsed && <span>Departments</span>}
            </NavLink>
          )}

          {/* Projects */}
          {(role === "admin" || role === "manager") && (
            <NavLink
              to="/projects"
              className="sidebar-link"
              onClick={closeMobile}
            >
              <FolderKanban size={20} />

              {!collapsed && <span>Projects</span>}
            </NavLink>
          )}

          {/* Attendance */}
          <button
            className="sidebar-link sidebar-menu-button"
            onClick={() => setAttendanceOpen(!attendanceOpen)}
          >
            <Clock3 size={20} />

            {!collapsed && (
              <>
                <span>Attendance</span>

                <ChevronDown
                  size={16}
                  className={attendanceOpen ? "rotate-icon" : ""}
                />
              </>
            )}
          </button>

          {!collapsed && attendanceOpen && (
            <div className="sidebar-submenu">
              {role === "employee" && (
                <NavLink to="/employee/attendance" onClick={closeMobile}>
                  My Attendance
                </NavLink>
              )}

              {(role === "admin" || role === "manager") && (
                <NavLink to="/attendance" onClick={closeMobile}>
                  Attendance Dashboard
                </NavLink>
              )}
            </div>
          )}

          {/* Leave */}
          <button
            className="sidebar-link sidebar-menu-button"
            onClick={() => setLeaveOpen(!leaveOpen)}
          >
            <CalendarDays size={20} />

            {!collapsed && (
              <>
                <span>Leave Management</span>

                <ChevronDown
                  size={16}
                  className={leaveOpen ? "rotate-icon" : ""}
                />
              </>
            )}
          </button>

          {!collapsed && leaveOpen && (
            <div className="sidebar-submenu">
              {role === "employee" && (
                <>
                  <NavLink to="/employee/apply-leave" onClick={closeMobile}>
                    Apply Leave
                  </NavLink>

                  <NavLink to="/employee/my-leaves" onClick={closeMobile}>
                    My Leaves
                  </NavLink>
                </>
              )}

              {role === "admin" && (
                <NavLink to="/admin/leaves" onClick={closeMobile}>
                  Leave Requests
                </NavLink>
              )}

              {role === "manager" && (
                <NavLink to="/manager/leaves" onClick={closeMobile}>
                  Leave Requests
                </NavLink>
              )}
            </div>
          )}

          {/* Payroll */}
          <button
            className="sidebar-link sidebar-menu-button"
            onClick={() => alert("Payroll module coming next")}
          >
            <WalletCards size={20} />

            {!collapsed && <span>Payroll</span>}
          </button>

          {/* Announcements */}
          <button
            className="sidebar-link sidebar-menu-button"
            onClick={() => alert("Announcements module coming next")}
          >
            <Megaphone size={20} />

            {!collapsed && <span>Announcements</span>}
          </button>
        </nav>

        {/* System */}
        <div className="sidebar-bottom">
          <div className="sidebar-section-title">{!collapsed && "SYSTEM"}</div>

          <button
            className="sidebar-link sidebar-menu-button"
            onClick={() => alert("Settings page coming next")}
          >
            <Settings size={20} />

            {!collapsed && <span>Settings</span>}
          </button>

          <button className="sidebar-link logout-button" onClick={handleLogout}>
            <LogOut size={20} />

            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
