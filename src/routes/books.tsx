import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/auth-context";
import { API_URL } from "../config";
import type { Book } from "../types";

export const Route = createFileRoute("/books")({
  component: Books,
  loader: async (): Promise<{ books: Book[] }> => {
    const token = localStorage.getItem("token");
    if (!token) return { books: [] };

    try {
      const res = await fetch(`${API_URL}/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const books = res.ok ? await res.json() : [];
      return { books };
    } catch (error) {
      console.error("Failed to fetch books", error);
      return { books: [] };
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
  const { books } = Route.useLoaderData();

  if (!isAuthenticated) {
    return <div>Please login to view this page.</div>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Books Management
            </h1>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Add New Book
            </button>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">
                      Title
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">
                      Author
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">
                      ISBN
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {books.length > 0 ? (
                    books.map((book) => (
                      <tr
                        key={book.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {book.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {book.author}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                          {book.isbn}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              book.status === "available"
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                            }`}
                          >
                            {book.status}
                          </span>
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
                        colSpan={5}
                        className="px-6 py-8 text-center text-muted-foreground"
                      >
                        No books found.
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
