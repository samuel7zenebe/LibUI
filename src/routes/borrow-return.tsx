import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/auth-context";
import { API_URL } from "../config";
import type { BorrowRecord, Book, Member } from "../types";
import { useMemo, useState } from "react";
import { Dialog } from "../components/dialog";
import { Calendar, User, Book as BookIcon, Search, Filter, Loader2 } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "../contexts/toast-context";

export const Route = createFileRoute("/borrow-return")({
    component: BorrowReturnPage,
    loader: async (): Promise<{ records: BorrowRecord[]; books: Book[]; members: Member[] }> => {
        const token = localStorage.getItem("token");
        if (!token) return { records: [], books: [], members: [] };
        try {
            const [recordsRes, booksRes, membersRes] = await Promise.all([
                fetch(`${API_URL}/borrow-records`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/books`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/members`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const records = recordsRes.ok ? await recordsRes.json() : [];
            const books = booksRes.ok ? await booksRes.json() : [];
            const members = membersRes.ok ? await membersRes.json() : [];

            return { records, books, members };
        } catch (error) {
            console.error("Failed to fetch data", error);
            return { records: [], books: [], members: [] };
        }
    },
});

function BorrowReturnPage() {
    const { isAuthenticated } = useAuth();
    const { records, books, members } = Route.useLoaderData();
    const router = useRouter();
    const { showToast } = useToast();
    const [recordList, setRecordList] = useState<BorrowRecord[]>(records);
    const [openBorrowDialog, setOpenBorrowDialog] = useState(false);
    const [borrowForm, setBorrowForm] = useState({ book_id: "", member_id: "", due_date: "" });
    const [loading, setLoading] = useState(false);
    const [returningId, setReturningId] = useState<string | null>(null);

    // Filter available books
    const availableBooks = useMemo(() => {
        return books.filter(book => book.available_copies > 0);
    }, [books]);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "returned">("all");

    const filteredRecords = useMemo(() => {
        let list = recordList;
        if (statusFilter === "active") {
            list = list.filter(r => !r.return_date);
        } else if (statusFilter === "returned") {
            list = list.filter(r => r.return_date);
        }
        const q = searchQuery.toLowerCase().trim();
        if (q) {
            list = list.filter(r =>
                (r.book?.title || "").toLowerCase().includes(q) ||
                (r.member?.name || "").toLowerCase().includes(q) ||
                r.book_id.toString().includes(q) ||
                r.member_id.toString().includes(q)
            );
        }
        return list;
    }, [recordList, statusFilter, searchQuery]);

    if (!isAuthenticated) return <div>Please login to view this page.</div>;

    const handleReturn = async (id: string) => {
        setReturningId(id);
        try {
            const token = localStorage.getItem("token");
            const parsedId = Number.parseInt(id);
            const res = await fetch(`${API_URL}/borrow-records/return`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ "borrow_record_id": parsedId })
            });

            const updated = await res.json();
            setRecordList(recordList.map(r => r.id === parsedId ? updated : r));
            showToast("Book returned successfully!", "success");
            router.invalidate();
        } catch (error) {
            console.error("Return failed", error);
            showToast("Failed to return book", "error");
        } finally {
            setReturningId(null);
        }
    };

    const handleBorrow = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/borrow-records/borrow`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    book_id: Number(borrowForm.book_id),
                    member_id: Number(borrowForm.member_id),
                    due_date: borrowForm.due_date
                })
            });

            if (!res.ok) throw new Error("Failed to borrow book");

            const newRecord = await res.json();
            setRecordList([newRecord, ...recordList]);
            setOpenBorrowDialog(false);
            setBorrowForm({ book_id: "", member_id: "", due_date: "" });
            showToast("Book borrowed successfully!", "success");
            router.invalidate();
        } catch (error) {
            console.error("Borrow failed", error);
            showToast("Failed to borrow book", "error");
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
                            <h1 className="text-2xl font-bold text-foreground">Borrow & Return</h1>
                            <p className="text-muted-foreground">Manage book borrowing and return operations</p>
                        </div>
                        <button onClick={() => setOpenBorrowDialog(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            + Borrow Book
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="text"
                                placeholder="Search by book, member or ID..."
                                className="pl-10 pr-4 py-2 border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-muted-foreground" />
                            <select
                                className="border rounded-lg px-3 py-2 bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value as "all" | "active" | "returned")}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Borrows</option>
                                <option value="returned">Returned Books</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredRecords.map((record: BorrowRecord) => (
                            <div key={record.id} className="bg-card p-6 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all hover:shadow-md">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <BookIcon size={20} className="text-primary" />
                                        <span className="font-bold text-lg">{record.book?.title || `Book ID: ${record.book_id}`}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold ${!record.return_date ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {!record.return_date ? 'ACTIVE' : 'RETURNED'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User size={16} />
                                        <span className="font-medium">{record.member?.name || `Member ID: ${record.member_id}`}</span>
                                    </div>
                                    <div className="flex gap-8 text-sm mt-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground text-[10px] uppercase font-bold">Borrowed</p>
                                                <p className="font-medium">{new Date(record.borrow_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {record.due_date && (
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-muted-foreground" />
                                                <div>
                                                    <p className="text-muted-foreground text-[10px] uppercase font-bold">Due</p>
                                                    <p className="font-medium">{new Date(record.due_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        )}
                                        {record.return_date && (
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-muted-foreground" />
                                                <div>
                                                    <p className="text-muted-foreground text-[10px] uppercase font-bold">Returned</p>
                                                    <p className="font-medium">{new Date(record.return_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    {!record.return_date && (
                                        <button
                                            onClick={() => handleReturn(record.id.toString())}
                                            disabled={!!returningId}
                                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {returningId === record.id.toString() ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={16} />
                                                    Returning...
                                                </>
                                            ) : (
                                                "Return Book"
                                            )}
                                        </button>
                                    )}
                                    {record.return_date && (
                                        <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm bg-muted px-3 py-1.5 rounded-lg">
                                            COMPLETED
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredRecords.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground font-medium border rounded-lg border-dashed">
                                {recordList.length === 0 ? "No borrow records found." : "No records matching your filters."}
                            </div>
                        )}
                    </div>

                    <Dialog open={openBorrowDialog} onClose={() => !loading && setOpenBorrowDialog(false)}>
                        <h2 className="text-xl font-bold mb-4">Borrow Book</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Book</label>
                                <select
                                    className="w-full border p-2 rounded bg-background"
                                    value={borrowForm.book_id}
                                    onChange={(e) => setBorrowForm({ ...borrowForm, book_id: e.target.value })}
                                    disabled={loading}
                                >
                                    <option value="" disabled>Select a book...</option>
                                    {availableBooks.map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} (Copies: {book.available_copies})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Member</label>
                                <select
                                    className="w-full border p-2 rounded bg-background"
                                    value={borrowForm.member_id}
                                    onChange={(e) => setBorrowForm({ ...borrowForm, member_id: e.target.value })}
                                    disabled={loading}
                                >
                                    <option value="" disabled>Select a member...</option>
                                    {members.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full border p-2 rounded bg-background"
                                    value={borrowForm.due_date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setBorrowForm({ ...borrowForm, due_date: e.target.value })}
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    className="px-4 py-2 border rounded font-medium hover:bg-muted disabled:opacity-50"
                                    onClick={() => setOpenBorrowDialog(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    onClick={handleBorrow}
                                    disabled={loading || !borrowForm.book_id || !borrowForm.member_id}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            Processing...
                                        </>
                                    ) : (
                                        "Confirm Borrow"
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
