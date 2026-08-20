import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Overview from "./pages/Overview";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import SkillGap from "./pages/SkillGap";
import Roadmap from "./pages/Roadmap";
import Projects from "./pages/Projects";
import Resources from "./pages/Resources";

const API_BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "http://127.0.0.1:5000";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30000;

/* =========================================================
   ROLE → REQUIRED SKILLS
========================================================= */

const ROLE_SKILLS = {
  "Frontend Developer": [
    "html",
    "css",
    "javascript",
    "react",
    "git",
    "rest api",
  ],

  "Backend Developer": [
    "python",
    "node.js",
    "express",
    "sql",
    "mongodb",
    "git",
    "rest api",
  ],

  "Full Stack Developer": [
    "html",
    "css",
    "javascript",
    "react",
    "node.js",
    "express",
    "sql",
    "git",
    "rest api",
  ],

  "Data Scientist": [
    "python",
    "sql",
    "statistics",
    "machine learning",
    "pandas",
    "numpy",
    "data visualization",
  ],

  "Machine Learning Engineer": [
    "python",
    "machine learning",
    "deep learning",
    "pytorch",
    "tensorflow",
    "sql",
    "git",
  ],
};

/* =========================================================
   SKILL INTELLIGENCE
========================================================= */

const SKILL_INTELLIGENCE = {
  html: {
    description: "Build structured and accessible web pages.",
    topics: ["Semantic HTML", "Forms", "Accessibility"],
    difficulty: "Beginner",
    time: "3 days",
    practice: "Build a responsive portfolio page.",
  },

  css: {
    description: "Create responsive and visually polished interfaces.",
    topics: ["Flexbox", "Grid", "Responsive Design"],
    difficulty: "Beginner",
    time: "5 days",
    practice: "Build a responsive landing page.",
  },

  javascript: {
    description: "Add logic and interactivity to modern web applications.",
    topics: ["ES6+", "DOM", "Async JavaScript", "Fetch API"],
    difficulty: "Intermediate",
    time: "7 days",
    practice: "Build a weather dashboard using a public API.",
  },

  react: {
    description: "Build component-based modern web applications.",
    topics: ["Components", "Props", "State", "Hooks"],
    difficulty: "Intermediate",
    time: "7 days",
    practice: "Build a job application tracking dashboard.",
  },

  "rest api": {
    description:
      "Learn how frontend applications communicate with backend services.",
    topics: ["HTTP", "GET / POST", "JSON", "Authentication", "Error Handling"],
    difficulty: "Intermediate",
    time: "5 days",
    practice: "Build a REST API for a job application tracker.",
  },

  sql: {
    description: "Store, query and manipulate structured application data.",
    topics: ["SELECT", "JOINs", "Aggregations", "Indexes"],
    difficulty: "Intermediate",
    time: "6 days",
    practice: "Build a database for a job application tracker.",
  },

  git: {
    description: "Manage code history and collaborate professionally.",
    topics: ["Commits", "Branches", "Merge", "Pull Requests"],
    difficulty: "Beginner",
    time: "2 days",
    practice: "Collaborate on a project using Git branches.",
  },

  docker: {
    description:
      "Package applications and their dependencies into containers.",
    topics: ["Images", "Containers", "Dockerfile", "Docker Compose"],
    difficulty: "Intermediate",
    time: "5 days",
    practice: "Containerize your CareerLenz backend.",
  },

  testing: {
    description: "Make applications reliable through automated testing.",
    topics: ["Unit Tests", "Integration Tests", "Mocks"],
    difficulty: "Intermediate",
    time: "5 days",
    practice: "Write automated tests for a REST API.",
  },

  python: {
    description:
      "Use Python for application development, automation and data work.",
    topics: ["Functions", "OOP", "Modules", "Error Handling"],
    difficulty: "Beginner",
    time: "7 days",
    practice: "Build a command-line productivity application.",
  },

  mongodb: {
    description: "Work with flexible document-based databases.",
    topics: ["Documents", "Collections", "Queries", "Indexes"],
    difficulty: "Intermediate",
    time: "5 days",
    practice: "Build a MongoDB-backed task manager.",
  },

  express: {
    description: "Build backend APIs and web servers with Express.",
    topics: ["Routes", "Middleware", "Controllers", "Error Handling"],
    difficulty: "Intermediate",
    time: "5 days",
    practice: "Build a CRUD API using Express.",
  },

  "node.js": {
    description: "Build server-side JavaScript applications.",
    topics: ["Node Runtime", "Modules", "NPM", "HTTP Servers"],
    difficulty: "Intermediate",
    time: "6 days",
    practice: "Build a Node.js REST API.",
  },

  statistics: {
    description:
      "Use statistical methods to understand and analyze data.",
    topics: ["Mean", "Variance", "Probability", "Distributions"],
    difficulty: "Intermediate",
    time: "7 days",
    practice:
      "Analyze a real-world dataset and create a statistical report.",
  },

  "machine learning": {
    description: "Build models that learn patterns from data.",
    topics: [
      "Regression",
      "Classification",
      "Feature Engineering",
      "Model Evaluation",
    ],
    difficulty: "Intermediate",
    time: "14 days",
    practice:
      "Build an end-to-end machine learning prediction system.",
  },

  "deep learning": {
    description: "Build neural-network based machine learning systems.",
    topics: [
      "Neural Networks",
      "Backpropagation",
      "CNNs",
      "Model Training",
    ],
    difficulty: "Advanced",
    time: "14 days",
    practice: "Build an image classification model.",
  },

  pytorch: {
    description: "Build and train deep learning models using PyTorch.",
    topics: ["Tensors", "Datasets", "Neural Networks", "Training Loops"],
    difficulty: "Advanced",
    time: "10 days",
    practice: "Train a PyTorch image classifier.",
  },

  tensorflow: {
    description:
      "Build machine learning and deep learning models using TensorFlow.",
    topics: ["Tensors", "Keras", "Training", "Evaluation"],
    difficulty: "Advanced",
    time: "10 days",
    practice: "Build an image classification model.",
  },

  pandas: {
    description: "Clean, transform and analyze structured datasets.",
    topics: ["DataFrames", "Filtering", "Grouping", "Data Cleaning"],
    difficulty: "Beginner",
    time: "4 days",
    practice: "Perform exploratory data analysis on a public dataset.",
  },

  numpy: {
    description: "Perform efficient numerical computation with Python.",
    topics: ["Arrays", "Indexing", "Vectorization", "Linear Algebra"],
    difficulty: "Beginner",
    time: "4 days",
    practice: "Build numerical data analysis utilities.",
  },

  "data visualization": {
    description:
      "Communicate insights through effective visualizations.",
    topics: ["Charts", "Matplotlib", "Seaborn", "Dashboards"],
    difficulty: "Beginner",
    time: "4 days",
    practice: "Create an interactive data visualization dashboard.",
  },
};

function getSkillGapInfo(skill, roadmap) {
  const normalized = skill.toLowerCase();

  const roadmapItem = (roadmap || []).find(
    (item) => (item.skill || "").toLowerCase() === normalized
  );

  const fallback = SKILL_INTELLIGENCE[normalized] || {
    description: `Build your ${skill} skills for your target role.`,
    topics: ["Fundamentals", "Practical Usage", "Projects"],
    difficulty: "Intermediate",
    time: "5 days",
    practice: `Build a small project using ${skill}.`,
  };

  return {
    difficulty: fallback.difficulty,
    description: roadmapItem?.description || fallback.description,
    topics: roadmapItem?.topics?.length
      ? roadmapItem.topics
      : fallback.topics,
    time: roadmapItem?.time || fallback.time,
    practice: roadmapItem?.practice || fallback.practice,
    resources: roadmapItem?.resources || [],
  };
}

function parseManualSkills(raw) {
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

function validateResumeFile(file) {
  if (!file) return "Please upload your resume.";

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
  const r = 34;
  const c = 2 * Math.PI * r;

  const clamped = Math.max(
    0,
    Math.min(100, Number(value) || 0)
  );

  const offset = c - (clamped / 100) * c;

  return (
    <svg
      className="cl-ring-svg"
      viewBox="0 0 88 88"
      role="img"
      aria-label={`Career readiness: ${clamped}%`}
    >
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
        className="cl-ring-num"
        x="44"
        y="43"
        textAnchor="middle"
      >
        {clamped}%
      </text>

      <text
        className="cl-ring-label"
        x="44"
        y="55"
        textAnchor="middle"
      >
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
                width: `${index % 5 === 0 ? 3 : 1}px`,
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
        <div className="hero-content">
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

          <button className="cl-cta" onClick={onStart}>
            Analyze My Career

            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
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

/* =========================================================
   CAREER ANALYSIS PAGE
========================================================= */

function CareerAnalysis({
  form,
  setForm,
  onAnalyze,
  onBack,
}) {
  const { role, skills, resume, resources } = form;

  const [resourceType, setResourceType] = useState("Course");
  const [resourceName, setResourceName] = useState("");
  const [resourceProgress, setResourceProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const clampProgress = (value) => {
    const num = Number(value);

    if (Number.isNaN(num)) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round(num)));
  };

  const addResource = () => {
    if (!resourceName.trim()) {
      setErrors((previous) => ({
        ...previous,
        resource: "Enter a resource name first.",
      }));
      return;
    }

    const newResource = {
      id: Date.now(),
      type: resourceType,
      name: resourceName.trim(),
      progress: clampProgress(resourceProgress),
    };

    setForm((previous) => ({
      ...previous,
      resources: [...previous.resources, newResource],
    }));

    setResourceName("");
    setResourceProgress(0);

    setErrors((previous) => ({
      ...previous,
      resource: null,
    }));
  };

  const deleteResource = (id) => {
    setForm((previous) => ({
      ...previous,
      resources: previous.resources.filter(
        (resource) => resource.id !== id
      ),
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    const validationError = file
      ? validateResumeFile(file)
      : null;

    setForm((previous) => ({
      ...previous,
      resume: file,
    }));

    setErrors((previous) => ({
      ...previous,
      resume: validationError,
    }));
  };

  const cancelAnalysis = () => {
    abortControllerRef.current?.abort();
    setLoading(false);
  };

  const handleBack = () => {
    if (loading) {
      cancelAnalysis();
    }

    onBack();
  };

  const handleAnalyze = async () => {
    const nextErrors = {};

    if (!role) {
      nextErrors.role = "Select your target role.";
    }

    const resumeError = validateResumeFile(resume);

    if (resumeError) {
      nextErrors.resume = resumeError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const controller = new AbortController();

    abortControllerRef.current = controller;

    const timeoutId = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    try {
      const formData = new FormData();

      formData.append("resume", resume);
      formData.append("targetRole", role);

      const response = await fetch(
        `${API_BASE_URL}/analyze`,
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

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
          data.error || "Resume analysis failed."
        );
      }

      const requiredSkills =
        data.required_skills || [];

      const backendMatched = new Set(
        (data.matched_skills || []).map((skill) =>
          skill.toLowerCase()
        )
      );

      const manualSkills = parseManualSkills(skills);

      const selfReportedMatches =
        requiredSkills.filter(
          (skill) =>
            !backendMatched.has(skill.toLowerCase()) &&
            manualSkills.has(skill.toLowerCase())
        );

      const matchedSkills = [
        ...(data.matched_skills || []),
        ...selfReportedMatches,
      ];

      const missingSkills =
        requiredSkills.filter(
          (skill) =>
            !matchedSkills.some(
              (matched) =>
                matched.toLowerCase() ===
                skill.toLowerCase()
            )
        );

      const readiness = requiredSkills.length
        ? Math.round(
            (matchedSkills.length /
              requiredSkills.length) *
              100
          )
        : data.readiness_score ?? 0;

      onAnalyze({
        role: data.target_role || role,
        roleRecognized:
          data.role_recognized !== false,
        resume,
        resources,
        readiness,
        detectedSkills:
          data.detected_skills || [],
        matchedSkills,
        selfReportedSkills:
          selfReportedMatches,
        missingSkills,
        requiredSkills,
        roadmap: data.roadmap || [],
        learningResources:
          data.learning_resources || {},
        recommendedProject:
          data.recommended_project || null,

        // CareerLenz Intelligence
        careerSummary:
          data.career_summary || "",
        highestPriorityGap:
          data.highest_priority_gap || null,
        strengthSummary:
          data.strength_summary || "",
        improvementAdvice:
          data.improvement_advice || "",
        whyPriorityGapMatters:
          data.why_priority_gap_matters || "",
        recommendedAction:
          data.recommended_action || "",
        estimatedImpact:
          data.estimated_impact || null,

        // Resume Quality Analysis
        resumeQuality:
          data.resume_quality || null,
        resumeQualityScore:
          data.resume_quality_score ?? null,
        resumeQualityLabel:
          data.resume_quality_label || "",
        resumeFeedback:
          data.resume_feedback || [],

        // 30-Day Action Plan
        actionPlan30Days:
          data.action_plan_30_days || null,

        // Resume Bullet Improver
        bulletImprovements:
          data.bullet_improvements || [],

        // Best-Fit Role Comparison
        roleComparison:
          data.role_comparison || null,
      });
    } catch (error) {
      if (error.name === "AbortError") {
        setErrors({
          general:
            "That took too long, or was cancelled. Please check the backend is running and try again.",
        });
      } else {
        console.error(
          "CareerLenz analysis error:",
          error
        );

        setErrors({
          general:
            error.message ||
            "Could not connect to the CareerLenz backend.",
        });
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const isReady = Boolean(
    role && resume && !loading
  );

  return (
    <main className="cl-analysis">
      <div className="cl-analysis-container">
        <button
          type="button"
          className="cl-back-button"
          onClick={handleBack}
        >
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
          Choose your target role and upload your resume.
          CareerLenz will detect your skills automatically.
        </p>

        <div className="cl-analysis-form">
          <label htmlFor="cl-role">
            Target Role
          </label>

          <select
            id="cl-role"
            value={role}
            aria-invalid={Boolean(errors.role)}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                role: event.target.value,
              }))
            }
          >
            <option value="">
              Select your target role
            </option>

            {Object.keys(ROLE_SKILLS).map(
              (roleName) => (
                <option
                  key={roleName}
                  value={roleName}
                >
                  {roleName}
                </option>
              )
            )}
          </select>

          {errors.role && (
            <p className="cl-field-error">
              {errors.role}
            </p>
          )}

          <label htmlFor="cl-skills">
            Current Skills
          </label>

          <textarea
            id="cl-skills"
            value={skills}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                skills: event.target.value,
              }))
            }
            placeholder="Optional: Python, React, SQL..."
          />

          <p className="cl-field-hint">
            Optional. CareerLenz primarily detects skills
            from your resume. Skills entered here that match
            a required skill are marked as self-reported.
          </p>

          <label htmlFor="cl-resume">
            Upload Resume
          </label>

          <div className="cl-upload-box">
            <input
              id="cl-resume"
              type="file"
              accept=".pdf,application/pdf"
              aria-invalid={Boolean(errors.resume)}
              onChange={handleFileChange}
            />

            <div className="cl-upload-icon">
              ↑
            </div>

            <div>
              <strong>
                {resume
                  ? resume.name
                  : "Choose your PDF resume"}
              </strong>

              <span>
                {resume
                  ? "Resume ready for analysis"
                  : "PDF only • Maximum 8MB"}
              </span>
            </div>
          </div>

          {errors.resume && (
            <p className="cl-field-error">
              {errors.resume}
            </p>
          )}

          <div className="cl-resources-section">
            <h2>Learning Resources</h2>

            <p className="cl-resource-description">
              Add courses, videos, projects, or books
              you're currently working on.
            </p>

            <div className="cl-resource-form">
              <select
                aria-label="Resource type"
                value={resourceType}
                onChange={(event) =>
                  setResourceType(event.target.value)
                }
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
                onChange={(event) =>
                  setResourceName(event.target.value)
                }
              />

              <input
                type="number"
                aria-label="Progress percent"
                min="0"
                max="100"
                placeholder="Progress %"
                value={resourceProgress}
                onChange={(event) =>
                  setResourceProgress(
                    event.target.value
                  )
                }
                onBlur={(event) =>
                  setResourceProgress(
                    clampProgress(event.target.value)
                  )
                }
              />

              <button
                type="button"
                className="cl-add-resource"
                onClick={addResource}
              >
                + Add Resource
              </button>
            </div>

            {errors.resource && (
              <p className="cl-field-error">
                {errors.resource}
              </p>
            )}

            {resources.length > 0 && (
              <div className="cl-resource-list">
                {resources.map((resource) => (
                  <div
                    className="cl-resource-card"
                    key={resource.id}
                  >
                    <div className="cl-resource-card-top">
                      <div>
                        <span className="cl-resource-type">
                          {resource.type}
                        </span>

                        <h3>{resource.name}</h3>
                      </div>

                      <button
                        type="button"
                        className="cl-delete-resource"
                        aria-label={`Remove ${resource.name}`}
                        onClick={() =>
                          deleteResource(resource.id)
                        }
                      >
                        ×
                      </button>
                    </div>

                    <div className="cl-progress-info">
                      <span>Progress</span>
                      <span>
                        {resource.progress}%
                      </span>
                    </div>

                    <div className="cl-progress-bar">
                      <div
                        className="cl-progress-fill"
                        style={{
                          width: `${resource.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errors.general && (
            <div
              className="cl-analysis-error"
              role="alert"
            >
              {errors.general}
            </div>
          )}

          <button
            type="button"
            className="cl-cta cl-analyze-button"
            onClick={handleAnalyze}
            disabled={!isReady}
          >
            {loading
              ? "Analyzing Resume..."
              : "Analyze My Resume"}

            {!loading && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
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
            <button
              type="button"
              className="cl-cancel-button"
              onClick={cancelAnalysis}
            >
              Cancel analysis
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   SKILL GAP CARD
========================================================= */

function SkillGapCard({
  skill,
  info,
  onLearn,
  onPractice,
}) {
  return (
    <div className="cl-gap-card">
      <div className="cl-gap-card-header">
        <div>
          <p className="cl-result-label">
            SKILL GAP
          </p>

          <h3>{skill}</h3>
        </div>

        <span className="cl-gap-badge">
          {info.difficulty}
        </span>
      </div>

      <p className="cl-gap-description">
        {info.description}
      </p>

      <div className="cl-gap-topics">
        {info.topics.map((topic) => (
          <span key={topic}>{topic}</span>
        ))}
      </div>

      <div className="cl-gap-footer">
        <span>⏱ {info.time}</span>

        <div className="cl-gap-actions">
          <button
            type="button"
            onClick={(event) =>
              onLearn(
                skill,
                info,
                event.currentTarget
              )
            }
          >
            Learn
          </button>

          <button
            type="button"
            onClick={(event) =>
              onPractice(
                skill,
                info,
                event.currentTarget
              )
            }
          >
            Practice
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LEARNING PANEL
========================================================= */

function LearningPanel({
  skill,
  info,
  focusSection,
  completed,
  onToggleTopic,
  onClose,
}) {
  const closeButtonRef = useRef(null);
  const practiceRef = useRef(null);

  const [highlightPractice, setHighlightPractice] =
    useState(false);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (
      focusSection === "practice" &&
      practiceRef.current
    ) {
      practiceRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setHighlightPractice(true);

      const timer = setTimeout(
        () => setHighlightPractice(false),
        1600
      );

      return () => clearTimeout(timer);
    }
  }, [focusSection]);

  const progress =
    info.topics.length === 0
      ? 0
      : Math.round(
          (completed.length /
            info.topics.length) *
            100
        );

  return (
    <div
      className="cl-learning-overlay"
      onClick={onClose}
    >
      <div
        className="cl-learning-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Learning path for ${skill}`}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="cl-learning-close"
          onClick={onClose}
          aria-label="Close learning panel"
        >
          ×
        </button>

        <p className="cl-result-label">
          LEARNING PATH
        </p>

        <h2>{skill}</h2>

        <p className="cl-learning-description">
          {info.description}
        </p>

        <div className="cl-learning-meta">
          <span>{info.difficulty}</span>
          <span>⏱ {info.time}</span>
        </div>

        <div className="cl-learning-progress">
          <div className="cl-learning-progress-header">
            <span>Your progress</span>
            <strong>{progress}%</strong>
          </div>

          <div
            className="cl-progress-bar"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="cl-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <p className="cl-result-label">
          WHAT TO LEARN
        </p>

        <div className="cl-learning-topics">
          {info.topics.map(
            (topic, index) => {
              const isCompleted =
                completed.includes(topic);

              return (
                <button
                  key={topic}
                  type="button"
                  className={`cl-learning-topic ${
                    isCompleted
                      ? "completed"
                      : ""
                  }`}
                  aria-pressed={isCompleted}
                  onClick={() =>
                    onToggleTopic(topic)
                  }
                >
                  <span className="cl-topic-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <span className="cl-topic-name">
                    {topic}
                  </span>

                  <span
                    className="cl-topic-check"
                    aria-hidden="true"
                  >
                    {isCompleted ? "✓" : "○"}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {info.resources?.length > 0 && (
          <div className="cl-learning-resources">
            <div className="cl-learning-resources-heading">
              <div>
                <p className="cl-result-label">
                  RECOMMENDED RESOURCES
                </p>

                <h3>
                  Learn from trusted sources
                </h3>
              </div>

              <span className="cl-resource-count">
                {info.resources.length} resources
              </span>
            </div>

            <p className="cl-learning-resources-copy">
              Open any resource in a new tab and use it
              alongside the learning path above.
            </p>

            <div className="cl-learning-resource-list">
              {info.resources.map((resource, index) => (
                <a
                  className="cl-learning-resource-link"
                  key={`${resource.url}-${index}`}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="cl-learning-resource-main">
                    <span className="cl-learning-resource-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <h4>{resource.title}</h4>

                      <div className="cl-learning-resource-meta">
                        <span>{resource.provider}</span>
                        <span>•</span>
                        <span>{resource.type}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className="cl-learning-resource-arrow"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div
          ref={practiceRef}
          className={`cl-learning-practice ${
            highlightPractice
              ? "cl-highlight"
              : ""
          }`}
        >
          <p className="cl-result-label">
            PRACTICE PROJECT
          </p>

          <h3>{info.practice}</h3>

          <p>
            Build this project to turn your new
            knowledge into practical experience.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RESULTS PAGE
========================================================= */


function ResumeBulletImprover({ improvements = [] }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copySuggestion = async (suggestion, index) => {
    try {
      await navigator.clipboard.writeText(suggestion);
      setCopiedIndex(index);

      window.setTimeout(() => {
        setCopiedIndex(null);
      }, 1800);
    } catch {
      setCopiedIndex(null);
    }
  };

  return (
    <section className="cl-bullet-improver-card">
      <div className="cl-bullet-improver-header">
        <div>
          <p className="cl-result-label">
            RESUME BULLET IMPROVER
          </p>

          <h2>
            Strengthen how your experience is presented.
          </h2>

          <p className="cl-bullet-improver-intro">
            CareerLenz identifies resume lines that could
            communicate technical depth and impact more clearly.
            Suggestions use placeholders instead of inventing facts.
          </p>
        </div>

        <span className="cl-bullet-count">
          {improvements.length} suggestions
        </span>
      </div>

      <div className="cl-bullet-improvement-list">
        {improvements.map((item, index) => (
          <article
            className="cl-bullet-improvement-item"
            key={`${item.original}-${index}`}
          >
            <div className="cl-bullet-improvement-top">
              <span className="cl-bullet-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="cl-bullet-impact-status">
                <span
                  className={`cl-bullet-impact-dot ${
                    item.has_measurable_impact
                      ? "has-impact"
                      : "needs-impact"
                  }`}
                />

                {item.has_measurable_impact
                  ? "MEASURABLE IMPACT FOUND"
                  : "IMPACT CAN BE STRONGER"}
              </div>
            </div>

            <div className="cl-bullet-before-after">
              <div className="cl-bullet-block cl-bullet-before">
                <p className="cl-bullet-block-label">
                  CURRENT
                </p>

                <p>{item.original}</p>
              </div>

              <div className="cl-bullet-arrow" aria-hidden="true">
                →
              </div>

              <div className="cl-bullet-block cl-bullet-after">
                <div className="cl-bullet-after-heading">
                  <p className="cl-bullet-block-label">
                    SUGGESTED STRUCTURE
                  </p>

                  <button
                    type="button"
                    className="cl-copy-bullet-button"
                    onClick={() =>
                      copySuggestion(
                        item.suggestion,
                        index
                      )
                    }
                  >
                    {copiedIndex === index
                      ? "Copied ✓"
                      : "Copy Suggestion"}
                  </button>
                </div>

                <p>{item.suggestion}</p>
              </div>
            </div>

            <div className="cl-bullet-reason-row">
              <div>
                <span>WHY BETTER</span>
                <p>{item.reason}</p>
              </div>

              {item.skills_detected?.length > 0 && (
                <div className="cl-bullet-skill-tags">
                  {item.skills_detected.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="cl-bullet-warning">
              <strong>KEEP IT TRUE</strong>
              <p>{item.warning}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}



function downloadCareerReport(data) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const margin = 46;
  const contentWidth =
    pageWidth - margin * 2;

  let y = 52;

  const ensureSpace = (needed = 70) => {
    if (y + needed > pageHeight - 48) {
      doc.addPage();
      y = 52;
    }
  };
  const addSectionTitle = (text) => {
    ensureSpace(42);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    doc.text(
      text.toUpperCase(),
      margin,
      y
    );

    y += 18;
  };

  const addParagraph = (
    text,
    {
      size = 10,
      bold = false,
      indent = 0,
      gap = 10,
    } = {}
  ) => {
    if (!text) return;

    doc.setFont(
      "helvetica",
      bold ? "bold" : "normal"
    );

    doc.setFontSize(size);

    const lines =
      doc.splitTextToSize(
        String(text),
        contentWidth - indent
      );

    const lineHeight =
      size * 1.45;

    ensureSpace(
      lines.length * lineHeight + gap
    );

    doc.text(
      lines,
      margin + indent,
      y
    );

    y +=
      lines.length * lineHeight +
      gap;
  };

  const addBullet = (text) => {
    if (!text) return;

    const bulletIndent = 14;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9.5);

    const lines =
      doc.splitTextToSize(
        String(text),
        contentWidth - 24
      );

    const lineHeight = 14;

    ensureSpace(
      lines.length * lineHeight + 7
    );

    doc.text(
      "•",
      margin,
      y
    );

    doc.text(
      lines,
      margin + bulletIndent,
      y
    );

    y +=
      lines.length * lineHeight +
      7;
  };

  const addDivider = () => {
    ensureSpace(20);

    doc.setDrawColor(205);

    doc.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 18;
  };

  const role =
    data.role || "Target Role";

  doc.setProperties({
    title:
      `CareerLenz Career Report - ${role}`,
    subject:
      "Career readiness and development report",
    author:
      "CareerLenz",
  });

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(24);

  doc.text(
    "CareerLenz",
    margin,
    y
  );

  y += 25;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(11);

  doc.text(
    "Personalized Career Readiness Report",
    margin,
    y
  );

  y += 28;

  addDivider();

  addParagraph(
    `Target Role: ${role}`,
    {
      size: 12,
      bold: true,
      gap: 6,
    }
  );

  addParagraph(
    `Career Readiness: ${data.readiness ?? 0}%`,
    {
      size: 12,
      bold: true,
      gap: 14,
    }
  );

  if (data.careerSummary) {
    addSectionTitle(
      "Career Summary"
    );

    addParagraph(
      data.careerSummary
    );
  }

  if (data.strengthSummary) {
    addSectionTitle(
      "Strengths"
    );

    addParagraph(
      data.strengthSummary
    );
  }

  if (data.highestPriorityGap) {
    addSectionTitle(
      "Highest Priority Gap"
    );

    addParagraph(
      data.highestPriorityGap,
      {
        bold: true,
        gap: 5,
      }
    );

    addParagraph(
      data.whyPriorityGapMatters
    );
  }

  if (
    data.roleComparison?.rankings?.length
  ) {
    addSectionTitle(
      "Career Path Comparison"
    );

    data.roleComparison.rankings.forEach(
      (item, index) => {
        const flags = [];

        if (index === 0) {
          flags.push("BEST MATCH");
        }

        if (
          item.role?.toLowerCase() ===
          data.role?.toLowerCase()
        ) {
          flags.push("YOUR TARGET");
        }

        addParagraph(
          `${index + 1}. ${item.role} - ${
            item.score
          }%${
            flags.length
              ? ` (${flags.join(", ")})`
              : ""
          }`,
          {
            bold: true,
            gap: 4,
          }
        );

        addParagraph(
          `Matched ${
            item.matched_count
          } of ${
            item.required_count
          } tracked skills.`,
          {
            size: 9,
            gap: 4,
          }
        );

        if (
          item.missing_skills?.length
        ) {
          addParagraph(
            `Next gaps: ${
              item.missing_skills
                .slice(0, 4)
                .join(", ")
            }`,
            {
              size: 9,
              gap: 7,
            }
          );
        }
      }
    );

    if (
      data.roleComparison.insight
    ) {
      addParagraph(
        data.roleComparison.insight,
        {
          size: 9.5,
          bold: true,
          gap: 12,
        }
      );
    }
  }

  addSectionTitle(
    "Skill Snapshot"
  );

  addParagraph(
    `Matched skills: ${
      (data.matchedSkills || [])
        .join(", ") ||
      "None detected"
    }`
  );

  addParagraph(
    `Missing skills: ${
      (data.missingSkills || [])
        .join(", ") ||
      "No tracked gaps"
    }`
  );

  if (data.resumeQuality) {
    addSectionTitle(
      "Resume Quality"
    );

    addParagraph(
      `Overall Score: ${
        data.resumeQuality.overall_score ?? 0
      }/100 - ${
        data.resumeQuality.quality_label ||
        "Not rated"
      }`,
      {
        bold: true,
        gap: 6,
      }
    );

    addBullet(
      `Skills Coverage: ${
        data.resumeQuality.skills_score ?? 0
      }%`
    );

    addBullet(
      `Projects: ${
        data.resumeQuality.projects_score ?? 0
      }%`
    );

    addBullet(
      `Experience: ${
        data.resumeQuality.experience_score ?? 0
      }%`
    );

    addBullet(
      `Measurable Impact: ${
        data.resumeQuality.impact_score ?? 0
      }%`
    );

    addBullet(
      `Completeness: ${
        data.resumeQuality.completeness_score ?? 0
      }%`
    );

    if (
      data.resumeFeedback?.length
    ) {
      addParagraph(
        "Top resume improvements:",
        {
          bold: true,
          gap: 5,
        }
      );

      data.resumeFeedback.forEach(
        addBullet
      );
    }
  }

  if (
    data.bulletImprovements?.length
  ) {
    addSectionTitle(
      "Resume Bullet Improver"
    );

    data.bulletImprovements
      .slice(0, 4)
      .forEach(
        (item, index) => {
          addParagraph(
            `Suggestion ${index + 1}`,
            {
              bold: true,
              gap: 4,
            }
          );

          addParagraph(
            `Current: ${item.original}`,
            {
              size: 9.5,
              gap: 5,
            }
          );

          addParagraph(
            `Suggested structure: ${item.suggestion}`,
            {
              size: 9.5,
              gap: 5,
            }
          );

          addParagraph(
            `Why: ${item.reason}`,
            {
              size: 9,
              gap: 12,
            }
          );
        }
      );

    addParagraph(
      "Important: Replace placeholders only with facts you can truthfully support.",
      {
        size: 8.5,
        bold: true,
      }
    );
  }

  if (
    data.roadmap?.length
  ) {
    addSectionTitle(
      "Learning Roadmap"
    );

    data.roadmap.forEach(
      (item, index) => {
        addParagraph(
          `${index + 1}. ${
            item.title || item.skill
          } - ${
            item.time || ""
          }`,
          {
            bold: true,
            gap: 4,
          }
        );

        addParagraph(
          item.description,
          {
            size: 9.5,
            gap: 4,
          }
        );

        if (
          item.topics?.length
        ) {
          addParagraph(
            `Topics: ${item.topics.join(", ")}`,
            {
              size: 9,
              gap: 5,
            }
          );
        }

        if (
          item.resources?.length
        ) {
          item.resources.forEach(
            (resource) => {
              addBullet(
                `${resource.title} - ${
                  resource.provider
                } (${resource.type})`
              );
            }
          );
        }

        if (item.practice) {
          addParagraph(
            `Practice: ${item.practice}`,
            {
              size: 9,
              gap: 10,
            }
          );
        }
      }
    );
  }

  if (data.recommendedProject) {
    addSectionTitle(
      "Recommended Project"
    );

    addParagraph(
      data.recommendedProject.title,
      {
        bold: true,
        gap: 5,
      }
    );

    addParagraph(
      data.recommendedProject.description
    );

    if (
      data.recommendedProject.skills?.length
    ) {
      addParagraph(
        `Skills to demonstrate: ${
          data.recommendedProject.skills.join(", ")
        }`,
        {
          size: 9.5,
        }
      );
    }
  }

  if (
    data.actionPlan30Days?.weeks?.length
  ) {
    addSectionTitle(
      "30-Day Action Plan"
    );

    data.actionPlan30Days.weeks.forEach(
      (week) => {
        addParagraph(
          `Week ${week.week}: ${week.title}`,
          {
            bold: true,
            gap: 5,
          }
        );

        if (
          week.focus_skills?.length
        ) {
          addParagraph(
            `Focus: ${week.focus_skills.join(", ")}`,
            {
              size: 9,
              gap: 4,
            }
          );
        }

        (week.tasks || []).forEach(
          addBullet
        );

        y += 5;
      }
    );
  }

  if (
    data.improvementAdvice ||
    data.recommendedAction
  ) {
    addSectionTitle(
      "Next Move"
    );

    addParagraph(
      data.improvementAdvice
    );

    addParagraph(
      data.recommendedAction
    );
  }

  addDivider();

  addParagraph(
    "Generated by CareerLenz. This report is intended as career-planning guidance and should be reviewed before use in applications.",
    {
      size: 8,
      gap: 0,
    }
  );

  const safeRole =
    role
      .replace(
        /[^a-z0-9]+/gi,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      )
      .toLowerCase();

  doc.save(
    `careerlenz-${safeRole || "career"}-report.pdf`
  );
}


function Results({ data, onBack }) {
  const [activeSkill, setActiveSkill] =
    useState(null);

  const [
    completedBySkill,
    setCompletedBySkill,
  ] = useState({});

  const returnFocusRef = useRef(null);

  const matchedSkills =
    data.matchedSkills || [];

  const missingSkills =
    data.missingSkills || [];

  const requiredSkills =
    data.requiredSkills || [];

  const detectedSkills =
    data.detectedSkills || [];

  const resources =
    data.resources || [];

  const roadmap =
    data.roadmap || [];

  const matchedCount =
    matchedSkills.length;

  const missingCount =
    missingSkills.length;

  const requiredCount =
    requiredSkills.length;

  const selfReported = new Set(
    (data.selfReportedSkills || []).map(
      (skill) => skill.toLowerCase()
    )
  );

  const requiredSet = new Set(
    requiredSkills.map((skill) =>
      skill.toLowerCase()
    )
  );

  const readiness = Math.max(
    0,
    Math.min(
      100,
      Number(data.readiness) || 0
    )
  );

  const openSkillPanel = (
    skill,
    info,
    focusSection,
    triggerEl
  ) => {
    returnFocusRef.current =
      triggerEl || null;

    setActiveSkill({
      skill,
      info,
      focusSection,
    });
  };

  const closeSkillPanel = () => {
    setActiveSkill(null);
    returnFocusRef.current?.focus();
  };

  const toggleTopic = (
    skill,
    topic
  ) => {
    const key = skill.toLowerCase();

    setCompletedBySkill(
      (previous) => {
        const current =
          previous[key] || [];

        const next = current.includes(
          topic
        )
          ? current.filter(
              (item) => item !== topic
            )
          : [...current, topic];

        return {
          ...previous,
          [key]: next,
        };
      }
    );
  };

  const getReadinessMessage = () => {
    if (readiness >= 85) {
      return "Excellent match. You're already very close to the target role.";
    }

    if (readiness >= 70) {
      return "Strong foundation. Focus on your remaining skill gaps to become more competitive.";
    }

    if (readiness >= 50) {
      return "You're making progress. A focused learning plan can significantly improve your readiness.";
    }

    return "You have room to grow. Start with the highest-priority skill gaps below.";
  };

  return (
    <main className="cl-analysis">
      <div className="cl-analysis-container">
        <button
          type="button"
          className="cl-back-button"
          onClick={onBack}
        >
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
          Here's what CareerLenz found based on
          your target role and uploaded resume.
        </p>

        {data.roleComparison?.rankings?.length > 0 && (
          <section className="cl-role-comparison-card">
            <div className="cl-role-comparison-header">
              <div>
                <p className="cl-result-label">
                  CAREER PATH INTELLIGENCE
                </p>

                <h2>
                  Your best-fit roles based on this resume.
                </h2>

                <p>
                  CareerLenz compares your resume-detected skills
                  against every supported role and ranks your
                  current alignment.
                </p>
              </div>

              {data.roleComparison.best_fit_role && (
                <div className="cl-best-fit-summary">
                  <span>BEST MATCH</span>
                  <strong>
                    {data.roleComparison.best_fit_role.role}
                  </strong>
                  <em>
                    {data.roleComparison.best_fit_role.score}%
                  </em>
                </div>
              )}
            </div>

            <div className="cl-role-ranking-list">
              {data.roleComparison.rankings.map((item, index) => {
                const isBest = index === 0;

                const isTarget =
                  item.role?.toLowerCase() ===
                  data.role?.toLowerCase();

                return (
                  <article
                    className={`cl-role-ranking-row ${
                      isBest ? "is-best" : ""
                    } ${
                      isTarget ? "is-target" : ""
                    }`}
                    key={item.role}
                  >
                    <div className="cl-role-rank-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="cl-role-rank-main">
                      <div className="cl-role-rank-top">
                        <div>
                          <h3>{item.role}</h3>

                          <div className="cl-role-rank-badges">
                            {isBest && (
                              <span className="cl-role-best-badge">
                                ★ BEST MATCH
                              </span>
                            )}

                            {isTarget && (
                              <span className="cl-role-target-badge">
                                YOUR TARGET
                              </span>
                            )}
                          </div>
                        </div>

                        <strong>
                          {item.score}%
                        </strong>
                      </div>

                      <div className="cl-role-score-track">
                        <div
                          className="cl-role-score-fill"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, item.score || 0)
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="cl-role-rank-meta">
                        <span>
                          {item.matched_count} / {item.required_count}{" "}
                          tracked skills matched
                        </span>

                        {item.missing_skills?.length > 0 && (
                          <span>
                            Next gaps:{" "}
                            {item.missing_skills
                              .slice(0, 3)
                              .join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {data.roleComparison.insight && (
              <div className="cl-role-comparison-insight">
                <span>CAREERLENZ INSIGHT</span>
                <p>{data.roleComparison.insight}</p>
              </div>
            )}

            {data.roleComparison.method && (
              <p className="cl-role-comparison-method">
                {data.roleComparison.method}
              </p>
            )}
          </section>
        )}

        <section className="cl-report-download-card">
          <div className="cl-report-download-copy">
            <p className="cl-result-label">
              CAREERLENZ REPORT
            </p>

            <h2>
              Take your career plan with you.
            </h2>

            <p>
              Download a PDF containing your readiness
              score, resume quality, skill gaps, learning
              roadmap, course references, bullet
              suggestions, recommended project, and
              30-day action plan.
            </p>
          </div>

          <button
            type="button"
            className="cl-download-report-button"
            onClick={() =>
              downloadCareerReport(data)
            }
          >
            <span aria-hidden="true">
              ↓
            </span>
            Download Career Report
          </button>
        </section>

        {data.roleRecognized === false && (
          <div
            className="cl-notice-message"
            role="status"
          >
            We didn't recognize "
            {data.role}" as one of our tracked
            roles, so this analysis uses a
            general baseline skill set.
          </div>
        )}

        {/* READINESS HERO */}

        <section className="cl-readiness-hero">
          <div className="cl-readiness-ring-large">
            <ReadinessRing value={readiness} />
          </div>

          <div className="cl-readiness-copy">
            <p className="cl-result-label">
              CAREER READINESS
            </p>

            <h2>{readiness}%</h2>

            <p>
              You currently match{" "}
              <strong>
                {matchedCount}
              </strong>{" "}
              out of{" "}
              <strong>
                {requiredCount}
              </strong>{" "}
              required skills.
            </p>

            <div className="cl-readiness-message">
              {getReadinessMessage()}
            </div>
          </div>

          <div className="cl-target-mini">
            <span>TARGET ROLE</span>
            <strong>{data.role}</strong>
          </div>
        </section>

        {/* CAREERLENZ INTELLIGENCE */}

        {data.careerSummary && (
          <section className="cl-intelligence-card">
            <div className="cl-intelligence-heading">
              <div>
                <p className="cl-result-label">
                  CAREERLENZ INTELLIGENCE
                </p>

                <h2>
                  Your personalized career insight
                </h2>
              </div>

              <span className="cl-intelligence-badge">
                ✦ INSIGHT
              </span>
            </div>

            <p className="cl-intelligence-summary">
              {data.careerSummary}
            </p>

            <div className="cl-intelligence-grid">
              <div className="cl-intelligence-item">
                <span className="cl-intelligence-icon">
                  ✓
                </span>

                <div>
                  <p className="cl-result-label">
                    YOUR STRENGTH
                  </p>

                  <p>
                    {data.strengthSummary}
                  </p>
                </div>
              </div>

              <div className="cl-intelligence-item priority">
                <span className="cl-intelligence-icon">
                  !
                </span>

                <div>
                  <p className="cl-result-label">
                    HIGHEST PRIORITY GAP
                  </p>

                  <h3>
                    {data.highestPriorityGap ||
                      "No major gap"}
                  </h3>

                  <p>
                    {data.whyPriorityGapMatters}
                  </p>
                </div>
              </div>
            </div>

            <div className="cl-intelligence-action">
              <p className="cl-result-label">
                RECOMMENDED ACTION
              </p>

              <h3>
                What should you do next?
              </h3>

              <p>
                {data.recommendedAction}
              </p>
            </div>

            {data.estimatedImpact && (
              <div className="cl-impact-section">
                <div>
                  <p className="cl-result-label">
                    POTENTIAL IMPACT
                  </p>

                  <p className="cl-impact-message">
                    {data.estimatedImpact.message}
                  </p>
                </div>

                <div className="cl-impact-score">
                  <div>
                    <span>NOW</span>

                    <strong>
                      {
                        data.estimatedImpact
                          .current_readiness
                      }%
                    </strong>
                  </div>

                  <span className="cl-impact-arrow">
                    →
                  </span>

                  <div>
                    <span>PROJECTED</span>

                    <strong>
                      {
                        data.estimatedImpact
                          .projected_readiness
                      }%
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <div className="cl-intelligence-advice">
              <strong>
                CareerLenz advice:
              </strong>{" "}
              {data.improvementAdvice}
            </div>
          </section>
        )}

        {/* DASHBOARD */}

        <section className="cl-skill-dashboard">
          <div className="cl-dashboard-header">
            <div>
              <p className="cl-result-label">
                SKILL GAP DASHBOARD
              </p>

              <h2>
                Your career snapshot
              </h2>
            </div>

            <div className="cl-dashboard-score">
              {readiness}%
            </div>
          </div>

          <div className="cl-dashboard-bar">
            <div
              className="cl-dashboard-bar-fill"
              style={{
                width: `${readiness}%`,
              }}
            />
          </div>

          <div className="cl-dashboard-stats">
            <div className="cl-dashboard-stat">
              <span>Matched</span>
              <strong>{matchedCount}</strong>
              <small>skills</small>
            </div>

            <div className="cl-dashboard-stat">
              <span>Skill Gaps</span>
              <strong>{missingCount}</strong>
              <small>to improve</small>
            </div>

            <div className="cl-dashboard-stat">
              <span>Required</span>
              <strong>{requiredCount}</strong>
              <small>total skills</small>
            </div>
          </div>

          <div className="cl-dashboard-columns">
            <div>
              <p className="cl-result-label">
                YOUR STRENGTHS
              </p>

              <div className="cl-skill-list">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map(
                    (skill) => (
                      <span
                        className={`cl-skill matched ${
                          selfReported.has(
                            skill.toLowerCase()
                          )
                            ? "self-reported"
                            : ""
                        }`}
                        key={skill}
                      >
                        ✓ {skill}

                        {selfReported.has(
                          skill.toLowerCase()
                        ) &&
                          " (self-reported)"}
                      </span>
                    )
                  )
                ) : (
                  <p className="cl-result-text">
                    No matching skills detected
                    yet.
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="cl-result-label">
                FOCUS AREAS
              </p>

              <div className="cl-skill-list">
                {missingSkills.length >
                0 ? (
                  missingSkills.map(
                    (skill) => (
                      <span
                        className="cl-skill missing"
                        key={skill}
                      >
                        + {skill}
                      </span>
                    )
                  )
                ) : (
                  <p className="cl-result-text">
                    🎉 No major skill gaps
                    detected.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RESUME QUALITY */}

        {data.resumeQuality && (
          <section className="cl-resume-quality-card">
            <div className="cl-resume-quality-header">
              <div>
                <p className="cl-result-label">
                  RESUME QUALITY
                </p>

                <h2>
                  How strong is your resume?
                </h2>
              </div>

              <div className="cl-resume-quality-score">
                <strong>
                  {data.resumeQuality.overall_score}
                </strong>
                <span>/100</span>
              </div>
            </div>

            <div className="cl-resume-quality-label-row">
              <span className="cl-quality-badge">
                {data.resumeQuality.quality_label}
              </span>

              <p>
                CareerLenz evaluates how clearly your
                resume communicates skills, projects,
                experience, measurable impact and
                overall completeness.
              </p>
            </div>

            <div className="cl-quality-metrics">
              {[
                {
                  label: "Skills Coverage",
                  value: data.resumeQuality.skills_score,
                },
                {
                  label: "Projects",
                  value: data.resumeQuality.projects_score,
                },
                {
                  label: "Experience",
                  value: data.resumeQuality.experience_score,
                },
                {
                  label: "Measurable Impact",
                  value: data.resumeQuality.impact_score,
                },
                {
                  label: "Completeness",
                  value: data.resumeQuality.completeness_score,
                },
              ].map((metric) => (
                <div
                  className="cl-quality-metric"
                  key={metric.label}
                >
                  <div className="cl-quality-metric-top">
                    <span>{metric.label}</span>
                    <strong>{metric.value}%</strong>
                  </div>

                  <div className="cl-quality-progress">
                    <div
                      className="cl-quality-progress-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, Number(metric.value) || 0)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="cl-quality-details-grid">
              <div className="cl-quality-detail">
                <p className="cl-result-label">
                  SECTIONS DETECTED
                </p>

                <div className="cl-quality-tags">
                  {Object.entries(
                    data.resumeQuality.sections_detected || {}
                  ).map(([section, detected]) => (
                    <span
                      key={section}
                      className={`cl-quality-tag ${
                        detected ? "present" : "missing"
                      }`}
                    >
                      {detected ? "✓" : "×"}{" "}
                      {section.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="cl-quality-detail">
                <p className="cl-result-label">
                  PROFILE SIGNALS
                </p>

                <div className="cl-quality-tags">
                  {Object.entries(
                    data.resumeQuality.contact_details_detected || {}
                  ).map(([signal, detected]) => (
                    <span
                      key={signal}
                      className={`cl-quality-tag ${
                        detected ? "present" : "missing"
                      }`}
                    >
                      {detected ? "✓" : "×"}{" "}
                      {signal.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>

                <p className="cl-quality-small-text">
                  Action-oriented verbs detected:{" "}
                  <strong>
                    {data.resumeQuality.action_verb_count ?? 0}
                  </strong>
                </p>
              </div>
            </div>

            {(data.resumeFeedback?.length > 0 ||
              data.resumeQuality.feedback?.length > 0) && (
              <div className="cl-resume-feedback">
                <p className="cl-result-label">
                  TOP RESUME IMPROVEMENTS
                </p>

                <div className="cl-feedback-list">
                  {(
                    data.resumeFeedback?.length
                      ? data.resumeFeedback
                      : data.resumeQuality.feedback || []
                  ).map((feedback, index) => (
                    <div
                      className="cl-feedback-item"
                      key={`${feedback}-${index}`}
                    >
                      <span className="cl-feedback-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <p>{feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.resumeQuality.impact_signals?.length > 0 && (
              <div className="cl-impact-signals">
                <p className="cl-result-label">
                  QUANTIFIED IMPACT FOUND
                </p>

                <div className="cl-quality-tags">
                  {data.resumeQuality.impact_signals.map(
                    (signal, index) => (
                      <span
                        className="cl-quality-tag present"
                        key={`${signal}-${index}`}
                      >
                        {signal}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* DETECTED SKILLS */}

        <section className="cl-result-card">
          <p className="cl-result-label">
            RESUME SKILLS DETECTED
          </p>

          <p className="cl-result-text">
            These are the skills CareerLenz
            detected directly from your resume.
          </p>

          <div className="cl-skill-list">
            {detectedSkills.length > 0 ? (
              detectedSkills.map(
                (skill) => {
                  const isRequired =
                    requiredSet.has(
                      skill.toLowerCase()
                    );

                  return (
                    <span
                      className={
                        isRequired
                          ? "cl-skill matched"
                          : "cl-skill detected"
                      }
                      key={skill}
                    >
                      {isRequired
                        ? "✓ "
                        : ""}
                      {skill}
                    </span>
                  );
                }
              )
            ) : (
              <p className="cl-result-text">
                No skills were detected.
              </p>
            )}
          </div>
        </section>

        {/* RESUME BULLET IMPROVER */}

        {data.bulletImprovements?.length > 0 && (
          <ResumeBulletImprover
            improvements={data.bulletImprovements}
          />
        )}

        {/* 30-DAY ACTION PLAN */}

        {data.actionPlan30Days?.weeks?.length > 0 && (
          <section className="cl-action-plan-card">
            <div className="cl-action-plan-header">
              <div>
                <p className="cl-result-label">
                  30-DAY ACTION PLAN
                </p>

                <h2>
                  Turn your analysis into a month of progress.
                </h2>

                <p className="cl-action-plan-intro">
                  A focused four-week plan built from your
                  current skill gaps, learning resources,
                  recommended project, and resume feedback.
                </p>
              </div>

              <div className="cl-action-plan-duration">
                <strong>
                  {data.actionPlan30Days.duration_days || 30}
                </strong>
                <span>DAYS</span>
              </div>
            </div>

            <div className="cl-action-plan-timeline">
              {data.actionPlan30Days.weeks.map(
                (week, index) => (
                  <article
                    className="cl-action-week"
                    key={week.week || index}
                  >
                    <div className="cl-action-week-marker">
                      <span>
                        {String(
                          week.week || index + 1
                        ).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="cl-action-week-content">
                      <div className="cl-action-week-top">
                        <div>
                          <p className="cl-action-week-label">
                            WEEK {week.week || index + 1}
                          </p>

                          <h3>{week.title}</h3>
                        </div>

                        {week.focus_skills?.length > 0 && (
                          <div className="cl-action-week-skills">
                            {week.focus_skills
                              .slice(0, 4)
                              .map((skill) => (
                                <span key={skill}>
                                  {skill}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="cl-action-task-list">
                        {(week.tasks || []).map(
                          (task, taskIndex) => (
                            <div
                              className="cl-action-task"
                              key={`${task}-${taskIndex}`}
                            >
                              <span className="cl-action-task-check">
                                ✓
                              </span>

                              <p>{task}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>

            <div className="cl-action-plan-note">
              <span>TIP</span>
              <p>
                Treat this as a flexible execution plan.
                If one skill takes longer, carry it into the
                next week instead of rushing through it.
              </p>
            </div>
          </section>
        )}

        {/* ACTIONABLE GAPS */}

        <section className="cl-result-card">
          <div className="cl-section-heading-row">
            <div>
              <p className="cl-result-label">
                ACTIONABLE SKILL GAPS
              </p>

              <h2>
                Turn gaps into progress.
              </h2>
            </div>

            <span className="cl-section-count">
              {missingCount} gaps
            </span>
          </div>

          <p className="cl-result-text">
            Every missing skill has a learning
            path and a practical project.
          </p>

          {missingSkills.length > 0 ? (
            <div className="cl-gap-grid">
              {missingSkills.map(
                (skill) => {
                  const info =
                    getSkillGapInfo(
                      skill,
                      roadmap
                    );

                  return (
                    <SkillGapCard
                      key={skill}
                      skill={skill}
                      info={info}
                      onLearn={(
                        selectedSkill,
                        selectedInfo,
                        triggerEl
                      ) =>
                        openSkillPanel(
                          selectedSkill,
                          selectedInfo,
                          "topics",
                          triggerEl
                        )
                      }
                      onPractice={(
                        selectedSkill,
                        selectedInfo,
                        triggerEl
                      ) =>
                        openSkillPanel(
                          selectedSkill,
                          selectedInfo,
                          "practice",
                          triggerEl
                        )
                      }
                    />
                  );
                }
              )}
            </div>
          ) : (
            <div className="cl-success-box">
              🎉 You currently have all the
              required skills for this role!
            </div>
          )}
        </section>

        {/* REQUIRED SKILLS */}

        <section className="cl-result-card">
          <p className="cl-result-label">
            ROLE REQUIREMENTS
          </p>

          <h2>
            Skills required for {data.role}
          </h2>

          <div className="cl-skill-list">
            {requiredSkills.map(
              (skill) => {
                const matched =
                  matchedSkills.some(
                    (item) =>
                      item.toLowerCase() ===
                      skill.toLowerCase()
                  );

                return (
                  <span
                    className={`cl-skill ${
                      matched
                        ? "matched"
                        : "required"
                    }`}
                    key={skill}
                  >
                    {matched ? "✓ " : ""}
                    {skill}
                  </span>
                );
              }
            )}
          </div>
        </section>

        {/* LEARNING RESOURCES */}

        {resources.length > 0 && (
          <section className="cl-result-card">
            <p className="cl-result-label">
              YOUR LEARNING RESOURCES
            </p>

            <h2>
              What you're already working on
            </h2>

            <div className="cl-result-resources">
              {resources.map(
                (resource) => (
                  <div
                    className="cl-result-resource"
                    key={resource.id}
                  >
                    <div>
                      <span className="cl-resource-type">
                        {resource.type}
                      </span>

                      <p>
                        {resource.name}
                      </p>
                    </div>

                    <strong>
                      {resource.progress}%
                    </strong>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* RECOMMENDED PROJECT */}

        {data.recommendedProject && (
          <section className="cl-result-card cl-project-card">
            <div className="cl-project-icon">
              🚀
            </div>

            <div>
              <p className="cl-result-label">
                RECOMMENDED PROJECT
              </p>

              <h2>
                {data.recommendedProject.title}
              </h2>

              <p className="cl-result-text">
                {
                  data.recommendedProject
                    .description
                }
              </p>

              {data.recommendedProject
                .skills?.length > 0 && (
                <div className="cl-skill-list">
                  {data.recommendedProject.skills.map(
                    (skill) => (
                      <span
                        className="cl-skill required"
                        key={skill}
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* RESUME */}

        <section className="cl-result-card cl-resume-card">
          <div className="cl-resume-icon">
            📄
          </div>

          <div>
            <p className="cl-result-label">
              ANALYZED RESUME
            </p>

            <h3>
              {data.resume?.name ||
                "Resume.pdf"}
            </h3>

            <p className="cl-result-text">
              Resume analyzed successfully.
            </p>
          </div>
        </section>

        {/* NEXT STEP */}

        <section className="cl-next-step">
          <div className="cl-next-step-number">
            NEXT
          </div>

          <div>
            <p className="cl-result-label">
              YOUR NEXT MOVE
            </p>

            <h2>
              Close your skill gaps.
            </h2>

            <p>
              CareerLenz identified the skills
              that can have the biggest impact on
              your journey toward{" "}
              <strong>{data.role}</strong>.
              Start with one gap, build one
              project, and keep improving.
            </p>
          </div>
        </section>

        {/* LEARNING MODAL */}

        {activeSkill && (
          <LearningPanel
            skill={activeSkill.skill}
            info={activeSkill.info}
            focusSection={
              activeSkill.focusSection
            }
            completed={
              completedBySkill[
                activeSkill.skill.toLowerCase()
              ] || []
            }
            onToggleTopic={(topic) =>
              toggleTopic(
                activeSkill.skill,
                topic
              )
            }
            onClose={closeSkillPanel}
          />
        )}
      </div>
    </main>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

const EMPTY_FORM = {
  role: "",
  skills: "",
  resume: null,
  resources: [],
};

function App() {
  const navigate = useNavigate();

  const [page, setPage] = useState("landing");

  const [form, setForm] = useState(EMPTY_FORM);

  const [analysisData, setAnalysisData] = useState(() => {
    try {
      const saved = sessionStorage.getItem("careerlenz-analysis");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Could not restore CareerLenz analysis:", error);
      return null;
    }
  });

  const handleAnalyze = (data) => {
    setAnalysisData(data);

    const storableData = {
      ...data,
      resume: data.resume
        ? {
            name: data.resume.name,
            size: data.resume.size,
            type: data.resume.type,
          }
        : null,
    };

    try {
      sessionStorage.setItem(
        "careerlenz-analysis",
        JSON.stringify(storableData)
      );
    } catch (error) {
      console.error("Could not save CareerLenz analysis:", error);
    }

    setPage("results");
    navigate("/dashboard");
  };

  if (window.location.pathname.startsWith("/dashboard")) {
    return (
      <Routes>
        <Route
          path="/dashboard"
          element={<Overview data={analysisData} />}
        />

        <Route
          path="/dashboard/resume"
          element={<ResumeAnalysis data={analysisData} />}
        />

        <Route
          path="/dashboard/skills"
          element={<SkillGap data={analysisData} />}
        />

        <Route
          path="/dashboard/roadmap"
          element={<Roadmap data={analysisData} />}
        />

        <Route
          path="/dashboard/projects"
          element={<Projects data={analysisData} />}
        />

        <Route
          path="/dashboard/resources"
          element={<Resources data={analysisData} />}
        />
      </Routes>
    );
  }

  if (page === "landing") {
    return (
      <LandingPage
        onStart={() => setPage("analysis")}
      />
    );
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

  if (page === "results" && analysisData) {
    return (
      <Results
        data={analysisData}
        onBack={() => setPage("analysis")}
      />
    );
  }

  return null;
}

export default App;