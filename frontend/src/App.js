import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
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

function AppContent() {
  const navigate = useNavigate(); // initialize navigate

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

      // Login logic
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

  // Updated logout with redirect
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
    navigate("/"); // redirect to login page
  };

  const storedName = localStorage.getItem("scoreSyncName");
  const storedEmail = localStorage.getItem("scoreSyncEmail");

  const DashboardLayout = (
    <Layout
      currentPageName={isAdmin ? "Admin Dashboard" : "Dashboard"}
      fullname={storedName}
      email={storedEmail}
      onLogout={handleLogout}
    >
      {isAdmin ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard (Coming Soon)</h1>
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
    <Routes>
      {/* Root route */}
      <Route
        path="/"
        element={
          authenticated ? (
            DashboardLayout
          ) : (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68fd3d9da4c6796c04141382/5c35e26a2_ScoreSync-Picsart-BackgroundRemover.png"
                alt="ScoreSync Logo"
                className="w-48 mb-8 drop-shadow-lg"
              />

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

      {/* Other routes */}
      {[
        { path: "/Courses", page: <Courses />, name: "Courses" },
        { path: "/Grades", page: <Grades />, name: "Grades" },
        { path: "/Calendar", page: <Calendar />, name: "Calendar" },
        { path: "/Messages", page: <Messages />, name: "Messages" },
        { path: "/Reports", page: <Reports />, name: "Reports" },
        { path: "/Students", page: <Students />, name: "Students" },
      ].map(({ path, page, name }) => (
        <Route
          key={path}
          path={path}
          element={
            authenticated ? (
              <Layout
                currentPageName={name}
                fullname={storedName}
                email={storedEmail}
                onLogout={handleLogout}
              >
                {page}
              </Layout>
            ) : (
              <div>Unauthorized</div>
            )
          }
        />
      ))}
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}