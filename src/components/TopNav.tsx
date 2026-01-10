import { useAuth } from "../contexts/auth-context";
import { useTheme } from "../contexts/theme-context";
import { Moon, Sun } from "lucide-react";

export function TopNav() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-background shadow-sm z-10 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center md:hidden">
              {/* Mobile menu button placeholder */}
              <button className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center md:hidden ml-4">
              <span className="font-bold text-xl text-primary">Library</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-muted text-foreground transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <span className="text-sm text-muted-foreground">
                Welcome,{" "}
                <span className="font-semibold text-foreground">
                  {user?.username}
                </span>
              </span>
              <button
                onClick={() => logout()}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
