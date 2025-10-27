import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./Pages/Dashboard";
import Courses from "./Pages/Courses";
import Grades from "./Pages/Grades";
import Calendar from "./Pages/Calendar";
import Messages from "./Pages/Messages";
import Reports from "./Pages/Reports";
import Students from "./Pages/Students";
import AdminLogin from "./AdminLogin";
import Layout from "./Components/Layout";
import "./index.css";

const queryClient = new QueryClient();

export default function App() {
  const [mode, setMode] = useState("login");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMsg, setAdminMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [studentId, setStudentId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [msg, setMsg] = useState("");
  const [authenticated, setAuthenticated] = useState(() => {
    return localStorage.getItem("scoreSyncAuth") === "true";
  });

  useEffect(() => {
    fetch("http://localhost:5050/api/health")
      .then((r) => r.json())
      .then((d) => console.log("✅ Backend status:", d.status))
      .catch(() => console.error("❌ Backend not reachable"));
  }, []);

  // Student login/register
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

      setMsg(data?.message);

      // ✅ Login logic
      if (mode === "login") {
        setAuthenticated(true);
        setIsAdmin(false);
        localStorage.setItem("scoreSyncAuth", "true");
        localStorage.setItem("scoreSyncEmail", data.user.email);

        if (data.user.fullname) {
          localStorage.setItem("scoreSyncName", data.user.fullname);
        } else {
          console.warn("⚠️ No fullname returned from backend:", data.user);
        }

        setFullname(data.user.fullname || "");
      }

      if (mode === "register") setMode("login");
    } catch (err) {
      setMsg(err.message);
    }
  };

  // Admin login
  const handleAdminLogin = async (email, password) => {
    setAdminMsg("");
    try {
      const res = await fetch("http://localhost:5050/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Request failed");

      setAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem("scoreSyncAuth", "true");
      localStorage.setItem("scoreSyncEmail", email);
    } catch (err) {
      setAdminMsg(err.message);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem("scoreSyncAuth");
    localStorage.removeItem("scoreSyncEmail");
    localStorage.removeItem("scoreSyncName");
    setEmail("");
    setPassword("");
    setMode("login");
    setMsg("");
  };

  const storedName = localStorage.getItem("scoreSyncName");
  const storedEmail = localStorage.getItem("scoreSyncEmail");

  // 🔹 Dashboard layout reused across pages
  const DashboardLayout = (
    <Layout
      currentPageName={isAdmin ? "Admin Dashboard" : "Dashboard"}
      fullname={storedName}
      email={storedEmail}
      onLogout={handleLogout}
    >
      {isAdmin ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
          <h1 className="text-3xl font-bold mb-4">
            Admin Dashboard (Coming Soon)
          </h1>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <Dashboard onLogout={handleLogout} email={email} />
      )}
    </Layout>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Root route */}
          <Route
            path="/"
            element={
              authenticated ? (
                DashboardLayout
              ) : (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
                  <h1 className="text-3xl font-bold mb-10">score-sync</h1>

                  {isAdmin ? (
                    <AdminLogin
                      onLogin={handleAdminLogin}
                      msg={adminMsg}
                      onBackToStudent={() => setIsAdmin(false)}
                    />
                  ) : (
                    <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm border border-gray-200">
                      <div className="flex justify-between mb-6">
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                          <button
                            className={`px-4 py-2 rounded-lg font-medium ${
                              mode === "login"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-200"
                            }`}
                            onClick={() => setMode("login")}
                          >
                            Login
                          </button>
                          <button
                            className={`px-4 py-2 rounded-lg font-medium ${
                              mode === "register"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-200"
                            }`}
                            onClick={() => setMode("register")}
                          >
                            Register
                          </button>
                        </div>
                        <button
                          className="text-sm text-blue-600 hover:underline"
                          onClick={() => setIsAdmin(true)}
                        >
                          Admin Login
                        </button>
                      </div>

                      <form className="space-y-4" onSubmit={handleSubmit}>
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full border rounded-lg px-4 py-2"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full border rounded-lg px-4 py-2"
                        />
                        {mode === "register" && (
                          <>
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={fullname}
                              onChange={(e) => setFullname(e.target.value)}
                              required
                              className="w-full border rounded-lg px-4 py-2"
                            />
                            <input
                              type="text"
                              placeholder="Student ID"
                              value={studentId}
                              onChange={(e) => setStudentId(e.target.value)}
                              required
                              className="w-full border rounded-lg px-4 py-2"
                            />
                            <input
                              type="date"
                              value={dateOfBirth}
                              onChange={(e) => setDateOfBirth(e.target.value)}
                              required
                              className="w-full border rounded-lg px-4 py-2"
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
                        <p className="mt-4 text-sm text-center text-gray-600 bg-gray-50 border rounded-lg p-2">
                          {msg}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            }
          />

          {/* Dashboard route */}
          <Route
            path="/Dashboard"
            element={authenticated ? DashboardLayout : <div>Unauthorized</div>}
          />

          {/* ✅ Page routes */}
          <Route
            path="/Courses"
            element={
              authenticated ? (
                <Layout
                  currentPageName="Courses"
                  fullname={storedName}
                  email={storedEmail}
                  onLogout={handleLogout}
                >
                  <Courses />
                </Layout>
              ) : (
                <div>Unauthorized</div>
              )
            }
          />
          <Route
            path="/Grades"
            element={
              authenticated ? (
                <Layout
                  currentPageName="Grades"
                  fullname={storedName}
                  email={storedEmail}
                  onLogout={handleLogout}
                >
                  <Grades />
                </Layout>
              ) : (
                <div>Unauthorized</div>
              )
            }
          />
          <Route
            path="/Calendar"
            element={
              authenticated ? (
                <Layout
                  currentPageName="Calendar"
                  fullname={storedName}
                  email={storedEmail}
                  onLogout={handleLogout}
                >
                  <Calendar />
                </Layout>
              ) : (
                <div>Unauthorized</div>
              )
            }
          />
          <Route
            path="/Messages"
            element={
              authenticated ? (
                <Layout
                  currentPageName="Messages"
                  fullname={storedName}
                  email={storedEmail}
                  onLogout={handleLogout}
                >
                  <Messages />
                </Layout>
              ) : (
                <div>Unauthorized</div>
              )
            }
          />
          <Route
            path="/Reports"
            element={
              authenticated ? (
                <Layout
                  currentPageName="Reports"
                  fullname={storedName}
                  email={storedEmail}
                  onLogout={handleLogout}
                >
                  <Reports />
                </Layout>
              ) : (
                <div>Unauthorized</div>
              )
            }
          />
          <Route
            path="/Students"
            element={
              authenticated ? (
                <Layout
                  currentPageName="Students"
                  fullname={storedName}
                  email={storedEmail}
                  onLogout={handleLogout}
                >
                  <Students />
                </Layout>
              ) : (
                <div>Unauthorized</div>
              )
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}