import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../contexts/auth-context";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { API_URL } from "../config";
import type { Book, Member, BorrowRecord } from "../types";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async (): Promise<{
    books: Book[];
    members: Member[];
    borrowRecords: BorrowRecord[];
  }> => {
    const token = localStorage.getItem("token");
    if (!token) return { books: [], members: [], borrowRecords: [] };

    try {
      const [booksRes, membersRes, borrowRecordsRes] = await Promise.all([
        fetch(`${API_URL}/books`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/borrow-records`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const books = booksRes.ok ? await booksRes.json() : [];
      const members = membersRes.ok ? await membersRes.json() : [];
      const borrowRecords = borrowRecordsRes.ok
        ? await borrowRecordsRes.json()
        : [];

      return { books, members, borrowRecords };
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      return { books: [], members: [], borrowRecords: [] };
    }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
});

function Home() {
  const { isAuthenticated } = useAuth();
  const { books, members, borrowRecords } = Route.useLoaderData();

  if (isAuthenticated) {
    const overdueBooks = borrowRecords.filter(
      (record: BorrowRecord) => record.status === "overdue"
    ).length;

    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-foreground">
              Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Total Books
                </h3>
                <p className="text-3xl font-bold text-primary">
                  {books.length}
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Active Members
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {members.length}
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Overdue Books
                </h3>
                <p className="text-3xl font-bold text-destructive">
                  {overdueBooks}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {borrowRecords.length > 0 ? (
                    borrowRecords.slice(0, 10).map((record: BorrowRecord) => (
                      <div
                        key={record.id}
                        className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <p className="text-sm text-foreground">
                          {record.member?.name || "Member"} {record.status}{" "}
                          {record.book?.title || "Book"}
                        </p>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No recent activity
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-sm border border-border h-96">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
                    Add Book
                  </button>
                  <button className="p-4 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors font-medium">
                    Register Member
                  </button>
                  <button className="p-4 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-colors font-medium">
                    Issue Book
                  </button>
                  <button className="p-4 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors font-medium">
                    Return Book
                  </button>
                </div>
              </div>
            </div>

            {/* Extra content to force scroll */}
            <div className="mt-8 bg-card p-6 rounded-xl shadow-sm border border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                System Status
              </h3>
              <p className="text-muted-foreground">
                System is running smoothly. Last backup was performed at 03:00
                AM.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-4">
            Library Management System
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
            libray Management front end Ui made with the following latest
            technologies.
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* React Card */}
          <TechCard
            name="React 19"
            description="The library for web and native user interfaces. Leveraging the latest features for optimal performance."
            icon={
              <svg
                viewBox="-10.5 -9.45 21 18.9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-[#149ECA]"
              >
                <circle cx="0" cy="0" r="2" fill="currentColor"></circle>
                <g stroke="currentColor" strokeWidth="1" fill="none">
                  <ellipse rx="10" ry="4.5"></ellipse>
                  <ellipse rx="10" ry="4.5" transform="rotate(60)"></ellipse>
                  <ellipse rx="10" ry="4.5" transform="rotate(120)"></ellipse>
                </g>
              </svg>
            }
          />

          {/* Vite Card */}
          <TechCard
            name="Vite"
            description="Next Generation Frontend Tooling. Instant server start and lightning-fast HMR."
            icon={
              <svg
                viewBox="0 0 32 32"
                className="w-12 h-12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M30.6 3.8a1.3 1.3 0 00-1.2-.5l-7.6 1.3L16.6.3a1.3 1.3 0 00-2.3.3L1.4 27.6a1.3 1.3 0 001.8 1.6l27.4-13.8a1.3 1.3 0 000-2.3l-9.5-5.4 9.5-3.9z"
                  fill="#ffc61e"
                />
                <path d="M20.5 10.3l-9.5 5.4 1.3-2.8 8.2-2.6z" fill="#fff" />
                <path
                  d="M20.5 10.3l-8.2 2.6-1.3 2.8-9.6 13.5L20.5 10.3z"
                  fill="#bd34fe"
                />
                <path
                  d="M16.6.3l5.2 4.3-1.3 5.7-9.5 5.4L16.6.3z"
                  fill="#41d1ff"
                />
              </svg>
            }
          />

          {/* Tailwind CSS Card */}
          <TechCard
            name="Tailwind CSS 4"
            description="A utility-first CSS framework for rapidly building custom designs without leaving your HTML."
            icon={
              <svg
                viewBox="0 0 54 33"
                className="w-12 h-12 text-[#38bdf8]"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z"
                />
              </svg>
            }
          />

          {/* TanStack Router Card */}
          <TechCard
            name="TanStack Router"
            description="Type-safe routing for React applications. Powerful, flexible, and built for the modern web."
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-gray-300 dark:text-gray-700"
                  stroke="currentColor"
                />
                <path d="M50 25 L50 50 L70 70" className="text-red-500" />
                <circle
                  cx="50"
                  cy="50"
                  r="5"
                  className="text-red-500"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            }
          />

          {/* TypeScript Card */}
          <TechCard
            name="TypeScript"
            description="JavaScript with syntax for types. Adds safety and enhances the developer experience."
            icon={
              <svg
                viewBox="0 0 128 128"
                className="w-12 h-12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="#007ACC" d="M0 0h128v128H0z" />
                <path
                  fill="#FFF"
                  d="M71.4 99.6c-1.4 0-2.9-.1-4.3-.4-10.4-2.1-13.9-11.8-13.9-11.8l10.8-6.6s1.6 4.3 5.3 5.9c2.4 1 5.4.3 5.4-2.7 0-2.1-2.2-3.2-5.4-4.5-7.8-3.1-12.9-7.4-12.9-15.6 0-10.5 8.9-16.7 19.7-16.7 8.1 0 14.5 2.5 14.5 2.5l-5.6 9.5s-4.5-2.6-9.2-2.6c-2.9 0-5.1 1.2-5.1 3.2 0 1.9 2.4 2.8 6.4 4.5 8.2 3.4 12.6 8.2 12.6 16.1 0 11.2-9.6 19.2-18.3 19.2zm-42.3-.2c-12.4 0-19.1-6.1-19.1-6.1l5.9-9.3s5.1 3.6 10.9 3.6c3.9 0 5.6-1.9 5.6-4.4v-35h11.9v35.7c0 11.5-7.1 15.5-15.2 15.5z"
                />
              </svg>
            }
          />
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-base text-gray-400">
            Built with ❤️ by Samuel Zenebe
            <br />
            <a
              href="https://github.com/samuel7zenebe"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function TechCard({
  name,
  description,
  icon,
}: {
  name: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative group bg-card p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border">
      <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-foreground">
          <span className="absolute inset-0 rounded-2xl" />
          {name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg
          className="w-5 h-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </div>
    </div>
  );
}
