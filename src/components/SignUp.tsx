import { useState } from "react";
import { API_URL } from "../config";
import { useAuth } from "../contexts/auth-context";
import { Link, useNavigate } from "@tanstack/react-router";

export function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error("Signup failed");
      }
      const data: {
        access_token: string;
        user: {
          id: number;
          username: string;
          role: string;
        };
      } = await res.json();
      login(
        {
          id: data.user.id,
          username: data.user.username,
          role: data.user.role as "admin" | "librarian",
        },
        data.access_token
      );
      setStatus("success");
      setTimeout(() => {
        navigate({ to: "/" });
      }, 1000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-xl border border-border">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join our library management system
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-foreground"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="johndoe"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-foreground"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="admin">Admin</option>
                <option value="librarian">Librarian</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : (
                "Sign up"
              )}
            </button>
          </div>

          {status === "error" && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {status === "success" && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm text-center">
              Account created! Redirecting...
            </div>
          )}

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
