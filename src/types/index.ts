export type UserType = {
  id: string;
  email: string;
  username: string;
  role: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  status: "available" | "borrowed";
};

export type Member = {
  name: "string";
  email: "string";
  phone: "string";
  join_date: "string";
};

export type BorrowRecord = {
  id: string;
  bookId: string;
  memberId: string;
  status: "borrowed" | "returned" | "overdue";
  createdAt: string;
  book?: Book;
  member?: Member;
};
