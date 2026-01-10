export type UserType = {
  id: string;
  email: string;
  username: string;
  role: string;
};
export type Member = {
  id: number,
  name: string;
  email: string;
  phone: string;
  join_date: string;
};

export type Staff = {
  id: number;
  username?: string;
  email: string;
  role: "admin" | "librarian";
  phone: string;
  join_date: string;
};

export type BorrowRecord = {
  id: number;
  book_id: number;
  member_id: number;
  return_date: string;
  due_date: string;
  borrow_date: string;
  book: Book;
  member: Member;
};

export type Genre = {
  id: number;
  name: string;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  published_year: number;
  available_copies: number,
  genre_id: number,
  genre: Genre
};