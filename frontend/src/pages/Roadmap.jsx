import DashboardNav from "../components/DashboardNav";

function Roadmap({ data }) {
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

  const actionPlan = data.actionPlan30Days || {};
  const weeks = actionPlan.weeks || [];
  const roadmap = data.roadmap || [];

  return (
    <main className="cl-analysis">
      <DashboardNav />

      <div className="cl-analysis-container">

        <p className="cl-eyebrow">
          CAREER ROADMAP
        </p>

        <h1 className="cl-heading">
          Your 30-Day Roadmap
        </h1>

        <p className="cl-body">
          A focused month-long plan to move you closer to{" "}
          <strong>{data.role}</strong>.
        </p>

        {/* INTRO CARD */}

        <section className="cl-roadmap-hero-card">

          <div>
            <p className="cl-result-label">
              30-DAY ACTION PLAN
            </p>

            <h2>
              Turn your analysis into progress.
            </h2>

            <p>
              Follow this plan week by week. Focus first on
              your highest-priority gaps, then build proof
              through projects and resume updates.
            </p>
          </div>

          <div className="cl-roadmap-days-badge">
            <strong>30</strong>
            <span>DAYS</span>
          </div>

        </section>


        {/* WEEKLY PLAN */}

        {weeks.length > 0 && (
          <section className="cl-roadmap-weeks-section">

            <div className="cl-roadmap-section-header">
              <div>
                <p className="cl-result-label">
                  WEEK-BY-WEEK PLAN
                </p>

                <h2>
                  Your execution timeline
                </h2>
              </div>

              <span className="cl-roadmap-week-count">
                {weeks.length} weeks
              </span>
            </div>


            <div className="cl-roadmap-timeline">

              {weeks.map((week, index) => (
                <article
                  className="cl-roadmap-week"
                  key={`${week.week}-${index}`}
                >

                  <div className="cl-roadmap-week-number">
                    {String(
                      week.week || index + 1
                    ).padStart(2, "0")}
                  </div>


                  <div className="cl-roadmap-week-content">

                    <div className="cl-roadmap-week-heading">

                      <div>
                        <p className="cl-result-label">
                          WEEK {week.week || index + 1}
                        </p>

                        <h3>
                          {week.title ||
                            `Week ${index + 1}`}
                        </h3>
                      </div>


                      {week.focus_skills?.length > 0 && (
                        <div className="cl-roadmap-focus-tags">

                          {week.focus_skills.map(
                            (skill) => (
                              <span key={skill}>
                                {skill}
                              </span>
                            )
                          )}

                        </div>
                      )}

                    </div>


                    {week.tasks?.length > 0 && (
                      <div className="cl-roadmap-task-list">

                        {week.tasks.map(
                          (task, taskIndex) => (
                            <div
                              className="cl-roadmap-task"
                              key={`${task}-${taskIndex}`}
                            >
                              <span>✓</span>
                              <p>{task}</p>
                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>

                </article>
              ))}

            </div>

          </section>
        )}


        {/* LEARNING ROADMAP */}

        {roadmap.length > 0 && (
          <section className="cl-roadmap-learning-section">

            <div className="cl-roadmap-section-header">

              <div>
                <p className="cl-result-label">
                  LEARNING ROADMAP
                </p>

                <h2>
                  Skills to learn in order
                </h2>

                <p>
                  These are the detailed learning paths
                  CareerLenz recommends based on your
                  current gaps.
                </p>
              </div>

              <span className="cl-roadmap-week-count">
                {roadmap.length} paths
              </span>

            </div>


            <div className="cl-roadmap-learning-grid">

              {roadmap.map((item, index) => (
                <article
                  className="cl-roadmap-learning-card"
                  key={`${item.skill || item.title}-${index}`}
                >

                  <div className="cl-roadmap-learning-top">

                    <span className="cl-roadmap-learning-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="cl-roadmap-learning-time">
                      {item.time || "Flexible"}
                    </span>

                  </div>


                  <h3>
                    {item.title ||
                      item.skill ||
                      "Learning Path"}
                  </h3>


                  {item.description && (
                    <p className="cl-roadmap-learning-description">
                      {item.description}
                    </p>
                  )}


                  {item.topics?.length > 0 && (
                    <div className="cl-roadmap-topic-list">

                      {item.topics.map((topic) => (
                        <span key={topic}>
                          {topic}
                        </span>
                      ))}

                    </div>
                  )}


                  {item.practice && (
                    <div className="cl-roadmap-practice">

                      <p className="cl-result-label">
                        PRACTICE
                      </p>

                      <p>{item.practice}</p>

                    </div>
                  )}

                </article>
              ))}

            </div>

          </section>
        )}


        {/* FINAL TIP */}

        <section className="cl-roadmap-tip-card">

          <span className="cl-roadmap-tip-label">
            TIP
          </span>

          <p>
            Treat this as a flexible execution plan.
            If one skill takes longer, carry it into
            the next week instead of rushing through it.
          </p>

        </section>

      </div>
    </main>
  );
}

export default Roadmap;