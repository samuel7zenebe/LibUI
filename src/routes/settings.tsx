import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/auth-context";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login to view this page.</div>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-6 text-foreground">Settings</h1>
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <p className="text-muted-foreground">
              Application settings will go here.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
