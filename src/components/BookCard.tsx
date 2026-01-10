import { useState } from "react";
import { Dialog } from "./dialog";
import type { Book, Genre } from "../types";
import { Eye, Edit2, Trash2, X, Book as BookIcon } from "lucide-react";
import { API_URL } from "../config";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "../contexts/toast-context";

type Props = {
  book: Book;
  genres: Genre[];
};

export function BookCard({ book, genres }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [editForm, setEditForm] = useState({
    title: book.title,
    author: book.author,
    published_year: book.published_year,
    available_copies: book.available_copies,
    genre_id: book.genre_id,
  });

  const handleEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/books/${book.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          published_year: Number(editForm.published_year),
          available_copies: Number(editForm.available_copies),
          genre_id: Number(editForm.genre_id),
        }),
      });

      if (!res.ok) throw new Error("Failed to update book");
      showToast("Book updated successfully!", "success");
      setOpenEdit(false);
      router.invalidate();
    } catch (error) {
      console.error("Edit failed", error);
      showToast("Failed to update book", "error");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/books/${book.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete book");
      showToast("Book deleted successfully!", "success");
      setOpenDelete(false);
      router.invalidate();
    } catch (error) {
      console.error("Delete failed", error);
      showToast("Failed to delete book", "error");
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-5 flex flex-col hover:shadow-md transition-all duration-200 group">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">{book.title}</h3>
          <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
            <BookIcon size={20} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
        <p className="text-sm text-muted-foreground font-mono">Published: {book.published_year}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium ${book.available_copies > 0 ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
        {book.available_copies > 0 ? 'Available' : 'Borrowed'} ({book.available_copies} copies)
      </span>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setOpenView(true)} className="flex items-center gap-2 text-primary hover:underline font-medium"><Eye size={16} /> View</button>
          <button onClick={() => setOpenEdit(true)} className="flex items-center gap-2 text-primary hover:underline font-medium"><Edit2 size={16} /> Edit</button>
          <button onClick={() => setOpenDelete(true)} className="flex items-center gap-2 text-destructive hover:underline font-medium"><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      <Dialog open={openView} onClose={() => setOpenView(false)}>
        <h2 className="text-xl font-bold mb-4">Book Details</h2>
        <div className="space-y-2">
          <div><strong>Title: </strong>{book.title}</div>
          <div><strong>Author: </strong>{book.author}</div>
          <div><strong>Year: </strong>{book.published_year}</div>
          <div><strong>Genre: </strong>{book.genre?.name || 'N/A'}</div>
          <div><strong>Available Copies: </strong>{book.available_copies}</div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setOpenView(false)} className="px-4 py-2 rounded border flex items-center gap-2 font-medium hover:bg-muted"><X size={14} /> Close</button>
        </div>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <h2 className="text-xl font-bold mb-4">Edit Book</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full border p-2 rounded bg-background"
              value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <input
              className="w-full border p-2 rounded bg-background"
              value={editForm.author}
              onChange={e => setEditForm({ ...editForm, author: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                type="number"
                className="w-full border p-2 rounded bg-background"
                value={editForm.published_year}
                onChange={e => setEditForm({ ...editForm, published_year: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Copies</label>
              <input
                type="number"
                className="w-full border p-2 rounded bg-background"
                value={editForm.available_copies}
                onChange={e => setEditForm({ ...editForm, available_copies: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Genre</label>
            <select
              className="w-full border p-2 rounded bg-background"
              value={editForm.genre_id}
              onChange={e => setEditForm({ ...editForm, genre_id: parseInt(e.target.value) })}
            >
              {genres.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setOpenEdit(false)} className="px-4 py-2 border rounded hover:bg-muted">Cancel</button>
            <button onClick={handleEdit} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">Save Changes</button>
          </div>
        </div>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
        <p className="text-muted-foreground">Are you sure you want to delete <span className="font-bold text-foreground">"{book.title}"</span>? This action cannot be undone.</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setOpenDelete(false)} className="px-4 py-2 border rounded hover:bg-muted">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-destructive text-white rounded hover:bg-destructive/90 transition-colors">Delete Book</button>
        </div>
      </Dialog>
    </div>
  );
}

export default BookCard;
