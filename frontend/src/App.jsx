import { useState } from "react";
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


/* =========================
   ID CARD
========================= */

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
              <span
                key={skill}
                className="cl-tag"
              >
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


/* =========================
   CAREER ANALYSIS
========================= */

function CareerAnalysis({ onAnalyze }) {

  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [resume, setResume] = useState(null);

  const handleAnalyze = () => {

    if (!role) {
      alert("Please enter your target role.");
      return;
    }

    if (!resume) {
      alert("Please upload your resume.");
      return;
    }

    onAnalyze({
      role,
      skills,
      resume,
    });
  };

  return (

    <main className="cl-analysis">

      <div className="cl-analysis-container">

        <p className="cl-eyebrow">
          <span className="cl-eyebrow-dot" />
          Career Analysis
        </p>

        <h1 className="cl-heading">
          Let's understand
          <br />
          where you stand.
        </h1>

        <p className="cl-body">
          Tell CareerLenz about yourself and the role
          you're targeting. We'll identify your strengths,
          skill gaps, and what you need to work on next.
        </p>


        <div className="cl-analysis-form">

          {/* TARGET ROLE */}

          <label>
            Target Role
          </label>

          <input
            type="text"
            placeholder="e.g. Frontend Developer"
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
          />


          {/* SKILLS */}

          <label>
            Your Current Skills
          </label>

          <textarea
            placeholder="e.g. HTML, CSS, JavaScript, React..."
            value={skills}
            onChange={(e) =>
              setSkills(e.target.value)
            }
          />


          {/* RESUME */}

          <label>
            Resume / CV
          </label>

          <div className="cl-upload-box">

            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setResume(e.target.files[0])
              }
            />

            {resume && (
              <p className="cl-file-name">
                ✓ {resume.name}
              </p>
            )}

          </div>


          {/* ANALYZE */}

          <button
            className="cl-cta"
            onClick={handleAnalyze}
          >
            Analyze My Career →
          </button>

        </div>

      </div>

    </main>
  );
}


/* =========================
   RESULTS PAGE
========================= */

function Results({ data, onBack }) {

  return (

    <main className="cl-analysis">

      <div className="cl-analysis-container">

        <p className="cl-eyebrow">
          <span className="cl-eyebrow-dot" />
          CareerLenz Results
        </p>


        <h1 className="cl-heading">
          Your career
          <br />
          snapshot.
        </h1>


        <p className="cl-body">
          Here's a preview of what CareerLenz has
          understood about your career profile.
        </p>


        {/* TARGET ROLE */}

        <div className="cl-result-card">

          <p className="cl-result-label">
            TARGET ROLE
          </p>

          <h2>
            {data.role}
          </h2>

        </div>


        {/* CURRENT SKILLS */}

        <div className="cl-result-card">

          <p className="cl-result-label">
            YOUR CURRENT SKILLS
          </p>

          <p className="cl-result-text">
            {data.skills || "No skills added yet."}
          </p>

        </div>


        {/* RESUME */}

        <div className="cl-result-card">

          <p className="cl-result-label">
            RESUME
          </p>

          <p className="cl-result-text">
            ✓ {data.resume.name}
          </p>

        </div>


        {/* PLACEHOLDER READINESS */}

        <div className="cl-result-score">

          <ReadinessRing value={82} />

          <div>

            <p className="cl-result-label">
              CAREER READINESS
            </p>

            <h2>
              82%
            </h2>

            <p className="cl-result-text">
              Preliminary match score
            </p>

          </div>

        </div>


        <button
          className="cl-cta"
          onClick={onBack}
        >
          ← Edit Profile
        </button>

      </div>

    </main>
  );
}


/* =========================
   MAIN APP
========================= */

function App() {

  const [page, setPage] = useState("home");

  const [analysisData, setAnalysisData] =
    useState(null);


  /* LANDING → ANALYSIS */

  const openAnalysis = () => {
    setPage("analysis");
  };


  /* ANALYSIS → RESULTS */

  const handleAnalyze = (data) => {

    setAnalysisData(data);

    setPage("results");
  };


  /* RESULTS → ANALYSIS */

  const goBack = () => {

    setPage("analysis");
  };


  /* HOME */

  if (page === "home") {

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

              Understand your career readiness,
              discover your skill gaps, and build
              a personalized roadmap to reach
              your target role.

            </p>


            <button
              className="cl-cta"
              onClick={openAnalysis}
            >

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


  /* ANALYSIS */

  if (page === "analysis") {

    return (
      <CareerAnalysis
        onAnalyze={handleAnalyze}
      />
    );

  }


  /* RESULTS */

  if (page === "results") {

    return (
      <Results
        data={analysisData}
        onBack={goBack}
      />
    );

  }

}


export default App;