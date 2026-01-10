import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/auth-context";
import { API_URL } from "../config";
import type { Book, Genre } from "../types";
import BookCard from "../components/BookCard";
import { useMemo, useState } from "react";
import { Dialog } from "../components/dialog";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "../contexts/toast-context";

export const Route = createFileRoute("/books")({
  component: Books,
  loader: async (): Promise<{ books: Book[]; genres: Genre[] }> => {
    const token = localStorage.getItem("token");
    if (!token) return { books: [], genres: [] };

    try {
      const [booksRes, genresRes] = await Promise.all([
        fetch(`${API_URL}/books`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/genres`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const books = booksRes.ok ? await booksRes.json() : [];
      const genres = genresRes.ok ? await genresRes.json() : [];
      return { books, genres };
    } catch (error) {
      console.error("Failed to fetch books or genres", error);
      return { books: [], genres: [] };
    }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
});

function Books() {
  const { isAuthenticated } = useAuth();
  const { books, genres } = Route.useLoaderData();
  const router = useRouter();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [openAddBookDialog, setOpenAddBookDialog] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    published_year: new Date().getFullYear(),
    available_copies: 1,
    genre_id: genres[0]?.id || 0,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (books ?? []).filter((b) => {
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      );
    });
  }, [books, query]);

  if (!isAuthenticated) return <div>Please login to view this page.</div>;

  const handleAddBook = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newBook.title,
          author: newBook.author,
          published_year: Number(newBook.published_year),
          available_copies: Number(newBook.available_copies),
          genre_id: Number(newBook.genre_id),
        }),
      });

      if (!res.ok) throw new Error("Failed to add book");

      showToast("Book added successfully!", "success");
      setOpenAddBookDialog(false);
      router.invalidate();
    } catch (error) {
      console.error("Add book failed", error);
      showToast("Failed to add book", "error");
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
              <h1 className="text-2xl font-bold text-foreground">
                Books Management
              </h1>
              <p className="text-muted-foreground">Manage and track library books</p>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search books..."
                className="border p-2 rounded-lg bg-card text-card-foreground"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                onClick={() => setOpenAddBookDialog(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                + Add New Book
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length > 0 ? (
              filtered.map((b: Book) => <BookCard key={b.id} book={b} genres={genres} />)
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No books found.
              </div>
            )}
          </div>

          <Dialog open={openAddBookDialog} onClose={() => setOpenAddBookDialog(false)}>
            <h2 className="text-xl font-bold mb-4">Add New Book</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  className="w-full border p-2 rounded bg-background"
                  placeholder="Book Title"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Author</label>
                <input
                  className="w-full border p-2 rounded bg-background"
                  placeholder="Author Name"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Published Year</label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded bg-background"
                    value={newBook.published_year}
                    onChange={(e) => setNewBook({ ...newBook, published_year: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Copies</label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded bg-background"
                    min="1"
                    value={newBook.available_copies}
                    onChange={(e) => setNewBook({ ...newBook, available_copies: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Genre</label>
                <select
                  className="w-full border p-2 rounded bg-background"
                  value={newBook.genre_id}
                  onChange={(e) => setNewBook({ ...newBook, genre_id: parseInt(e.target.value) })}
                >
                  <option value={0} disabled>Select a genre</option>
                  {genres.map((g: Genre) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 border rounded hover:bg-muted"
                  onClick={() => setOpenAddBookDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                  onClick={handleAddBook}
                  disabled={!newBook.title || !newBook.author || !newBook.genre_id}
                >
                  Add Book
                </button>
              </div>
            </div>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
