import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { navItems } from "../data/capstoneModules";

const Navbar = () => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  return (
    <div
      className={expanded ? "sidebar expanded" : "sidebar"}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="logo">{expanded ? "PostalX" : "PX"}</div>

      <div className="links">
        {navItems.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            className={location.pathname === link.path ? "active" : ""}
          >
            {link.icon}
            {expanded && <span>{link.name}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
