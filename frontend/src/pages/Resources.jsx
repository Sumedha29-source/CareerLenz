import DashboardNav from "../components/DashboardNav";

function Resources({ data }) {
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

  const roadmap = data.roadmap || [];
  const learningResources = data.learningResources || {};
  const userResources = data.resources || [];

  const roadmapWithResources = roadmap.filter(
    (item) => item.resources?.length > 0
  );

  const totalRecommendedResources =
    roadmapWithResources.reduce(
      (total, item) =>
        total + (item.resources?.length || 0),
      0
    );

  return (
    <main className="cl-analysis">
      <DashboardNav />

      <div className="cl-analysis-container">

        {/* HEADER */}

        <p className="cl-eyebrow">
          LEARNING RESOURCES
        </p>

        <h1 className="cl-heading">
          Resources
        </h1>

        <p className="cl-body">
          Learn the skills that matter most for{" "}
          <strong>{data.role}</strong> using the resources
          recommended by CareerLenz.
        </p>


        {/* SUMMARY */}

        <section className="cl-resource-summary-card">

          <div>
            <p className="cl-result-label">
              LEARNING HUB
            </p>

            <h2>
              Turn your skill gaps into a study plan.
            </h2>

            <p>
              Use these resources alongside your 30-day
              roadmap and recommended project.
            </p>
          </div>

          <div className="cl-resource-summary-stats">

            <div>
              <strong>
                {roadmapWithResources.length}
              </strong>

              <span>
                skill paths
              </span>
            </div>

            <div>
              <strong>
                {totalRecommendedResources}
              </strong>

              <span>
                resources
              </span>
            </div>

          </div>

        </section>


        {/* RECOMMENDED RESOURCES BY SKILL */}

        {roadmapWithResources.length > 0 && (
          <section className="cl-resource-section">

            <div className="cl-resource-section-header">

              <div>
                <p className="cl-result-label">
                  RECOMMENDED RESOURCES
                </p>

                <h2>
                  Learn by skill
                </h2>

                <p>
                  Open any resource in a new tab and follow
                  the suggested learning path for that skill.
                </p>
              </div>

              <span className="cl-resource-count-badge">
                {totalRecommendedResources} resources
              </span>

            </div>


            <div className="cl-resource-skill-grid">

              {roadmapWithResources.map(
                (item, skillIndex) => (
                  <article
                    className="cl-resource-skill-card"
                    key={`${item.skill || item.title}-${skillIndex}`}
                  >

                    <div className="cl-resource-skill-top">

                      <div>
                        <p className="cl-result-label">
                          SKILL PATH
                        </p>

                        <h3>
                          {item.title ||
                            item.skill ||
                            "Learning Path"}
                        </h3>
                      </div>

                      <span>
                        {item.time || "Flexible"}
                      </span>

                    </div>


                    {item.description && (
                      <p className="cl-resource-skill-description">
                        {item.description}
                      </p>
                    )}


                    {item.topics?.length > 0 && (
                      <div className="cl-resource-topic-tags">

                        {item.topics.map((topic) => (
                          <span key={topic}>
                            {topic}
                          </span>
                        ))}

                      </div>
                    )}


                    <div className="cl-resource-link-list">

                      {item.resources.map(
                        (resource, index) => (
                          <a
                            key={`${resource.url}-${index}`}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cl-resource-link-card"
                          >

                            <div className="cl-resource-link-main">

                              <span className="cl-resource-link-number">
                                {String(index + 1).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              <div>
                                <h4>
                                  {resource.title}
                                </h4>

                                <div className="cl-resource-link-meta">

                                  {resource.provider && (
                                    <span>
                                      {resource.provider}
                                    </span>
                                  )}

                                  {resource.provider &&
                                    resource.type && (
                                      <span>•</span>
                                    )}

                                  {resource.type && (
                                    <span>
                                      {resource.type}
                                    </span>
                                  )}

                                </div>
                              </div>

                            </div>

                            <span className="cl-resource-link-arrow">
                              ↗
                            </span>

                          </a>
                        )
                      )}

                    </div>


                    {item.practice && (
                      <div className="cl-resource-practice-card">

                        <p className="cl-result-label">
                          PRACTICE AFTER LEARNING
                        </p>

                        <p>
                          {item.practice}
                        </p>

                      </div>
                    )}

                  </article>
                )
              )}

            </div>

          </section>
        )}


        {/* FALLBACK LEARNING RESOURCE OBJECT */}

        {roadmapWithResources.length === 0 &&
          Object.keys(learningResources).length > 0 && (
            <section className="cl-resource-section">

              <p className="cl-result-label">
                LEARNING RESOURCES
              </p>

              <h2>
                Recommended learning material
              </h2>

              <div className="cl-resource-fallback-grid">

                {Object.entries(learningResources).map(
                  ([skill, resources]) => (
                    <article
                      className="cl-resource-skill-card"
                      key={skill}
                    >

                      <h3>
                        {skill}
                      </h3>

                      <div className="cl-resource-link-list">

                        {(Array.isArray(resources)
                          ? resources
                          : []
                        ).map(
                          (resource, index) => (
                            <a
                              key={`${resource.url}-${index}`}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cl-resource-link-card"
                            >
                              <div>
                                <h4>
                                  {resource.title ||
                                    resource.name ||
                                    "Learning Resource"}
                                </h4>

                                <span>
                                  {resource.provider ||
                                    resource.type ||
                                    "Resource"}
                                </span>
                              </div>

                              <span>
                                ↗
                              </span>
                            </a>
                          )
                        )}

                      </div>

                    </article>
                  )
                )}

              </div>

            </section>
          )}


        {/* USER'S CURRENT RESOURCES */}

        {userResources.length > 0 && (
          <section className="cl-resource-section">

            <div className="cl-resource-section-header">

              <div>
                <p className="cl-result-label">
                  YOUR CURRENT LEARNING
                </p>

                <h2>
                  Resources you're already working on
                </h2>
              </div>

              <span className="cl-resource-count-badge">
                {userResources.length} active
              </span>

            </div>


            <div className="cl-resource-user-grid">

              {userResources.map((resource) => (
                <article
                  className="cl-resource-user-card"
                  key={resource.id}
                >

                  <div className="cl-resource-user-heading">

                    <div>
                      <span>
                        {resource.type}
                      </span>

                      <h3>
                        {resource.name}
                      </h3>
                    </div>

                    <strong>
                      {resource.progress}%
                    </strong>

                  </div>


                  <div className="cl-resource-progress-track">

                    <div
                      className="cl-resource-progress-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            Number(resource.progress) || 0
                          )
                        )}%`,
                      }}
                    />

                  </div>

                </article>
              ))}

            </div>

          </section>
        )}


        {/* TIP */}

        <section className="cl-resource-tip-card">

          <span>
            TIP
          </span>

          <div>
            <p className="cl-result-label">
              LEARN → BUILD → PROVE
            </p>

            <p>
              Don't stop after completing a course.
              Apply each new skill in a project, document
              what you built, and add truthful outcomes to
              your resume.
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}

export default Resources;