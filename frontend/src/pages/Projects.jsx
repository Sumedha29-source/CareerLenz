import DashboardNav from "../components/DashboardNav";

function Projects({ data }) {
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

  const project = data.recommendedProject || null;
  const missingSkills = data.missingSkills || [];

  return (
    <main className="cl-analysis">
      <DashboardNav />

      <div className="cl-analysis-container">

        {/* HEADER */}

        <p className="cl-eyebrow">
          PROJECT RECOMMENDATIONS
        </p>

        <h1 className="cl-heading">
          Recommended Projects
        </h1>

        <p className="cl-body">
          Build proof of your skills with a project designed
          around your gaps for{" "}
          <strong>{data.role}</strong>.
        </p>


        {/* MAIN PROJECT */}

        {project ? (
          <section className="cl-project-hero-card">

            <div className="cl-project-icon">
              🚀
            </div>

            <div className="cl-project-hero-content">

              <p className="cl-result-label">
                RECOMMENDED PROJECT
              </p>

              <h2>
                {project.title}
              </h2>

              <p className="cl-project-description">
                {project.description}
              </p>


              {project.skills?.length > 0 && (
                <div className="cl-project-skill-tags">

                  {project.skills.map((skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  ))}

                </div>
              )}

            </div>

          </section>
        ) : (
          <section className="cl-project-empty-card">
            <p className="cl-result-label">
              RECOMMENDED PROJECT
            </p>

            <h2>
              No project recommendation available.
            </h2>
          </section>
        )}


        {/* WHY THIS PROJECT */}

        {project && (
          <section className="cl-project-section">

            <p className="cl-result-label">
              WHY THIS PROJECT
            </p>

            <h2>
              Why it fits your career path
            </h2>

            <div className="cl-project-benefit-grid">

              <div className="cl-project-benefit-card">

                <span className="cl-project-benefit-number">
                  01
                </span>

                <h3>
                  Close skill gaps
                </h3>

                <p>
                  This project gives you a practical way
                  to apply the skills CareerLenz identified
                  as missing from your target-role profile.
                </p>

              </div>


              <div className="cl-project-benefit-card">

                <span className="cl-project-benefit-number">
                  02
                </span>

                <h3>
                  Build portfolio evidence
                </h3>

                <p>
                  Instead of only listing technologies,
                  you can demonstrate how you used them
                  in a real working project.
                </p>

              </div>


              <div className="cl-project-benefit-card">

                <span className="cl-project-benefit-number">
                  03
                </span>

                <h3>
                  Strengthen your resume
                </h3>

                <p>
                  After completing the project, add the
                  tools used, problem solved and measurable
                  outcomes to your resume.
                </p>

              </div>

            </div>

          </section>
        )}


        {/* GAP COVERAGE */}

        {missingSkills.length > 0 && (
          <section className="cl-project-section">

            <div className="cl-project-section-heading">

              <div>
                <p className="cl-result-label">
                  GAP COVERAGE
                </p>

                <h2>
                  Skills this project can help reinforce
                </h2>
              </div>

              <span className="cl-project-gap-count">
                {missingSkills.length} focus areas
              </span>

            </div>


            <div className="cl-project-gap-tags">

              {missingSkills.map((skill) => (
                <span key={skill}>
                  + {skill}
                </span>
              ))}

            </div>

          </section>
        )}


        {/* BUILD CHECKLIST */}

        {project && (
          <section className="cl-project-build-card">

            <p className="cl-result-label">
              BUILD CHECKLIST
            </p>

            <h2>
              What to do next
            </h2>

            <div className="cl-project-checklist">

              <div>
                <span>✓</span>
                <p>
                  Define the core problem and project scope.
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  Build the minimum working version first.
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  Use the recommended technologies in a
                  meaningful way.
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  Test the project and document the results.
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  Push the project to GitHub with a polished
                  README and screenshots.
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  Add truthful project outcomes and skills
                  to your resume.
                </p>
              </div>

            </div>

          </section>
        )}


        {/* NEXT MOVE */}

        <section className="cl-project-next-card">

          <span>
            NEXT
          </span>

          <div>
            <p className="cl-result-label">
              YOUR NEXT MOVE
            </p>

            <h2>
              Build one strong project, not five unfinished ones.
            </h2>

            <p>
              Focus on completing, deploying and documenting
              this project before starting another.
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}

export default Projects;