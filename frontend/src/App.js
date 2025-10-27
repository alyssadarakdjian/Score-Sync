import { useEffect, useState } from "react";
import Dashboard from "./Pages/Dashboard";
import "./index.css"; // keep Tailwind imports

export default function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [studentId, setStudentId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [msg, setMsg] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

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

      const payload =
        mode === "register"
          ? { email, password, fullname, studentId, dateOfBirth }
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

  if (authenticated) {
    const storedEmail = localStorage.getItem("scoreSyncEmail") || email;
    return <Dashboard onLogout={handleLogout} email={storedEmail} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <h1 className="text-3xl font-bold text-gray-800 mb-10">score-sync</h1>
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm border border-gray-200">
        <div className="flex justify-center mb-6">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === "login"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === "register"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Student ID"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
              <input
                type="date"
                placeholder="Date of Birth"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg py-2 transition"
          >
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        {msg && (
          <p className="mt-4 text-sm text-center text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}