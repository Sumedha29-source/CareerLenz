import { useEffect, useRef, useState } from "react";
import "./App.css";

/* =========================================================
   CONFIG
   ========================================================= */

// Reads VITE_API_BASE_URL from a .env file if present (e.g.
// VITE_API_BASE_URL=https://api.careerlenz.com), falling back to
// localhost for dev. Create a .env file at the project root with
// that line to point at a deployed backend without touching code.
const API_BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "http://127.0.0.1:5000";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // keep in sync with backend limit
const REQUEST_TIMEOUT_MS = 30000;

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Machine Learning Engineer",
  "Data Scientist",
];

function validateResumeFile(file) {
  if (!file) return "Please choose a file.";
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return "Only PDF files are supported.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "That file is larger than 8MB. Please upload a smaller PDF.";
  }
  return null;
}

/* =========================================================
   READINESS RING
   ========================================================= */

function ReadinessRing({ value = 0 }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="readiness-ring"
      role="img"
      aria-label={`Career readiness: ${clamped}% match`}
    >
      <svg className="readiness-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="readiness-ring-track" cx="50" cy="50" r={radius} />
        <circle
          className="readiness-ring-progress"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="readiness-ring-text" aria-hidden="true">
        <strong>{clamped}%</strong>
        <span>MATCH</span>
      </div>
    </div>
  );
}

/* =========================================================
   HOME PAGE
   ========================================================= */

function HomePage({ onAnalyze }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main className="cl-root home-page">
      <div className="cl-grid">
        <div className="hero-content">
          <p className="cl-eyebrow">
            <span className="cl-eyebrow-dot" />
            CareerLenz
          </p>

          <h1 className="cl-heading" tabIndex={-1} ref={headingRef}>
            Find the gap.
            <br />
            Close the gap.
          </h1>

          <p className="cl-body">
            Understand your career readiness, discover your skill gaps, and
            build a personalized roadmap to reach your target role.
          </p>

          <button className="cl-cta" onClick={onAnalyze}>
            Analyze My Career
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
                <span className="cl-tag">
                  <span className="cl-tag-dot" />
                  SQL
                </span>
                <span className="cl-tag">
                  <span className="cl-tag-dot" />
                  Figma
                </span>
                <span className="cl-tag">
                  <span className="cl-tag-dot" />
                  Leadership
                </span>
              </div>
            </div>
            <div className="cl-barcode">
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="cl-bar"
                  style={{
                    width: (i % 5 === 0 ? 3 : 1) + "px",
                    opacity: i % 3 === 0 ? 0.55 : 0.28,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   CAREER ANALYSIS PAGE
   ========================================================= */

function CareerAnalysis({
  targetRole,
  setTargetRole,
  resumeFile,
  setResumeFile,
  onAnalyze,
  onBack,
  onCancel,
  loading,
  error,
  setError,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const applyFile = (file) => {
    const validationError = validateResumeFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setResumeFile(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) applyFile(file);
  };

  const handleDragOver = (event) => {
    if (loading) return;
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (loading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  return (
    <main className="cl-root analysis-page">
      <div className="analysis-container">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>

        <p className="cl-eyebrow">
          <span className="cl-eyebrow-dot" />
          Career Analysis
        </p>

        <h1 className="analysis-heading" tabIndex={-1} ref={headingRef}>
          Let's understand
          <br />
          where you stand.
        </h1>

        <p className="analysis-description">
          Tell CareerLenz your target role and upload your resume. We'll
          analyze your current skills and identify the gaps.
        </p>

        {/* TARGET ROLE */}
        <div className="form-section">
          <label className="form-label" htmlFor="target-role">
            TARGET ROLE
          </label>

          <select
            id="target-role"
            className="role-select"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            disabled={loading}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* RESUME */}
        <div className="upload-section">
          <label className="form-label" htmlFor="resume-upload">
            UPLOAD YOUR RESUME
          </label>

          <label
            className={`upload-box${isDragging ? " dragging" : ""}${
              loading ? " disabled" : ""
            }`}
            htmlFor="resume-upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={loading}
            />

            <span className="upload-icon" aria-hidden="true">
              ↑
            </span>

            <span>
              {resumeFile ? resumeFile.name : "Choose or drop your PDF resume"}
            </span>
          </label>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <div className="analyze-actions">
          <button
            className="cl-cta analyze-button"
            onClick={onAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze My Resume"}

            {!loading && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8H13M13 8L9 4M13 8L9 12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          {loading && (
            <button type="button" className="cancel-link" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   RESULT CARD
   ========================================================= */

function ResultCard({ label, children, className = "" }) {
  return (
    <section className={`result-card ${className}`}>
      <div className="result-label">{label}</div>
      {children}
    </section>
  );
}

/* =========================================================
   RESULTS PAGE
   ========================================================= */

function ResultsPage({ result, onBack }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (!result) {
    return null;
  }

  const readiness = result.readiness_score || 0;
  const matchedSkills = result.matched_skills || [];
  const missingSkills = result.missing_skills || [];
  const requiredSkills = result.required_skills || [];
  const roadmap = result.roadmap || [];
  const project = result.recommended_project;
  const roleRecognized = result.role_recognized !== false;

  return (
    <main className="cl-root results-page">
      <div className="results-container">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>

        <p className="cl-eyebrow">
          <span className="cl-eyebrow-dot" />
          Career Analysis
        </p>

        <h1 className="results-heading" tabIndex={-1} ref={headingRef}>
          Your career
          <br />
          readiness.
        </h1>

        <p className="results-description">
          Here's what CareerLenz found based on your target role and current
          skills.
        </p>

        {!roleRecognized && (
          <div className="notice-message" role="status">
            We didn't recognize "{result.target_role}" as one of our tracked
            roles, so this analysis uses a general baseline skill set instead
            of a role-specific one.
          </div>
        )}

        {/* READINESS */}
        <ResultCard label="CAREER READINESS" className="readiness-card">
          <div className="readiness-content">
            <ReadinessRing value={readiness} />
            <div>
              <div className="readiness-percentage">{readiness}%</div>
              <p className="readiness-message">
                You currently match <strong>{matchedSkills.length}</strong>{" "}
                out of <strong>{requiredSkills.length}</strong> required
                skills.
              </p>
            </div>
          </div>
        </ResultCard>

        {/* TARGET ROLE */}
        <ResultCard label="TARGET ROLE">
          <h2 className="result-big-text">{result.target_role}</h2>
        </ResultCard>

        {/* CURRENT SKILLS */}
        <ResultCard label="YOUR CURRENT SKILLS">
          <div className="skill-tags">
            {matchedSkills.length > 0 ? (
              matchedSkills.map((skill) => (
                <span key={skill} className="skill-tag skill-matched">
                  ✓ {skill}
                </span>
              ))
            ) : (
              <span className="empty-text">No matching skills detected yet.</span>
            )}
          </div>
        </ResultCard>

        {/* SKILL GAPS */}
        <ResultCard label="SKILL GAPS">
          <div className="skill-tags">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill) => (
                <span key={skill} className="skill-tag skill-gap">
                  + {skill}
                </span>
              ))
            ) : (
              <span className="success-text">🎉 No skill gaps detected!</span>
            )}
          </div>
        </ResultCard>

        {/* REQUIRED SKILLS */}
        <ResultCard label="REQUIRED SKILLS">
          <div className="skill-tags">
            {requiredSkills.map((skill) => (
              <span key={skill} className="skill-tag skill-required">
                {skill}
              </span>
            ))}
          </div>
        </ResultCard>

        {/* RESUME */}
        <ResultCard label="RESUME">
          <div className="resume-result">
            <span className="resume-icon" aria-hidden="true">
              📄
            </span>
            <div>
              <div className="resume-name">{result.filename}</div>
              <div className="resume-success">Resume uploaded successfully.</div>
            </div>
          </div>
        </ResultCard>

        {/* PERSONALIZED ROADMAP */}
        <ResultCard label="PERSONALIZED ROADMAP" className="roadmap-card">
          <h2 className="roadmap-heading">Close your skill gaps.</h2>
          <p className="result-description">
            Here's a step-by-step learning path based on the skills you
            currently need for your target role.
          </p>

          {roadmap.length > 0 ? (
            <div className="roadmap-list">
              {roadmap.map((item) => (
                <div className="roadmap-item" key={item.step}>
                  <div className="roadmap-number">
                    {String(item.step).padStart(2, "0")}
                  </div>

                  <div className="roadmap-content">
                    <div className="roadmap-top">
                      <h3>{item.title}</h3>
                      <span className="roadmap-time">{item.time}</span>
                    </div>

                    <p>{item.description}</p>

                    <div className="roadmap-topics">
                      {item.topics?.map((topic) => (
                        <span key={topic} className="roadmap-topic">
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="roadmap-practice">
                      <strong>Practice:</strong> {item.practice}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-roadmap">
              <div className="empty-roadmap-icon" aria-hidden="true">
                ✓
              </div>
              <h3>You're looking good!</h3>
              <p>We couldn't find any missing skills that currently have a roadmap.</p>
            </div>
          )}
        </ResultCard>

        {/* RECOMMENDED PROJECT */}
        {project && (
          <ResultCard label="RECOMMENDED PROJECT" className="project-card">
            <div className="project-content">
              <div className="project-icon" aria-hidden="true">
                ✦
              </div>
              <div>
                <h2 className="project-heading">{project.title}</h2>
                <p className="project-description">{project.description}</p>

                <div className="project-skills">
                  {project.skills?.map((skill) => (
                    <span key={skill} className="project-skill">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ResultCard>
        )}

        {/* NEXT STEP */}
        <section className="next-step-card">
          <div className="result-label">NEXT STEP</div>
          <h2>Turn your gaps into strengths.</h2>
          <p>
            Follow your personalized roadmap, build the recommended project,
            and strengthen your portfolio for your target role.
          </p>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   MAIN APP
   ========================================================= */

function App() {
  const [page, setPage] = useState("home");
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [resumeFile, setResumeFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abortControllerRef = useRef(null);
  // Tracks whether the in-flight request was aborted by the user
  // (Back / Cancel) rather than by the timeout, so we don't show a
  // misleading "took too long" error after an intentional cancel.
  const wasCancelledRef = useRef(false);

  // Cancel any in-flight request if the component tree ever unmounts.
  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const cancelAnalysis = () => {
    wasCancelledRef.current = true;
    abortControllerRef.current?.abort();
    setLoading(false);
  };

  const analyzeResume = async () => {
    setError("");
    wasCancelledRef.current = false;

    const validationError = validateResumeFile(resumeFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("targetRole", targetRole);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server sent back an unexpected response. Please try again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong while analyzing your resume."
        );
      }

      setAnalysisResult(data);
      setPage("results");
    } catch (err) {
      if (err.name === "AbortError") {
        if (!wasCancelledRef.current) {
          setError(
            "That took too long. Please check the backend is running and try again."
          );
        }
        // else: user cancelled on purpose, no error needed.
      } else {
        setError(err.message || "Unable to connect to CareerLenz backend.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const goBackFromAnalysis = () => {
    if (loading) cancelAnalysis();
    setPage("home");
  };

  if (page === "analysis") {
    return (
      <CareerAnalysis
        targetRole={targetRole}
        setTargetRole={setTargetRole}
        resumeFile={resumeFile}
        setResumeFile={setResumeFile}
        onAnalyze={analyzeResume}
        onBack={goBackFromAnalysis}
        onCancel={cancelAnalysis}
        loading={loading}
        error={error}
        setError={setError}
      />
    );
  }

  if (page === "results") {
    return <ResultsPage result={analysisResult} onBack={() => setPage("analysis")} />;
  }

  return <HomePage onAnalyze={() => setPage("analysis")} />;
}

export default App;