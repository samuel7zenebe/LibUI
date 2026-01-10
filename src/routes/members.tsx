import { createFileRoute, Link } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/auth-context";
import { API_URL } from "../config";
import type { Member } from "../types";
import { useMemo, useState } from "react";
import { Dialog } from "../components/dialog";
import MemberCard from "../components/MemberCard";
import { ArrowLeft, Search, TriangleAlert } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "../contexts/toast-context";

export const Route = createFileRoute("/members")({
  component: Members,
  loader: async (): Promise<{ members: Member[] }> => {
    const token = localStorage.getItem("token");
    if (!token) return { members: [] };
    try {
      const res = await fetch(`${API_URL}/members`, {
        headers: { Authorization: `Bearer ${token}` },
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

type MemberType = {
  name: string,
  email: string,
  phone: string,
  join_date: string,
  state: 'idle' | 'loading' | 'error' | 'success',
  error: string | null,
  success: string | null
}
function Members() {
  const { isAuthenticated, user } = useAuth();
  const { members } = Route.useLoaderData();
  const router = useRouter();
  const { showToast } = useToast();
  const [membersState, setMembersState] = useState<Member[]>(members ?? []);
  const [openNewMemberDialog, setOpenNewMemberDialog] = useState(false);
  const [newMember, setNewMember] = useState<MemberType>({ name: '', email: '', phone: '', join_date: '', error: '', success: '', state: 'idle' });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return membersState.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  }, [membersState, searchQuery]);

  if (!isAuthenticated) return <div>Please login to view this page.</div>;

  if (user?.role === "librarian") return <div className="w-full mx-auto pt-40 flex flex-col items-center justify-center">
    <TriangleAlert className="w-20 h-20 text-red-500 font-medium" />
    <h1 className="text-red-500 font-medium"> This is page is for admins only, you are not authorized to view this page.</h1>
    <h1 className="text-red-500 font-medium"> SORRY !</h1>
    <Link to="/">
      <div className="flex items-center gap-2 mt-4">
        <ArrowLeft className="w-5 h-5" />
        <span>Go Back to Home</span>
      </div>
    </Link>
  </div>

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Dialog
        onClose={() => setOpenNewMemberDialog(false)}
        open={openNewMemberDialog}
      >
        <h1 className="text-xl font-bold mb-4">Add New Member</h1>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="phone">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              value={newMember.phone}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="join_date">
              Joining Date
            </label>
            <input
              type="date"
              id="join_date"
              className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              value={newMember.join_date}
              onChange={(e) => setNewMember({ ...newMember, join_date: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpenNewMemberDialog(false)}
              className="px-4 py-2 border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              onClick={async () => {
                try {
                  if (newMember.name === '' || newMember.email === '' || newMember.phone === '' || newMember.join_date === '') {
                    showToast("All fields are required", "error");
                    return;
                  }
                  setNewMember({ ...newMember, state: 'loading' });
                  const token = localStorage.getItem("token");
                  const res = await fetch(`${API_URL}/members`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      name: newMember.name,
                      email: newMember.email,
                      phone: newMember.phone,
                      join_date: newMember.join_date
                    })
                  });
                  if (res.ok) {
                    const added = await res.json();
                    setMembersState([...membersState, added]);
                    setNewMember({ ...newMember, state: 'idle', name: '', email: '', phone: '', join_date: '' });
                    setOpenNewMemberDialog(false);
                    showToast("Member registered successfully!", "success");
                    router.invalidate();
                  } else {
                    showToast("Failed to add member", "error");
                    setNewMember({ ...newMember, state: 'idle' });
                  }
                } catch (err) {
                  console.log(err);
                  showToast("Failed to add member", "error");
                  setNewMember({ ...newMember, state: 'idle' });
                }
              }}
            >
              {newMember.state === 'loading' ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Dialog>

      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Members Management
              </h1>
              <p className="text-muted-foreground">Manage and track library members</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search members..."
                  className="pl-10 pr-4 py-2 border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary w-64"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button onClick={() => setOpenNewMemberDialog(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                + Register Member
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((m) => (
                <MemberCard
                  key={m.id}
                  memberSummary={m}
                  onDelete={(id) => {
                    setMembersState((s) => s.filter((x) => x.id !== id));
                    router.invalidate();
                  }}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-muted-foreground font-medium">No members found matching your search.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

