import { Link, NavLink } from "react-router-dom";

const NAV_LINKS = [
  { to: "/dashboard", label: "Overview" },
  { to: "/dashboard/resume", label: "Resume Analysis" },
  { to: "/dashboard/skills", label: "Skill Gap" },
  { to: "/dashboard/roadmap", label: "Roadmap" },
  { to: "/dashboard/projects", label: "Projects" },
  { to: "/dashboard/resources", label: "Resources" },
];

function DashboardNav() {
  return (
    <nav className="cl-dashboard-nav" aria-label="Dashboard navigation">
      <Link to="/dashboard" className="cl-dashboard-nav-brand">
        CareerLenz
      </Link>

      <ul className="cl-dashboard-nav-links">
        {NAV_LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === "/dashboard"}
              className={({ isActive }) =>
                `cl-dashboard-nav-link${isActive ? " active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default DashboardNav;