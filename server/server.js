const express =require("express");
const dotenv =require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

require("./jobs/attendanceJob");


dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/employees",employeeRoutes);
app.use("/api/departments",departmentRoutes);
app.use("/api/projects",projectRoutes);
app.use("/api/tasks",taskRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);


app.get("/",(req,res) => {
    res.send("Employee Management System API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
});