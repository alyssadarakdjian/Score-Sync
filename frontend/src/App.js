import { useEffect, useState } from "react";
import "./App.css";
import Home from "./Home";

export default function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [msg, setMsg] = useState("");
  const [authenticated, setAuthenticated] = useState(() => {
    return localStorage.getItem("scoreSyncAuth") === "true";
  });

  // Check backend once and log to console
  useEffect(() => {
    fetch("http://localhost:5050/api/health")
      .then((r) => r.json())
      .then((d) => console.log("✅ Backend status:", d.status))
      .catch(() => console.error("❌ Backend not reachable"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const endpoint =
        mode === "login"
          ? "http://localhost:5050/api/auth/login"
          : "http://localhost:5050/api/auth/register";

      // Build payload depending on mode
      const payload =
        mode === "register"
          ? { email, password, studentId, dateOfBirth }
          : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Request failed");

      setMsg(
        data?.message || (mode === "login" ? "Login successful" : "Registered!")
      );

      // On successful login, mark authenticated and persist
      if (mode === "login") {
        setAuthenticated(true);
        localStorage.setItem("scoreSyncAuth", "true");
        localStorage.setItem("scoreSyncEmail", email);
      }

      if (mode === "register") setMode("login");
    } catch (err) {
      setMsg(err.message || "Something went wrong");
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem("scoreSyncAuth");
    localStorage.removeItem("scoreSyncEmail");
    setEmail("");
    setPassword("");
    setMode("login");
    setMsg("");
  };

  // If authenticated, render Home
  if (authenticated) {
    const storedEmail = localStorage.getItem("scoreSyncEmail") || "";
    return <Home onLogout={handleLogout} email={storedEmail} />;
  }

  return (
    <div className="container">
      <div className="brand">score-sync</div>
      <div className="card">
        <h1>{mode === "login" ? "Login" : "Register"}</h1>

        <div className="tabs">
          <button
            className={`tabBtn ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`tabBtn ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {mode === "register" && (
            <>
              <input
                className="input"
                type="text"
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
              <input
                className="input"
                type="date"
                placeholder="Date of birth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </>
          )}
          <button className="submit" type="submit">
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        {msg && <p className="msg">{msg}</p>}
      </div>
    </div>
  );
}
