import { createFileRoute, Link } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/auth-context";
import { API_URL } from "../config";
import { BarChart3, AlertTriangle, TrendingUp, TriangleAlert, ArrowLeft } from "lucide-react";
import { type BorrowRecord } from "../types";
import { differenceInDays } from "date-fns";


type ReportSummary = {
  totalBorrowsThisMonth: number;
  averageBorrowDuration: number;
  returnRate: number;
};

type PopularGenre = {
  genre_name: string;
  borrow_count: number;
};



type ReportsData = {
  summary: ReportSummary;
  popularGenres: PopularGenre[];
  overdueBooks: BorrowRecord[];
};

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  loader: async (): Promise<ReportsData> => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: token ? `Bearer ${token}` : "" };

    try {
      // Fetching all report data in parallel
      const [summaryRes, genresRes, overdueRes] = await Promise.all([
        fetch(`${API_URL}/borrow-records/reports/summary`, { headers }),
        fetch(`${API_URL}/borrow-records/reports/popular-genres`, { headers }),
        fetch(`${API_URL}/borrow-records/reports/overdue`, { headers })
      ]);

      const summary = summaryRes.ok ? await summaryRes.json() : { totalBorrowsThisMonth: 0, averageBorrowDuration: 0, returnRate: 0 };
      const popularGenres = genresRes.ok ? await genresRes.json() : [];
      const overdueBooks = overdueRes.ok ? await overdueRes.json() : [];

      return { summary, popularGenres, overdueBooks };
    } catch (error) {
      console.error("Failed to fetch reports", error);
      return {
        summary: { totalBorrowsThisMonth: 0, averageBorrowDuration: 0, returnRate: 0 },
        popularGenres: [],
        overdueBooks: []
      };
    }
  },
});

function ReportsPage() {
  const { isAuthenticated, user } = useAuth();
  const { summary, popularGenres, overdueBooks } = Route.useLoaderData();

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
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Library analytics and reports</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Overdue Books Section */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-500" />
                <h2 className="text-xl font-bold">Overdue Books</h2>
              </div>
              <p className="text-muted-foreground mb-4">Books that are past their due date</p>

              <div className="space-y-4">
                {overdueBooks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No overdue books.</p>
                ) : (
                  overdueBooks.map((data) => (
                    <div key={data.book.id} className=" flex justify-between items-center p-3  rounded-lg border border-red-100">
                      <div>
                        <h3 className="font-bold text-foreground">{data.book.title}</h3>
                        <p className="text-xs text-muted-foreground">Member: {data.member.name}</p>
                        <p className="text-xs text-muted-foreground">Due: {data.due_date}</p>
                      </div>
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {differenceInDays(new Date(), new Date(data.due_date))} days overdue
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Popular Genres Section */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-500" />
                <h2 className="text-xl font-bold">Popular Genres</h2>
              </div>
              <p className="text-muted-foreground mb-4">Most borrowed book genres</p>

              <div className="space-y-4">
                {popularGenres.map((genre, index) => (
                  <div key={genre.genre_name} className="flex items-center gap-4">
                    <span className="text-muted-foreground font-mono w-4">#{index + 1}</span>
                    <span className="font-medium w-32">{genre.genre_name}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min((genre.borrow_count / Math.max(...popularGenres.map(g => g.borrow_count))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground font-mono w-8 text-right">{genre.borrow_count}</span>
                  </div>
                ))}
                {popularGenres.length === 0 && <p className="text-sm text-muted-foreground">No data available.</p>}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Borrows This Month</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{summary.totalBorrowsThisMonth}</span>
                <BarChart3 className="text-muted-foreground h-4 w-4 mb-1" />
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Average Borrow Duration</p>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{summary.averageBorrowDuration}</span>
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
                <BarChart3 className="text-muted-foreground h-4 w-4 mb-1" />
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Return Rate</p>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{summary.returnRate}%</span>
                </div>
                <BarChart3 className="text-muted-foreground h-4 w-4 mb-1" />
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
