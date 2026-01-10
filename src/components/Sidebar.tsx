import { Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "../contexts/auth-context";

export function Sidebar() {

  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground min-h-screen shrink-0 hidden md:block border-r border-sidebar-border">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">Library</h2>
      </div>
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          <li>
            <Link
              to="/"
              className="block py-2.5 px-4 rounded-lg transition duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              }}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/books"
              className="block py-2.5 px-4 rounded-lg transition duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              }}
            >
              Books
            </Link>
          </li>
          <li>
            <Link
              to="/borrow-return"
              className="block py-2.5 px-4 rounded-lg transition duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              }}
            >
              Borrow/Return
            </Link>
          </li>
          {
            user?.role === "admin" && <div>
              <li>
                <Link
                  to="/members"
                  className="block py-2.5 px-4 rounded-lg transition duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeProps={{
                    className:
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                  }}
                >
                  Members
                </Link>
              </li>
              <li>
                <Link
                  to="/staff"
                  className="block py-2.5 px-4 rounded-lg transition duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeProps={{
                    className:
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                  }}
                >
                  Staff
                </Link>
              </li>
              <li>
                <Link
                  to="/reports"
                  className="block py-2.5 px-4 rounded-lg transition duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeProps={{
                    className:
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                  }}
                >
                  Reports
                </Link>
              </li>
              <li>
                <Link
                  to="/genres"
                  className="block py-2.5 px-4 rounded-lg transition duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeProps={{
                    className:
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                  }}
                >
                  Genres
                </Link>
              </li>
            </div>
          }
        </ul>
      </nav>
    </aside>
  );
}
