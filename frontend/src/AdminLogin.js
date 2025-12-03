import { useState } from "react";

export default function AdminLogin({ onLogin, msg, onBackToStudent }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin(email, password);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm border border-gray-200">
      <h2 className="text-2xl font-semibold text-center mb-6">Admin Login</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Admin Email"
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
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg py-2 transition"
        >
          Login
        </button>
      </form>

      {msg && (
        <p className="mt-4 text-sm text-center text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2">
          {msg}
        </p>
      )}

      <div className="mt-6 text-center">
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={onBackToStudent}
        >
          Back to Student Login 
        </button>
      </div>
    </div>
  );
}