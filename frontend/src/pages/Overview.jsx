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

  return (
    <main className="cl-analysis">
      <DashboardNav />

      <div className="cl-analysis-container">

        <p className="cl-eyebrow">
          CAREERLENZ DASHBOARD
        </p>

        <h1 className="cl-heading">
          Career Overview
        </h1>

        <p className="cl-body">
          Your personalized career intelligence dashboard.
        </p>

        {/* We'll move your existing overview content here next */}

      </div>
    </main>
  );
}

export default Overview;