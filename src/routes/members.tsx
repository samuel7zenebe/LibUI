import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/auth-context";
import { API_URL } from "../config";
import type { Member } from "../types";
import { useState } from "react";
import { Dialog } from "../components/dialog";

export const Route = createFileRoute("/members")({
  component: Members,
  loader: async (): Promise<{ members: Member[] }> => {
    const token = localStorage.getItem("token");
    if (!token) return { members: [] };

    try {
      const res = await fetch(`${API_URL}/members`, {
        headers: { Authorization: `Bearer` },
      });
      const members = res.ok ? await res.json() : [];
      return { members };
    } catch (error) {
      console.error("Failed to fetch members", error);
      return { members: [] };
    }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
});

function Members() {
  const { isAuthenticated } = useAuth();
  const { members } = Route.useLoaderData();

  const [openNew, setOpenNew] = useState(false);

  if (!isAuthenticated) {
    return <div>Please login to view this page.</div>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Dialog
        onClose={() => {
          setOpenNew(false);
        }}
        open={openNew}
      >
        <h1> This is Dialog We need some </h1>
      </Dialog>

      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Members Management
            </h1>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Register New Member
            </button>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">
                      Name
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.length > 0 ? (
                    members.map((member) => (
                      <tr
                        key={member.email}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {member.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {member.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-3">
                            <button className="text-primary hover:underline font-medium">
                              Edit
                            </button>
                            <button className="text-destructive hover:underline font-medium">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-muted-foreground"
                      >
                        No members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
