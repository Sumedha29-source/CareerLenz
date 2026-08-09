import React from "react";
import "./App.css";

function ReadinessRing({ value = 82 }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <svg className="cl-ring-svg" viewBox="0 0 88 88">
      <circle
        className="cl-ring-track"
        cx="44"
        cy="44"
        r={r}
      />

      <circle
        className="cl-ring-progress"
        cx="44"
        cy="44"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={offset}
      />

      <text
        x="44"
        y="42"
        textAnchor="middle"
        className="cl-ring-num"
      >
        {value}%
      </text>

      <text
        x="44"
        y="53"
        textAnchor="middle"
        className="cl-ring-label"
      >
        MATCH
      </text>
    </svg>
  );
}

function IDCard() {
  const skills = ["SQL", "Figma", "Leadership"];

  return (
    <div className="cl-card-wrap">
      <div className="cl-lanyard" />

      <div className="cl-card">
        <div className="cl-card-hole" />

        <div className="cl-card-head">
          <div className="cl-avatar" />

          <div className="cl-lines">
            <span className="cl-line cl-line-1" />
            <span className="cl-line cl-line-2" />
          </div>
        </div>

        <div className="cl-card-divider" />

        <div className="cl-card-body">
          <ReadinessRing value={82} />

          <div className="cl-tags">
            {skills.map((skill) => (
              <span key={skill} className="cl-tag">
                <span className="cl-tag-dot" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="cl-barcode">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="cl-bar"
              style={{
                width: `${i % 5 === 0 ? 3 : 1}px`,
                opacity: i % 3 === 0 ? 0.55 : 0.28,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <main className="cl-root">
      <div className="cl-grid">
        <div>
          <p className="cl-eyebrow">
            <span className="cl-eyebrow-dot" />
            CareerLenz
          </p>

          <h1 className="cl-heading">
            Find the gap.
            <br />
            Close the gap.
          </h1>

          <p className="cl-body">
            Understand your career readiness, discover your skill gaps,
            and build a personalized roadmap to reach your target role.
          </p>

          <button className="cl-cta">
            Analyze My Career

            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <IDCard />
      </div>
    </main>
  );
}

export default App;