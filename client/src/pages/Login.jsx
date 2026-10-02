import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      //       localStorage.setItem("token", data.token);
      // localStorage.setItem("role", data.user.role);
      // localStorage.setItem("name", data.user.name);

      if (!response.ok) {
        alert(data.message);
        return;
      }

      console.log("Login successful:", data);

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save user information
      localStorage.setItem("user", JSON.stringify(data.user));

      // Save role and name for Sidebar
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("name", data.user.name);

      alert("Login successful!");

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "manager") {
        navigate("/manager");
      } else if (data.user.role === "employee") {
        navigate("/employee");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  return (
    <div>
      <h1>Employee Management System</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
