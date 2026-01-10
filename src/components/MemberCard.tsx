import { useEffect, useState } from "react";
import { Dialog } from "./dialog";
import { API_URL } from "../config";
import type { Member } from "../types";
import { Eye, Edit2, Trash2, X } from "lucide-react";
import { useToast } from "../contexts/toast-context";

type Props = {
  memberSummary: Member;
  onDelete?: (id: number) => void;
};

export function MemberCard({ memberSummary, onDelete }: Props) {
  const { showToast } = useToast();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [opState, setOpState] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [opError, setOpError] = useState<string | null>(null);

  const identifier = memberSummary.id;

  useEffect(() => {
    let mounted = true;
    async function fetchMember() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/members/${identifier}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },

        });
        if (!res.ok) throw new Error("Failed to fetch member");
        const data = await res.json();
        if (!mounted) return;
        setMember(data);
        setForm({ name: data.name ?? "", email: data.email ?? "", phone: data.phone ?? "" });
      } catch (err: unknown) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load member");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (openView || openEdit) {
      fetchMember();
    }
    return () => {
      mounted = false;
    };
  }, [identifier, openView, openEdit]);

  async function handleEditSubmit() {
    setOpState("loading");
    setOpError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/members/${identifier}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update member");
      const updated = await res.json();
      setMember(updated);
      setOpState("idle");
      setOpenEdit(false);
      showToast("Member updated successfully!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      showToast(msg, "error");
      setOpState("idle");
    }
  }

  async function handleDelete() {
    setOpState("loading");
    setOpError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/members/${identifier}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error("Failed to delete member");
      setOpState("idle");
      setOpenDelete(false);
      showToast("Member deleted successfully!", "success");
      onDelete?.(identifier);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      showToast(msg, "error");
      setOpState("idle");
    }
  }

  return (
    <div className="bg-card rounded-lg shadow p-4 flex flex-col">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground">{member?.name ?? memberSummary.name}</h3>
        <p className="text-sm text-muted-foreground">{member?.email ?? memberSummary.email}</p>
        <p className="text-sm text-muted-foreground">{member?.phone}</p>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => setOpenView(true)} className="flex items-center gap-2 text-primary hover:underline font-medium">
          <Eye size={16} /> <span>View</span>
        </button>
        <button onClick={() => setOpenEdit(true)} className="flex items-center gap-2 text-primary hover:underline font-medium">
          <Edit2 size={16} /> <span>Edit</span>
        </button>
        <button onClick={() => setOpenDelete(true)} className="flex items-center gap-2 text-destructive hover:underline font-medium">
          <Trash2 size={16} /> <span>Delete</span>
        </button>
      </div>

      <Dialog open={openView} onClose={() => setOpenView(false)}>
        <h2 className="text-xl font-bold mb-4">Member Details</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : member ? (
          <div className="space-y-2">
            <div><strong>Name: </strong>{member.name}</div>
            <div><strong>Email: </strong>{member.email}</div>
            <div><strong>Phone: </strong>{member.phone}</div>
            <div><strong>Joined: </strong>{member.join_date}</div>
          </div>
        ) : (
          <div>No details available.</div>
        )}
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={() => setOpenView(false)} className="px-4 py-2 bg-muted rounded flex items-center gap-2">
            <X size={14} /> Cancel
          </button>
          <button onClick={() => setOpenView(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded flex items-center gap-2">
            <Eye size={14} /> Close
          </button>
        </div>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <h2 className="text-xl font-bold mb-4">Edit Member</h2>
        <form>
          <div className="mb-3">
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border px-3 py-2 rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full border px-3 py-2 rounded" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="block text-sm mb-1">Phone</label>
            <input className="w-full border px-3 py-2 rounded" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          {opState === "error" && opError && <div className="text-red-500 mb-2">{opError}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded border flex items-center gap-2" onClick={() => setOpenEdit(false)}>
              <X size={14} /> Cancel
            </button>
            <button type="button" className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center gap-2" onClick={handleEditSubmit}>
              {opState === "loading" ? "Saving..." : (<><Edit2 size={14} /> Save</>)}
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <h2 className="text-xl font-bold mb-4">Delete Member</h2>
        <p>Are you sure you want to delete <strong>{member?.name ?? memberSummary.name}</strong>?</p>
        {opState === "error" && opError && <div className="text-red-500 mt-2">{opError}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setOpenDelete(false)} className="px-4 py-2 rounded border flex items-center gap-2"><X size={14} /> Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2">{opState === "loading" ? "Deleting..." : (<><Trash2 size={14} /> Delete</>)}</button>
        </div>
      </Dialog>
    </div>
  );
}

export default MemberCard;
