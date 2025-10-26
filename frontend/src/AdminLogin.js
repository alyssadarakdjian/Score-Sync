import { useState } from "react";
import "./App.css";

export default function AdminLogin({ onLogin, msg }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onLogin) onLogin(email, password);
  };

  return (
    <div className="container">
      <div className="brand">score-sync</div>
      <div className="card">
        <h1>Admin Login</h1>
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
          <button className="submit" type="submit">
            Login
          </button>
        </form>
        {msg && <p className="msg">{msg}</p>}
      </div>
    </div>
  );
}
