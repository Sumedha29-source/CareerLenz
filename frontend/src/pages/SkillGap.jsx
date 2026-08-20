import { useState } from "react";
import DashboardNav from "../components/DashboardNav";

function SkillGap({ data }) {
  const [selectedSkill, setSelectedSkill] = useState(null);

  if (!data) {
    return (
      <main className="cl-analysis">
        <DashboardNav />

        <div className="cl-analysis-container">
          <h1 className="cl-heading">
            No analysis available
          </h1>

          <p className="cl-body">
            Please analyze your career first.
          </p>
        </div>
      </main>
    );
  }

  const matchedSkills = data.matchedSkills || [];
  const missingSkills = data.missingSkills || [];
  const requiredSkills = data.requiredSkills || [];
  const roadmap = data.roadmap || [];

  const matchedCount = matchedSkills.length;
  const missingCount = missingSkills.length;
  const requiredCount = requiredSkills.length;

  const readiness = Math.max(
    0,
    Math.min(100, Number(data.readiness) || 0)
  );

  const skillDetails = missingSkills.map((skill) => {
  const roadmapItem = roadmap.find(
    (item) =>
      (item.skill || item.title || "")
        .toLowerCase() === skill.toLowerCase()
  );

  return {
    skill,
    difficulty:
      roadmapItem?.difficulty || "Intermediate",

    description:
      roadmapItem?.description ||
      `Build stronger ${skill} skills for ${data.role}.`,

    topics:
      roadmapItem?.topics || [
        "Fundamentals",
        "Practical Usage",
        "Projects",
      ],

    time:
      roadmapItem?.time || "5 days",

    practice:
      roadmapItem?.practice ||
      `Build a small project using ${skill}.`,

    resources:
      roadmapItem?.resources || [],
  };
});

  return (
    <main className="cl-analysis">
      <DashboardNav />

      <div className="cl-analysis-container">

        {/* HEADER */}

        <p className="cl-eyebrow">
          SKILL GAP ANALYSIS
        </p>

        <h1 className="cl-heading">
          Skill Gap
        </h1>

        <p className="cl-body">
          See which skills you already match and which ones
          should be your next focus for{" "}
          <strong>{data.role}</strong>.
        </p>


        {/* SNAPSHOT */}

        <section className="cl-skill-summary-card">

          <div className="cl-skill-summary-heading">

            <div>
              <p className="cl-result-label">
                CAREER SNAPSHOT
              </p>

              <h2>
                Your current skill position
              </h2>
            </div>

            <strong className="cl-skill-summary-score">
              {readiness}%
            </strong>

          </div>


          <div className="cl-skill-progress-track">
            <div
              className="cl-skill-progress-fill"
              style={{
                width: `${readiness}%`,
              }}
            />
          </div>


          <div className="cl-skill-stats">

            <div>
              <span>Matched</span>
              <strong>{matchedCount}</strong>
              <small>skills</small>
            </div>

            <div>
              <span>Skill Gaps</span>
              <strong>{missingCount}</strong>
              <small>to improve</small>
            </div>

            <div>
              <span>Required</span>
              <strong>{requiredCount}</strong>
              <small>tracked skills</small>
            </div>

          </div>

        </section>


        {/* MATCHED + MISSING */}

        <div className="cl-skill-two-column">

          <section className="cl-skill-card">

            <p className="cl-result-label">
              YOUR STRENGTHS
            </p>

            <h2>
              Skills already matched
            </h2>

            <div className="cl-skill-tags">

              {matchedSkills.length > 0 ? (
                matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="cl-skill-tag matched"
                  >
                    ✓ {skill}
                  </span>
                ))
              ) : (
                <p className="cl-skill-empty">
                  No required skills matched yet.
                </p>
              )}

            </div>

          </section>


          <section className="cl-skill-card">

            <p className="cl-result-label">
              FOCUS AREAS
            </p>

            <h2>
              Skills to improve
            </h2>

            <div className="cl-skill-tags">

              {missingSkills.length > 0 ? (
                missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="cl-skill-tag missing"
                  >
                    + {skill}
                  </span>
                ))
              ) : (
                <p className="cl-skill-empty">
                  You currently match all tracked skills.
                </p>
              )}

            </div>

          </section>

        </div>


        {/* ACTIONABLE GAPS */}

        {skillDetails.length > 0 && (
          <section className="cl-skill-gaps-section">

            <div className="cl-skill-gaps-header">

              <div>
                <p className="cl-result-label">
                  ACTIONABLE SKILL GAPS
                </p>

                <h2>
                  Turn gaps into progress.
                </h2>

                <p>
                  Each missing skill includes a learning path,
                  focus topics and practical project.
                </p>
              </div>

              <span className="cl-skill-gap-count">
                {skillDetails.length} gaps
              </span>

            </div>


            <div className="cl-skill-gap-grid">

              {skillDetails.map((item) => (
                <article
                  className="cl-skill-gap-item"
                  key={item.skill}
                >

                  <div className="cl-skill-gap-top">

                    <div>
                      <p className="cl-result-label">
                        SKILL GAP
                      </p>

                      <h3>{item.skill}</h3>
                    </div>

                    <span className="cl-skill-difficulty">
                      {item.difficulty}
                    </span>

                  </div>


                  <p className="cl-skill-gap-description">
                    {item.description}
                  </p>


                  <div className="cl-skill-topic-list">

                    {item.topics.map((topic) => (
                      <span key={topic}>
                        {topic}
                      </span>
                    ))}

                  </div>


                  <div className="cl-skill-gap-footer">

                    <span>
                      ⏱ {item.time}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSkill(
                          selectedSkill === item.skill
                            ? null
                            : item.skill
                        )
                      }
                    >
                      {selectedSkill === item.skill
                        ? "Hide Plan"
                        : "View Plan"}
                    </button>

                  </div>


                  {selectedSkill === item.skill && (
                    <div className="cl-skill-plan-panel">

                      <p className="cl-result-label">
                        PRACTICE PROJECT
                      </p>

                      <h4>
                        {item.practice}
                      </h4>

                      {item.resources.length > 0 && (
                        <>
                          <p className="cl-result-label">
                            LEARNING RESOURCES
                          </p>

                          <div className="cl-skill-resource-list">

                            {item.resources.map(
                              (resource, index) => (
                                <a
                                  key={`${resource.url}-${index}`}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {resource.title}
                                  <span>↗</span>
                                </a>
                              )
                            )}

                          </div>
                        </>
                      )}

                    </div>
                  )}

                </article>
              ))}

            </div>

          </section>
        )}


        {/* REQUIRED SKILLS */}

        <section className="cl-skill-required-card">

          <p className="cl-result-label">
            ROLE REQUIREMENTS
          </p>

          <h2>
            Skills required for {data.role}
          </h2>

          <div className="cl-skill-tags">

            {requiredSkills.map((skill) => {
              const isMatched =
                matchedSkills.some(
                  (matched) =>
                    matched.toLowerCase() ===
                    skill.toLowerCase()
                );

              return (
                <span
                  key={skill}
                  className={`cl-skill-tag ${
                    isMatched
                      ? "matched"
                      : "neutral"
                  }`}
                >
                  {isMatched ? "✓ " : ""}
                  {skill}
                </span>
              );
            })}

          </div>

        </section>

      </div>
    </main>
  );
}

export default SkillGap;