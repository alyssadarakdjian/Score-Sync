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

      <section className="tiles">
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
      </section>
    </div>
  );
}
