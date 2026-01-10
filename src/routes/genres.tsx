import { createFileRoute, Link } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/auth-context";
import { API_URL } from "../config";
import type { Genre } from "../types";
import { useMemo, useState } from "react";
import { Dialog } from "../components/dialog";
import { Edit2, Trash2, Loader2, TriangleAlert, ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "../contexts/toast-context";

export const Route = createFileRoute("/genres")({
    component: GenresPage,
    loader: async (): Promise<{ genres: Genre[] }> => {
        const token = localStorage.getItem("token");
        if (!token) return { genres: [] };
        try {
            const res = await fetch(`${API_URL}/genres`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.ok ? { genres: await res.json() } : { genres: [] };
        } catch (error) {
            console.error("Failed to fetch genres", error);
            return { genres: [] };
        }
    },
});

function GenresPage() {
    const { isAuthenticated, user } = useAuth();
    const { genres } = Route.useLoaderData();
    const router = useRouter();
    const { showToast } = useToast();
    const [genreList, setGenreList] = useState<Genre[]>(genres);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newGenreName, setNewGenreName] = useState("");

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
    const [editName, setEditName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);


    const filteredGenres = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return genreList.filter((g: Genre) => g.name.toLowerCase().includes(q));
    }, [genreList, searchQuery]);

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
    const handleAddGenre = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/genres`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newGenreName }),
            });

            if (!res.ok) throw new Error("Failed to create genre");

            const newGenre = await res.json();
            setGenreList([...genreList, newGenre]);
            setNewGenreName("");
            setOpenAddDialog(false);
            showToast("Genre added successfully!", "success");
            router.invalidate();
        } catch (error) {
            console.error("Error creating genre:", error);
            showToast("Failed to create genre", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEditGenre = async () => {
        if (!selectedGenre) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/genres/${selectedGenre.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: editName })
            });

            if (!res.ok) throw new Error("Failed to edit genre");
            const updated = await res.json();
            setGenreList(genreList.map(g => g.id === selectedGenre.id ? updated : g));
            setOpenEditDialog(false);
            showToast("Genre updated successfully!", "success");
            router.invalidate();
        } catch (err) {
            console.error(err);
            showToast("Failed to update genre", "error");
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteGenre = async () => {
        if (!selectedGenre) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/genres/${selectedGenre.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to delete genre");
            setGenreList(genreList.filter(g => g.id !== selectedGenre.id));
            setOpenDeleteDialog(false);
            showToast("Genre deleted successfully!", "success");
            router.invalidate();
        } catch (err) {
            console.error(err);
            showToast("Failed to delete genre", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 w-full">
                <TopNav />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Genres</h1>
                            <p className="text-muted-foreground">Manage book genres (Admin Only)</p>
                        </div>
                        <button onClick={() => setOpenAddDialog(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            + Add Genre
                        </button>
                    </div>

                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search genres..."
                            className="w-full max-w-md border rounded-lg px-4 py-2 bg-card text-card-foreground"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredGenres.map((g) => (
                            <div key={g.id} className="bg-card p-6 rounded-lg shadow-sm border flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{g.name}</h3>
                                    <p className="text-xs text-muted-foreground">Genre ID: {g.id}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => {
                                        setSelectedGenre(g);
                                        setEditName(g.name);
                                        setOpenEditDialog(true);
                                    }} className="p-2 border rounded hover:bg-muted font-medium flex items-center gap-2"><Edit2 size={16} /></button>
                                    <button onClick={() => {
                                        setSelectedGenre(g);
                                        setOpenDeleteDialog(true);
                                    }} className="p-2 border rounded hover:bg-muted text-red-500 font-medium flex items-center gap-2"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                        {filteredGenres.length === 0 && (
                            <div className="col-span-full text-center py-10 text-muted-foreground font-medium">No genres found matching your search.</div>
                        )}
                    </div>

                    <Dialog open={openAddDialog} onClose={() => !loading && setOpenAddDialog(false)}>
                        <h2 className="text-xl font-bold mb-4">Add New Genre</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input disabled={loading} className="w-full border p-2 rounded bg-background" value={newGenreName} onChange={e => setNewGenreName(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button disabled={loading} className="px-4 py-2 border rounded hover:bg-muted font-medium disabled:opacity-50" onClick={() => setOpenAddDialog(false)}>Cancel</button>
                                <button
                                    disabled={loading}
                                    className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    onClick={handleAddGenre}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            Adding...
                                        </>
                                    ) : (
                                        "Add Genre"
                                    )}
                                </button>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog open={openEditDialog} onClose={() => !loading && setOpenEditDialog(false)}>
                        <h2 className="text-xl font-bold mb-4">Edit Genre</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input disabled={loading} className="w-full border p-2 rounded bg-background" value={editName} onChange={e => setEditName(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button disabled={loading} className="px-4 py-2 border rounded hover:bg-muted font-medium disabled:opacity-50" onClick={() => setOpenEditDialog(false)}>Cancel</button>
                                <button
                                    disabled={loading}
                                    className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    onClick={handleEditGenre}
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

                    <Dialog open={openDeleteDialog} onClose={() => !loading && setOpenDeleteDialog(false)}>
                        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                        <p className="text-muted-foreground">Are you sure you want to delete genre <span className="font-bold text-foreground">"{selectedGenre?.name}"</span>?</p>
                        <div className="flex justify-end gap-2 mt-6">
                            <button disabled={loading} className="px-4 py-2 border rounded hover:bg-muted font-medium disabled:opacity-50" onClick={() => setOpenDeleteDialog(false)}>Cancel</button>
                            <button
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                onClick={handleDeleteGenre}
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
                </main>
            </div>
        </div>
    );
}


