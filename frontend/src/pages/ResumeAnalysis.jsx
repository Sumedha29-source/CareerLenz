import DashboardNav from "../components/DashboardNav";

function ResumeAnalysis() {
  return (
    <main className="cl-analysis">
      <DashboardNav />

      <div className="cl-analysis-container">
        <p className="cl-eyebrow">RESUME ANALYSIS</p>
        <h1 className="cl-heading">Resume Analysis</h1>

        <p className="cl-body">
          Resume quality and improvement recommendations will appear here.
        </p>
      </div>
    </main>
  );
}

export default ResumeAnalysis;