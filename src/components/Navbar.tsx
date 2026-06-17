import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FancyLogoutButton from "@/components/FancyLogoutButton";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/notes", label: "Notes" },
  { path: "/revision-queue", label: "Revision Queue" },
  { path: "/analytics", label: "Analytics" },
  { path: "/settings", label: "Settings" },
];

const Navbar = () => {
  const location = useLocation();
  const isAuth = !(
    location.pathname === "/login" || location.pathname === "/signup"
  );

  return (
    <nav
      className="w-full border-b backdrop-blur-xl px-6 py-4 flex items-center justify-between"
      style={{
        backgroundColor: "var(--app-navbar-bg)",
        borderColor: "var(--app-border)",
      }}
    >
      <div className="flex flex-col">
        <Link
          to="/"
          className="text-2xl font-black transition-colors"
          style={{ color: "var(--app-text)" }}
        >
          🧠 Memora
        </Link>

        <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
          created by Archee.io
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isAuth ? (
          <>
            {navItems.map(({ path, label }) => {
              const active = location.pathname === path;

              return (
                <Button
                  key={path}
                  asChild
                  size="sm"
                  className={
                    active
                      ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl"
                      : "bg-transparent rounded-xl"
                  }
                  style={
                    !active
                      ? { color: "var(--app-text-muted)" }
                      : undefined
                  }
                >
                  <Link to={path}>{label}</Link>
                </Button>
              );
            })}

            <FancyLogoutButton />
          </>
        ) : (
          <>
            <Button
              asChild
              size="sm"
              className="bg-transparent rounded-xl"
              style={{ color: "var(--app-text-muted)" }}
            >
              <Link to="/login">Login</Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl"
            >
              <Link to="/signup">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;