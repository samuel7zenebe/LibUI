import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/auth-context";
import { API_URL } from "../config";
import type { Staff } from "../types";
import { useMemo, useState } from "react";
import { Dialog } from "../components/dialog";
import { Eye, Edit2, Trash2, Search, Loader2 } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "../contexts/toast-context";

export const Route = createFileRoute("/staff")({
    component: StaffPage,
    loader: async (): Promise<{ staff: Staff[] }> => {
        const token = localStorage.getItem("token");
        if (!token) return { staff: [] };
        try {
            const res = await fetch(`${API_URL}/auth/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return { staff: [] };
            const allUsers = await res.json();
            const staff = allUsers.users;
            return { staff };
        } catch (error) {
            console.error("Failed to fetch staff", error);
            return { staff: [] };
        }
    },
});


type StaffForm = {
    username: string;
    email: string;
    role: "librarian" | "admin";
    password: string
}


function StaffPage() {
    const { isAuthenticated, user } = useAuth();
    const { staff } = Route.useLoaderData();
    const router = useRouter();
    const { showToast } = useToast();
    const [staffList] = useState<Staff[]>(staff);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newStaff, setNewStaff] = useState<StaffForm>({ role: "admin", email: "", password: "password123", username: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const filteredStaff = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return staffList.filter((s: Staff) =>
            (s.username || "").toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        );
    }, [staffList, searchQuery]);

    if (!isAuthenticated) return <div className="w-full text-xl text-center text-destructive">Please login to view this page.</div>;
    if (user?.role === "librarian") return <div className="w-full text-xl text-center text-destructive">You do not have permission to view this page.</div>
    const handleAddStaff = async () => {
        setLoading(true);
        try {
            if (newStaff.email === "" || newStaff.username === '') {
                showToast("Please fill in all fields", "error");
                setLoading(false);
                return;
            }
            const res = await fetch(`${API_URL}/staff`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    ...newStaff,
                    password: "password123",
                }),
            });

            if (!res.ok) throw new Error("Failed to create staff");
            showToast("Staff member created successfully!", "success");
            setOpenAddDialog(false);
            router.invalidate();
        } catch (error) {
            console.error("Error creating staff:", error);
            showToast("Failed to create staff member", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 w-full">
                <TopNav />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
                            <p className="text-muted-foreground">Manage library staff and administrators (Admin Only)</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search staff..."
                                    className="pl-10 pr-4 py-2 border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary w-64"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button onClick={() => setOpenAddDialog(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                + Add Staff
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStaff.length > 0 ? (
                            filteredStaff.map((s) => (
                                <StaffCard key={s.id} staff={s} onUpdate={() => router.invalidate()} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-muted-foreground font-medium">
                                No staff members found matching your search.
                            </div>
                        )}
                    </div>

                    <Dialog open={openAddDialog} onClose={() => !loading && setOpenAddDialog(false)}>
                        <h2 className="text-xl font-bold mb-4">Add New Staff</h2>
                        <div className="space-y-4">
                            <input disabled={loading} placeholder="Username" className="w-full border p-2 rounded bg-background" onChange={e => setNewStaff({ ...newStaff, username: e.target.value })} />
                            <input disabled={loading} placeholder="Email" className="w-full border p-2 rounded bg-background" onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} />
                            <select disabled={loading} className="w-full border p-2 rounded bg-background" value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as "admin" | "librarian" })}>
                                <option value="librarian">Librarian</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div className="text-xs text-muted-foreground font-medium italic">Default password will be set to 'password123'</div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button disabled={loading} className="px-4 py-2 border rounded font-medium hover:bg-muted disabled:opacity-50" onClick={() => setOpenAddDialog(false)}>Cancel</button>
                                <button
                                    disabled={loading}
                                    className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    onClick={handleAddStaff}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            Adding...
                                        </>
                                    ) : (
                                        "Add Staff"
                                    )}
                                </button>
                            </div>
                        </div>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}


function StaffCard({ staff, onUpdate }: { staff: Staff, onUpdate: () => void }) {
    const { showToast } = useToast();
    const [openView, setOpenView] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initialize state only once from props to allow editing
    const [editForm, setEditForm] = useState({
        username: staff.username || "",
        email: staff.email,
        phone: staff.phone,
        role: staff.role
    });

    const handleEdit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/staff/${staff.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });
            if (!res.ok) throw new Error("Failed to update staff");
            showToast("Staff updated successfully!", "success");
            setOpenEdit(false);
            onUpdate();
        } catch (err) {
            console.error(err);
            showToast("Update failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/staff/${staff.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to delete staff");
            showToast("Staff deleted successfully!", "success");
            setOpenDelete(false);
            onUpdate();
        } catch (err) {
            console.error(err);
            showToast("Delete failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-lg shadow-sm border p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {(staff.username || staff.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{staff.username || "No Username"}</h3>
                        <p className="text-sm text-muted-foreground">{staff.email}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded uppercase font-bold">{staff.role}</span>
                </div>
            </div>

            <div className="space-y-1 text-sm">
                <p>Phone: {staff.phone}</p>
                <p>Joined: {staff.join_date || 'N/A'}</p>
                <p>Role: {staff.role}</p>
            </div>

            <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
                <button onClick={() => setOpenView(true)} className="p-2 hover:bg-muted rounded"><Eye size={18} /></button>
                <button onClick={() => setOpenEdit(true)} className="p-2 hover:bg-muted rounded text-blue-600"><Edit2 size={18} /></button>
                <button onClick={() => setOpenDelete(true)} className="p-2 hover:bg-muted rounded text-red-600"><Trash2 size={18} /></button>
            </div>

            <Dialog open={openView} onClose={() => setOpenView(false)}>
                <h2 className="text-xl font-bold mb-4">Staff Details</h2>
                <div className="space-y-2">
                    <p><strong>Username:</strong> {staff.username || "N/A"}</p>
                    <p><strong>Email:</strong> {staff.email}</p>
                    <p><strong>Phone:</strong> {staff.phone}</p>
                    <p><strong>Role:</strong> {staff.role}</p>
                    <p><strong>Joined:</strong> {staff.join_date}</p>
                </div>
                <div className="flex justify-end mt-4">
                    <button onClick={() => setOpenView(false)} className="px-4 py-2 bg-primary text-white rounded">Close</button>
                </div>
            </Dialog>

            <Dialog open={openEdit} onClose={() => !loading && setOpenEdit(false)}>
                <h2 className="text-xl font-bold mb-4">Edit Staff</h2>
                <div className="space-y-4">
                    <input disabled={loading} className="w-full border p-2 rounded" placeholder="Username" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} />
                    <input disabled={loading} className="w-full border p-2 rounded" placeholder="Email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                    <input disabled={loading} className="w-full border p-2 rounded" placeholder="Phone" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                    <select disabled={loading} className="w-full border p-2 rounded" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value as "admin" | "librarian" })}>
                        <option value="librarian">Librarian</option>
                        <option value="admin">Admin</option>
                    </select>
                    <div className="flex justify-end gap-2">
                        <button disabled={loading} className="px-4 py-2 border rounded disabled:opacity-50" onClick={() => setOpenEdit(false)}>Cancel</button>
                        <button
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50 flex items-center gap-2"
                            onClick={handleEdit}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </div>
            </Dialog>

            <Dialog open={openDelete} onClose={() => !loading && setOpenDelete(false)}>
                <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete staff member <strong>{staff.username || staff.email}</strong>?</p>
                <div className="flex justify-end gap-2 mt-4">
                    <button disabled={loading} className="px-4 py-2 border rounded disabled:opacity-50" onClick={() => setOpenDelete(false)}>Cancel</button>
                    <button
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50 flex items-center gap-2"
                        onClick={handleDelete}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </Dialog>
        </div>
    )
}

