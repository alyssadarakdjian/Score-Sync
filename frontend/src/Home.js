import React from "react";
import "./App.css";

const mockClasses = [
  { id: 1, name: "Algebra I", students: 24, progress: "80%" },
  { id: 2, name: "Biology", students: 18, progress: "62%" },
  { id: 3, name: "World History", students: 30, progress: "91%" },
];

export default function Home({ onLogout, email }) {
  return (
    <div className="home-root">
      <header className="home-header">
        <div>
          <h1>Welcome{email ? `, ${email}` : ""}!</h1>
          <p className="subtitle">Here are your classes for the term.</p>
        </div>
        <div>
          <button className="submit" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="home-grid">
        <aside className="profile-pane">
          <div className="avatar-wrap">
            <img
              className="avatar"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                email || "Student"
              )}&background=2563eb&color=fff&size=128`}
              alt="profile"
            />
          </div>

          <div className="profile-info">
            <div className="info-row">
              <div className="label">Student ID</div>
              <div className="value">S1234567</div>
            </div>
            <div className="info-row">
              <div className="label">Date of Birth</div>
              <div className="value">2005-07-14</div>
            </div>
            <div className="info-row">
              <div className="label">Email</div>
              <div className="value">{email || "student@example.com"}</div>
            </div>
          </div>
        </aside>

        <main className="tiles">
          {mockClasses.map((c) => (
            <article className="tile" key={c.id}>
              <h3 className="tile-title">{c.name}</h3>
              <p className="tile-sub">{c.students} students</p>
              <div className="tile-footer">
                <span className="progress">Progress: {c.progress}</span>
                <button className="tile-btn">Open</button>
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}
