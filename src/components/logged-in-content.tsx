import type { ReactNode } from "react";
import { useAuth } from "../contexts/auth-context";
export default function LoggedInContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="w-full mx-auto mt-2 flex flex-col items-center justify-center">
        <h1 className="text-center text-2xl bg-accent">
          Logged In with username{" "}
          <span className="font-bold text-primary">{user?.username}</span>
        </h1>
        <button
          className="p-2 mt-2 bg-primary text-primary-foreground"
          onClick={() => {
            logout();
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return children;
}
