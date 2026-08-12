import { useState } from "react";
import "./App.css";

/* =========================================================
   ROLE → REQUIRED SKILLS
========================================================= */

const ROLE_SKILLS = {
  "Frontend Developer": ["html", "css", "javascript", "react", "git", "rest api"],
  "Backend Developer": ["python", "node.js", "express", "sql", "mongodb", "git", "rest api"],
  "Full Stack Developer": ["html", "css", "javascript", "react", "node.js", "express", "sql", "git", "rest api"],
  "Data Scientist": ["python", "sql", "statistics", "machine learning", "pandas", "numpy", "data visualization"],
  "Machine Learning Engineer": ["python", "machine learning", "deep learning", "pytorch", "tensorflow", "sql", "git"],
};

// Common aliases so "js" still matches "javascript" but "java" doesn't.
const SKILL_ALIASES = {
  js: "javascript",
  ts: "typescript",
  node: "node.js",
  nodejs: "node.js",
  py: "python",
  postgres: "sql",
  postgresql: "sql",
  mysql: "sql",
  ml: "machine learning",
  dl: "deep learning",
  api: "rest api",
  restapi: "rest api",
  viz: "data visualization",
  dataviz: "data visualization",
};

/* =========================================================
   SKILL ANALYSIS ENGINE
========================================================= */

function normalizeToken(token) {
  const cleaned = token.trim().toLowerCase();
  return SKILL_ALIASES[cleaned] || cleaned;
}

function analyzeSkills(role, userSkillsRaw) {
  const requiredSkills = ROLE_SKILLS[role] || [];

  const normalizedUserSkills = new Set(
    userSkillsRaw
      .split(",")
      .map(normalizeToken)
      .filter(Boolean)
  );

  const matchedSkills = requiredSkills.filter((skill) =>
    normalizedUserSkills.has(skill)
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !matchedSkills.includes(skill)
  );

  const readiness =
    requiredSkills.length === 0
      ? 0
      : Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return { requiredSkills, matchedSkills, missingSkills, readiness };
}

/* =========================================================
   READINESS RING
========================================================= */

function ReadinessRing({ value = 0 }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;

  return (
    <svg
      className="cl-ring-svg"
      viewBox="0 0 88 88"
      role="img"
      aria-label={`Career readiness: ${clamped}% match`}
    >
      <circle className="cl-ring-track" cx="44" cy="44" r={r} />
      <circle
        className="cl-ring-progress"
        cx="44"
        cy="44"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <text className="cl-ring-num" x="44" y="43" textAnchor="middle">
        {clamped}%
      </text>
      <text className="cl-ring-label" x="44" y="55" textAnchor="middle">
        MATCH
      </text>
    </svg>
  );
}

/* =========================================================
   ID CARD
========================================================= */

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
          {Array.from({ length: 28 }).map((_, index) => (
            <span
              key={index}
              className="cl-bar"
              style={{
                width: (index % 5 === 0 ? 3 : 1) + "px",
                opacity: index % 3 === 0 ? 0.55 : 0.28,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LANDING PAGE
========================================================= */

function LandingPage({ onStart }) {
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
            Understand your career readiness, discover your skill gaps, and
            build a personalized roadmap to reach your target role.
          </p>

          <button className="cl-cta" onClick={onStart}>
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

        <IDCard />
      </div>
    </main>
  );
}

/* =========================================================
   CAREER ANALYSIS PAGE
   (form state now lives in App so Back never loses your work)
========================================================= */

function CareerAnalysis({ form, setForm, onAnalyze, onBack }) {
  const { role, skills, resume, resources } = form;

  const [resourceType, setResourceType] = useState("Course");
  const [resourceName, setResourceName] = useState("");
  const [resourceProgress, setResourceProgress] = useState(0);
  const [errors, setErrors] = useState({});

  const requiredCount = role ? (ROLE_SKILLS[role] || []).length : null;

  const clampProgress = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return 0;
    return Math.max(0, Math.min(100, Math.round(num)));
  };

  const addResource = () => {
    if (!resourceName.trim()) {
      setErrors((e) => ({ ...e, resource: "Enter a resource name first." }));
      return;
    }

    const newResource = {
      id: Date.now(),
      type: resourceType,
      name: resourceName.trim(),
      progress: clampProgress(resourceProgress),
    };

    setForm((f) => ({ ...f, resources: [...f.resources, newResource] }));
    setResourceName("");
    setResourceProgress(0);
    setErrors((e) => ({ ...e, resource: null }));
  };

  const deleteResource = (id) => {
    setForm((f) => ({
      ...f,
      resources: f.resources.filter((resource) => resource.id !== id),
    }));
  };

  const handleAnalyze = () => {
    const nextErrors = {};
    if (!role) nextErrors.role = "Select your target role.";
    if (!skills.trim()) nextErrors.skills = "List at least one current skill.";
    if (!resume) nextErrors.resume = "Upload your resume to continue.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const analysis = analyzeSkills(role, skills);

    onAnalyze({
      role,
      skills,
      resume,
      resources,
      requiredSkills: analysis.requiredSkills,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      readiness: analysis.readiness,
    });
  };

  const isReady = Boolean(role && skills.trim() && resume);

  return (
    <main className="cl-analysis">
      <div className="cl-analysis-container">
        <button className="cl-back-button" onClick={onBack}>
          ← Back
        </button>

        <p className="cl-eyebrow">
          <span className="cl-eyebrow-dot" />
          Career Analysis
        </p>

        <h1 className="cl-heading">
          Tell us about
          <br />
          your career.
        </h1>

        <p className="cl-body">
          Give CareerLenz some information about your current skills and
          target role.
        </p>

        <div className="cl-analysis-form">
          {/* TARGET ROLE */}
          <label htmlFor="cl-role">Target Role</label>
          <select
            id="cl-role"
            value={role}
            aria-invalid={Boolean(errors.role)}
            onChange={(event) =>
              setForm((f) => ({ ...f, role: event.target.value }))
            }
          >
            <option value="">Select your target role</option>
            {Object.keys(ROLE_SKILLS).map((roleName) => (
              <option key={roleName} value={roleName}>
                {roleName}
              </option>
            ))}
          </select>
          {requiredCount !== null && (
            <p className="cl-field-hint">
              {requiredCount} required skills for this role.
            </p>
          )}
          {errors.role && <p className="cl-field-error">{errors.role}</p>}

          {/* CURRENT SKILLS */}
          <label htmlFor="cl-skills">Current Skills</label>
          <textarea
            id="cl-skills"
            value={skills}
            aria-invalid={Boolean(errors.skills)}
            onChange={(event) =>
              setForm((f) => ({ ...f, skills: event.target.value }))
            }
            placeholder="Example: HTML, CSS, JavaScript, React"
          />
          {errors.skills && <p className="cl-field-error">{errors.skills}</p>}

          {/* RESUME */}
          <label htmlFor="cl-resume">Upload Resume</label>
          <div className="cl-upload-box">
            <input
              id="cl-resume"
              type="file"
              accept=".pdf,.doc,.docx"
              aria-invalid={Boolean(errors.resume)}
              onChange={(event) =>
                setForm((f) => ({ ...f, resume: event.target.files[0] || null }))
              }
            />
            {resume && <p className="cl-file-name">Selected: {resume.name}</p>}
          </div>
          {errors.resume && <p className="cl-field-error">{errors.resume}</p>}

          {/* RESOURCES */}
          <div className="cl-resources-section">
            <h2>Learning Resources</h2>
            <p className="cl-resource-description">
              Add courses, videos, projects, or other resources you're
              currently working on.
            </p>

            <div className="cl-resource-form">
              <select
                aria-label="Resource type"
                value={resourceType}
                onChange={(event) => setResourceType(event.target.value)}
              >
                <option>Course</option>
                <option>Video</option>
                <option>Project</option>
                <option>Book</option>
              </select>

              <input
                type="text"
                aria-label="Resource name"
                placeholder="Resource name"
                value={resourceName}
                onChange={(event) => setResourceName(event.target.value)}
              />

              <input
                type="number"
                aria-label="Progress percent"
                min="0"
                max="100"
                placeholder="Progress %"
                value={resourceProgress}
                onChange={(event) => setResourceProgress(event.target.value)}
                onBlur={(event) =>
                  setResourceProgress(clampProgress(event.target.value))
                }
              />

              <button type="button" className="cl-add-resource" onClick={addResource}>
                + Add Resource
              </button>
            </div>
            {errors.resource && <p className="cl-field-error">{errors.resource}</p>}

            {resources.length > 0 && (
              <div className="cl-resource-list">
                {resources.map((resource) => (
                  <div className="cl-resource-card" key={resource.id}>
                    <div className="cl-resource-card-top">
                      <div>
                        <span className="cl-resource-type">{resource.type}</span>
                        <h3>{resource.name}</h3>
                      </div>
                      <button
                        className="cl-delete-resource"
                        aria-label={`Remove ${resource.name}`}
                        onClick={() => deleteResource(resource.id)}
                      >
                        ×
                      </button>
                    </div>

                    <div className="cl-progress-info">
                      <span>Progress</span>
                      <span>{resource.progress}%</span>
                    </div>

                    <div className="cl-progress-bar">
                      <div
                        className="cl-progress-fill"
                        style={{ width: `${resource.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ANALYZE BUTTON */}
          <button
            className="cl-cta cl-analyze-button"
            onClick={handleAnalyze}
            disabled={!isReady}
            aria-disabled={!isReady}
          >
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
      </div>
    </main>
  );
}

/* =========================================================
   RESULTS PAGE
========================================================= */

function Results({ data, onBack }) {
  return (
    <main className="cl-analysis">
      <div className="cl-analysis-container">
        <button className="cl-back-button" onClick={onBack}>
          ← Edit Analysis
        </button>

        <p className="cl-eyebrow">
          <span className="cl-eyebrow-dot" />
          Career Analysis
        </p>

        <h1 className="cl-heading">
          Your career
          <br />
          readiness.
        </h1>

        <p className="cl-body">
          Here's what CareerLenz found based on your target role and current
          skills.
        </p>

        <div className="cl-result-score">
          <ReadinessRing value={data.readiness} />
          <div>
            <p className="cl-result-label">CAREER READINESS</p>
            <h2>{data.readiness}%</h2>
            <p className="cl-result-text">
              You currently match {data.matchedSkills.length} out of{" "}
              {data.requiredSkills.length} required skills.
            </p>
          </div>
        </div>

        <div className="cl-result-card">
          <p className="cl-result-label">TARGET ROLE</p>
          <h2>{data.role}</h2>
        </div>

        <div className="cl-result-card">
          <p className="cl-result-label">YOUR CURRENT SKILLS</p>
          <div className="cl-skill-list">
            {data.matchedSkills.length > 0 ? (
              data.matchedSkills.map((skill) => (
                <span className="cl-skill matched" key={skill}>
                  ✓ {skill}
                </span>
              ))
            ) : (
              <p className="cl-result-text">No matching skills found yet.</p>
            )}
          </div>
        </div>

        <div className="cl-result-card">
          <p className="cl-result-label">SKILL GAPS</p>
          <div className="cl-skill-list">
            {data.missingSkills.length === 0 ? (
              <p className="cl-result-text">
                🎉 You currently have all the required skills for this role!
              </p>
            ) : (
              data.missingSkills.map((skill) => (
                <span className="cl-skill missing" key={skill}>
                  + {skill}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="cl-result-card">
          <p className="cl-result-label">REQUIRED SKILLS</p>
          <div className="cl-skill-list">
            {data.requiredSkills.map((skill) => (
              <span className="cl-skill required" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="cl-result-card">
          <p className="cl-result-label">RESUME</p>
          <p className="cl-result-text">📄 {data.resume.name}</p>
          <p className="cl-result-text">Resume uploaded successfully.</p>
        </div>

        {data.resources.length > 0 && (
          <div className="cl-result-card">
            <p className="cl-result-label">YOUR LEARNING RESOURCES</p>
            <div className="cl-result-resources">
              {data.resources.map((resource) => (
                <div className="cl-result-resource" key={resource.id}>
                  <div>
                    <span className="cl-resource-type">{resource.type}</span>
                    <p>{resource.name}</p>
                  </div>
                  <strong>{resource.progress}%</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="cl-result-card cl-next-step">
          <p className="cl-result-label">NEXT STEP</p>
          <h2>Close your skill gaps.</h2>
          <p className="cl-result-text">
            Your biggest opportunities are the skills listed under Skill
            Gaps. We'll use these gaps next to build your personalized
            learning roadmap.
          </p>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

const EMPTY_FORM = { role: "", skills: "", resume: null, resources: [] };

function App() {
  const [page, setPage] = useState("landing");
  const [form, setForm] = useState(EMPTY_FORM);
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalyze = (data) => {
    setAnalysisData(data);
    setPage("results");
  };

  if (page === "landing") {
    return <LandingPage onStart={() => setPage("analysis")} />;
  }

  if (page === "analysis") {
    return (
      <CareerAnalysis
        form={form}
        setForm={setForm}
        onAnalyze={handleAnalyze}
        onBack={() => setPage("landing")}
      />
    );
  }

  if (page === "results") {
    return <Results data={analysisData} onBack={() => setPage("analysis")} />;
  }

  return null;
}

export default App;