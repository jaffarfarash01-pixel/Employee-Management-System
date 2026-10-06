import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";

import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

import ApplyLeave from "./pages/ApplyLeave";
import MyLeaves from "./pages/MyLeaves";
import LeaveRequests from "./pages/LeaveRequests";

import EmployeeList from "./pages/EmployeeList";
import AddEmployee from "./pages/AddEmployee";
import EmployeeDetails from "./pages/EmployeeDetails";
import EditEmployee from "./pages/EditEmployee";
import Departments from "./pages/Departments";
import DepartmentDetails from "./pages/DepartmentDetails";

import CreateAnnouncement from "./pages/CreateAnnouncement";

import MyAttendance from "./pages/MyAttendance";
import AttendanceDashboard from "./pages/AttendanceDashboard";

import ProjectList from "./pages/ProjectList";
import AddProject from "./pages/AddProject";

import Layout from "./components/layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* =========================
            ADMIN DASHBOARD
        ========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            MANAGER DASHBOARD
        ========================= */}

        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Layout>
                <ManagerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            EMPLOYEE DASHBOARD
        ========================= */}

        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Layout>
                <EmployeeDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            EMPLOYEE LEAVE
        ========================= */}

        <Route
          path="/employee/apply-leave"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Layout>
                <ApplyLeave />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/my-leaves"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Layout>
                <MyLeaves />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            ADMIN LEAVE REQUESTS
        ========================= */}

        <Route
          path="/admin/leaves"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <LeaveRequests />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            MANAGER LEAVE REQUESTS
        ========================= */}

        <Route
          path="/manager/leaves"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Layout>
                <LeaveRequests />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            EMPLOYEES
        ========================= */}

        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <EmployeeList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/add"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <AddEmployee />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <EmployeeDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <EditEmployee />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            ANNOUNCEMENT
        ========================= */}

        <Route
          path="/create-announcement"
          element={
            <Layout>
              <CreateAnnouncement />
            </Layout>
          }
        />

        {/* =========================
            EMPLOYEE ATTENDANCE
        ========================= */}

        <Route
          path="/employee/attendance"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Layout>
                <MyAttendance />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            ADMIN / MANAGER ATTENDANCE
        ========================= */}

        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <AttendanceDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Departments */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <Departments />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* dept details */}
        <Route
          path="/departments/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <DepartmentDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Project Routes */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <ProjectList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/add"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <AddProject />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
