// import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { AuthProvider } from "../contexts/auth-context";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
      <div className="dark bg-background text-foreground h-screen">
        <div className="flex items-center justify-center gap-8">
          <Link to="/" activeProps={{ className: "text-primary" }}>
            Home
          </Link>
          <Link to="/register" activeProps={{ className: "text-primary" }}>
            Sign Up
          </Link>
          <Link to="/login" activeProps={{ className: "text-primary" }}>
            Login
          </Link>
        </div>
        <Outlet />
      </div>
    </AuthProvider>
  );
}
