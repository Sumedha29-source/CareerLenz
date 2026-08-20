import DashboardNav from "../components/DashboardNav";

function ResumeAnalysis({ data }) {
  if (!data) {
    return (
      <main className="cl-analysis">
        <DashboardNav />

        <div className="cl-analysis-container">
          <h1 className="cl-heading">
            No analysis available
          </h1>

          <p className="cl-body">
            Please analyze your resume first.
          </p>
        </div>
      </main>
    );
  }

  const resumeQuality = data.resumeQuality || {};
  const resumeFeedback = data.resumeFeedback || [];
  const bulletImprovements = data.bulletImprovements || [];

  const overallScore =
    resumeQuality.overall_score ??
    data.resumeQualityScore ??
    0;

  const qualityLabel =
    resumeQuality.quality_label ||
    data.resumeQualityLabel ||
    "Not rated";

  const sectionsDetected =
    resumeQuality.sections_detected || {};

  const profileSignals =
    resumeQuality.profile_signals || {};

  const actionVerbs =
    resumeQuality.action_verbs_count ?? 0;

  const metrics = [
    {
      label: "Skills Coverage",
      value: resumeQuality.skills_score ?? 0,
    },
    {
      label: "Projects",
      value: resumeQuality.projects_score ?? 0,
    },
    {
      label: "Experience",
      value: resumeQuality.experience_score ?? 0,
    },
    {
      label: "Measurable Impact",
      value: resumeQuality.impact_score ?? 0,
    },
    {
      label: "Completeness",
      value: resumeQuality.completeness_score ?? 0,
    },
  ];

  return (
    <main className="cl-analysis">
      <DashboardNav />

      <div className="cl-analysis-container">

        {/* HEADER */}

        <p className="cl-eyebrow">
          RESUME ANALYSIS
        </p>

        <h1 className="cl-heading">
          Resume Analysis
        </h1>

        <p className="cl-body">
          See how clearly your resume communicates your skills,
          projects, experience and impact.
        </p>


        {/* OVERALL QUALITY */}

        <section className="cl-resume-quality-card">

          <div>
            <p className="cl-result-label">
              RESUME QUALITY
            </p>

            <h2>
              How strong is your resume?
            </h2>

            <p className="cl-resume-quality-copy">
              CareerLenz evaluates your resume based on skills,
              projects, experience, measurable impact and overall
              completeness.
            </p>

            <span className="cl-resume-quality-label">
              {qualityLabel}
            </span>
          </div>

          <div className="cl-resume-quality-score">
            <strong>{overallScore}</strong>
            <span>/100</span>
          </div>

        </section>


        {/* QUALITY METRICS */}

        <section className="cl-resume-metrics-card">

          <p className="cl-result-label">
            SCORE BREAKDOWN
          </p>

          <div className="cl-resume-metrics-grid">

            {metrics.map((metric) => (
              <div
                className="cl-resume-metric"
                key={metric.label}
              >

                <div className="cl-resume-metric-heading">
                  <span>{metric.label}</span>
                  <strong>{metric.value}%</strong>
                </div>

                <div className="cl-resume-metric-bar">
                  <div
                    className="cl-resume-metric-fill"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          Number(metric.value) || 0
                        )
                      )}%`,
                    }}
                  />
                </div>

              </div>
            ))}

          </div>

        </section>


        {/* SECTIONS + PROFILE SIGNALS */}

        <div className="cl-resume-two-column">

          <section className="cl-resume-card">

            <p className="cl-result-label">
              SECTIONS DETECTED
            </p>

            <div className="cl-resume-tags">

              {Object.entries(sectionsDetected).length > 0 ? (
                Object.entries(sectionsDetected).map(
                  ([section, detected]) => (
                    <span
                      key={section}
                      className={`cl-resume-tag ${
                        detected ? "good" : "missing"
                      }`}
                    >
                      {detected ? "✓" : "×"}{" "}
                      {section}
                    </span>
                  )
                )
              ) : (
                <p className="cl-resume-empty">
                  No section data available.
                </p>
              )}

            </div>

          </section>


          <section className="cl-resume-card">

            <p className="cl-result-label">
              PROFILE SIGNALS
            </p>

            <div className="cl-resume-tags">

              {Object.entries(profileSignals).length > 0 ? (
                Object.entries(profileSignals).map(
                  ([signal, detected]) => (
                    <span
                      key={signal}
                      className={`cl-resume-tag ${
                        detected ? "good" : "missing"
                      }`}
                    >
                      {detected ? "✓" : "×"}{" "}
                      {signal}
                    </span>
                  )
                )
              ) : (
                <p className="cl-resume-empty">
                  No profile-signal data available.
                </p>
              )}

            </div>

            <p className="cl-resume-action-verbs">
              Action-oriented verbs detected:{" "}
              <strong>{actionVerbs}</strong>
            </p>

          </section>

        </div>


        {/* TOP IMPROVEMENTS */}

        {resumeFeedback.length > 0 && (
          <section className="cl-resume-feedback-card">

            <p className="cl-result-label">
              TOP RESUME IMPROVEMENTS
            </p>

            <h2>
              What should you improve first?
            </h2>

            <div className="cl-resume-feedback-list">

              {resumeFeedback.map((feedback, index) => (
                <div
                  className="cl-resume-feedback-item"
                  key={`${feedback}-${index}`}
                >
                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <p>{feedback}</p>
                </div>
              ))}

            </div>

          </section>
        )}


        {/* BULLET IMPROVER */}

        {bulletImprovements.length > 0 && (
          <section className="cl-resume-bullet-section">

            <div className="cl-resume-bullet-header">

              <div>
                <p className="cl-result-label">
                  RESUME BULLET IMPROVER
                </p>

                <h2>
                  Strengthen how your experience is presented.
                </h2>

                <p>
                  CareerLenz identifies resume lines that could
                  communicate technical depth and measurable impact
                  more clearly.
                </p>
              </div>

              <span className="cl-resume-bullet-count">
                {bulletImprovements.length} suggestions
              </span>

            </div>


            <div className="cl-resume-bullet-list">

              {bulletImprovements.map((item, index) => (
                <article
                  className="cl-resume-bullet-item"
                  key={`${item.original}-${index}`}
                >

                  <div className="cl-resume-bullet-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>


                  <div className="cl-resume-bullet-compare">

                    <div className="cl-resume-bullet-before">

                      <p className="cl-result-label">
                        CURRENT
                      </p>

                      <p>{item.original}</p>

                    </div>


                    <div className="cl-resume-bullet-arrow">
                      →
                    </div>


                    <div className="cl-resume-bullet-after">

                      <p className="cl-result-label">
                        SUGGESTED STRUCTURE
                      </p>

                      <p>{item.suggestion}</p>

                    </div>

                  </div>


                  <div className="cl-resume-bullet-reason">

                    <p className="cl-result-label">
                      WHY BETTER
                    </p>

                    <p>{item.reason}</p>

                  </div>


                  {item.warning && (
                    <div className="cl-resume-bullet-warning">
                      <strong>
                        KEEP IT TRUE
                      </strong>

                      <p>{item.warning}</p>
                    </div>
                  )}

                </article>
              ))}

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

export default ResumeAnalysis;