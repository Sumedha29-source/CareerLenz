import DashboardNav from "../components/DashboardNav";

function Overview({ data }) {
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

  const readiness = Math.max(
    0,
    Math.min(100, Number(data.readiness) || 0)
  );

  const matchedCount = matchedSkills.length;
  const missingCount = missingSkills.length;
  const requiredCount = requiredSkills.length;

  return (
    <main className="cl-analysis">
      <DashboardNav />

      <div className="cl-analysis-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <p className="cl-eyebrow">
          CAREERLENZ DASHBOARD
        </p>

        <h1 className="cl-heading">
          Career Overview
        </h1>

        <p className="cl-body">
          Your personalized career intelligence for{" "}
          <strong>{data.role}</strong>.
        </p>


        {/* =====================================================
            CAREER READINESS
        ===================================================== */}

        <section className="cl-overview-readiness-card">

          <div className="cl-overview-score">

            <p className="cl-result-label">
              CAREER READINESS
            </p>

            <div className="cl-overview-score-value">
              {readiness}%
            </div>

            <p className="cl-overview-score-copy">
              You currently match{" "}
              <strong>{matchedCount}</strong>{" "}
              out of{" "}
              <strong>{requiredCount}</strong>{" "}
              tracked skills.
            </p>

          </div>


          <div className="cl-overview-role-card">

            <p className="cl-result-label">
              TARGET ROLE
            </p>

            <h2>{data.role}</h2>

            <span>
              {missingCount} skill gap
              {missingCount !== 1 ? "s" : ""}
            </span>

          </div>

        </section>


        {/* =====================================================
            CAREER SUMMARY
        ===================================================== */}

        {data.careerSummary && (
          <section className="cl-overview-card">

            <p className="cl-result-label">
              CAREERLENZ INTELLIGENCE
            </p>

            <h2>
              Your career snapshot
            </h2>

            <p className="cl-overview-main-copy">
              {data.careerSummary}
            </p>

          </section>
        )}


        {/* =====================================================
            STRENGTH + PRIORITY GAP
        ===================================================== */}

        <div className="cl-overview-two-column">

          <section className="cl-overview-card cl-overview-strength">

            <p className="cl-result-label">
              YOUR STRENGTH
            </p>

            <div className="cl-overview-icon">
              ✓
            </div>

            <h2>
              Strongest verified area
            </h2>

            <p>
              {data.strengthSummary ||
                "CareerLenz will highlight your strongest verified skill here."}
            </p>

          </section>


          <section className="cl-overview-card cl-overview-priority">

            <p className="cl-result-label">
              HIGHEST PRIORITY GAP
            </p>

            <div className="cl-overview-icon">
              !
            </div>

            <h2>
              {data.highestPriorityGap ||
                "No major gap detected"}
            </h2>

            <p>
              {data.whyPriorityGapMatters ||
                "Your highest-priority development area will appear here."}
            </p>

          </section>

        </div>


        {/* =====================================================
            SKILL SNAPSHOT
        ===================================================== */}

        <section className="cl-overview-card">

          <div className="cl-overview-section-heading">

            <div>
              <p className="cl-result-label">
                SKILL SNAPSHOT
              </p>

              <h2>
                Where you stand
              </h2>
            </div>

            <strong className="cl-overview-mini-score">
              {readiness}%
            </strong>

          </div>


          <div className="cl-overview-stats">

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


          <div className="cl-overview-skill-columns">

            <div>

              <p className="cl-result-label">
                YOUR STRENGTHS
              </p>

              <div className="cl-overview-tags">

                {matchedSkills.length > 0 ? (
                  matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="cl-overview-tag matched"
                    >
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <p className="cl-overview-empty">
                    No target-role skills matched yet.
                  </p>
                )}

              </div>

            </div>


            <div>

              <p className="cl-result-label">
                FOCUS AREAS
              </p>

              <div className="cl-overview-tags">

                {missingSkills.length > 0 ? (
                  missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="cl-overview-tag missing"
                    >
                      + {skill}
                    </span>
                  ))
                ) : (
                  <p className="cl-overview-empty">
                    No tracked skill gaps.
                  </p>
                )}

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            RECOMMENDED NEXT ACTION
        ===================================================== */}

        {(data.recommendedAction ||
          data.improvementAdvice) && (
          <section className="cl-overview-next-card">

            <div className="cl-overview-next-badge">
              NEXT
            </div>

            <div>

              <p className="cl-result-label">
                YOUR NEXT MOVE
              </p>

              <h2>
                Start with your highest-impact gap.
              </h2>

              {data.recommendedAction && (
                <p>
                  {data.recommendedAction}
                </p>
              )}

              {data.improvementAdvice && (
                <p className="cl-overview-advice">
                  {data.improvementAdvice}
                </p>
              )}

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

export default Overview;