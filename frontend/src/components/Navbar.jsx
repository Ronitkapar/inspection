import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/login", label: "Login" },
  { to: "/signup", label: "Sign Up" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/submit", label: "Submit" },
  { to: "/marketplace", label: "Marketplace" },
];

function Navbar() {
  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Primary">
        <NavLink to="/" className="brand-mark">
          Greenline
        </NavLink>
        <div className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
