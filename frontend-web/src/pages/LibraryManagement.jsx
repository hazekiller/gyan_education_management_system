import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Book,
  Search,
  Plus,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  History,
  BookOpen,
} from "lucide-react";
import { libraryAPI, studentsAPI, teachersAPI } from "../lib/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const LibraryManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("books");
  const isAdmin = ["super_admin", "principal", "librarian"].includes(
    user?.role
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Library Management</h1>
        <p className="text-gray-600 mt-1">
          Manage books, issue/return, and track inventory
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
        {[
          { id: "books", label: "Books Inventory", icon: Book },
          ...(isAdmin
            ? [
                { id: "issue", label: "Issue/Return", icon: CheckCircle },
                { id: "transactions", label: "History", icon: History },
              ]
            : []),
          { id: "my-books", label: "My Books", icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 min-h-[500px]">
        {activeTab === "books" && <BooksInventoryTab isAdmin={isAdmin} />}
        {activeTab === "issue" && isAdmin && <IssueReturnTab />}
        {activeTab === "transactions" && isAdmin && <TransactionsTab />}
        {activeTab === "my-books" && <MyBooksTab />}
      </div>
    </div>
  );
};

// ==========================================
// BOOKS INVENTORY TAB
// ==========================================
const BooksInventoryTab = ({ isAdmin }) => {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["library-books", search],
    queryFn: () =>
      libraryAPI.getAllBooks({ search }).then((res) => res.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: libraryAPI.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries(["library-books"]);
      toast.success("Book deleted");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete"),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
          />
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 font-medium text-gray-600">Title</th>
              <th className="p-3 font-medium text-gray-600">Author</th>
              <th className="p-3 font-medium text-gray-600">Category</th>
              <th className="p-3 font-medium text-gray-600">Rack</th>
              <th className="p-3 font-medium text-gray-600 text-center">
                Copies (Avail/Total)
              </th>
              {isAdmin && (
                <th className="p-3 font-medium text-gray-600 text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No books found
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{book.book_title}</td>
                  <td className="p-3 text-gray-600">{book.author}</td>
                  <td className="p-3 text-gray-600">{book.category}</td>
                  <td className="p-3 text-gray-600">
                    {book.rack_number || "-"}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`font-bold ${
                        book.available_copies > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {book.available_copies}
                    </span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span>{book.total_copies}</span>
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm("Delete this book?"))
                            deleteMutation.mutate(book.id);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && <AddBookModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

const AddBookModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    book_title: "",
    author: "",
    isbn: "",
    category: "",
    total_copies: 1,
    rack_number: "",
    description: "",
  });

  const mutation = useMutation({
    mutationFn: libraryAPI.addBook,
    onSuccess: () => {
      queryClient.invalidateQueries(["library-books"]);
      toast.success("Book added");
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to add"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Book</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              required
              className="w-full border rounded px-3 py-2"
              value={formData.book_title}
              onChange={(e) =>
                setFormData({ ...formData, book_title: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ISBN</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Copies
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full border rounded px-3 py-2"
                value={formData.total_copies}
                onChange={(e) =>
                  setFormData({ ...formData, total_copies: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rack No.</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={formData.rack_number}
                onChange={(e) =>
                  setFormData({ ...formData, rack_number: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// ISSUE / RETURN TAB
// ==========================================
const IssueReturnTab = () => {
  const [mode, setMode] = useState("issue"); // 'issue' or 'return'
  const [userType, setUserType] = useState("student");
  const [userId, setUserId] = useState("");
  const [bookId, setBookId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const queryClient = useQueryClient();

  // Fetch lists for dropdowns
  const { data: students = [] } = useQuery({
    queryKey: ["students-list"],
    queryFn: () => studentsAPI.getAll().then((res) => res.data || []),
  });
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-list"],
    queryFn: () => teachersAPI.getAll().then((res) => res.data || []),
  });
  const { data: books = [] } = useQuery({
    queryKey: ["books-list"],
    queryFn: () =>
      libraryAPI
        .getAllBooks({ available_only: true })
        .then((res) => res.data || []),
  });

  const issueMutation = useMutation({
    mutationFn: libraryAPI.issueBook,
    onSuccess: () => {
      toast.success("Book Issued Successfully");
      queryClient.invalidateQueries(["library-books"]);
      setUserId("");
      setBookId("");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to issue"),
  });

  const returnMutation = useMutation({
    mutationFn: libraryAPI.returnBook,
    onSuccess: () => {
      toast.success("Book Returned Successfully");
      setTransactionId("");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to return"),
  });

  const handleIssue = (e) => {
    e.preventDefault();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // Default 14 days

    issueMutation.mutate({
      book_id: bookId,
      user_id: userId,
      user_type: userType,
      due_date: dueDate.toISOString().split("T")[0],
      remarks: "",
    });
  };

  const handleReturn = (e) => {
    e.preventDefault();
    returnMutation.mutate({
      transaction_id: transactionId,
      status: "returned",
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex space-x-4 mb-6 justify-center">
        <button
          onClick={() => setMode("issue")}
          className={`px-6 py-2 rounded-full font-medium ${
            mode === "issue"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Issue Book
        </button>
        <button
          onClick={() => setMode("return")}
          className={`px-6 py-2 rounded-full font-medium ${
            mode === "return"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Return Book
        </button>
      </div>

      {mode === "issue" ? (
        <form
          onSubmit={handleIssue}
          className="space-y-6 bg-gray-50 p-8 rounded-xl border"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                User Type
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Select User
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              >
                <option value="">-- Select --</option>
                {userType === "student"
                  ? students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} ({s.admission_number})
                      </option>
                    ))
                  : teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.first_name} {t.last_name} ({t.employee_id})
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Select Book
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              required
            >
              <option value="">-- Select Book --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.book_title} (Avail: {b.available_copies})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={issueMutation.isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            {issueMutation.isPending ? "Processing..." : "Issue Book"}
          </button>
        </form>
      ) : (
        <div className="space-y-6 bg-gray-50 p-8 rounded-xl border">
          <p className="text-sm text-gray-600 mb-4">
            Enter the Transaction ID to return a book. You can find this in the
            History tab.
          </p>
          <form onSubmit={handleReturn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                required
                className="w-full border rounded px-3 py-2"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter ID"
              />
            </div>
            <button
              type="submit"
              disabled={returnMutation.isPending}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              {returnMutation.isPending ? "Processing..." : "Return Book"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// ==========================================
// TRANSACTIONS TAB
// ==========================================
const TransactionsTab = () => {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["library-transactions"],
    queryFn: () => libraryAPI.getTransactions({}).then((res) => res.data || []),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-3 font-medium text-gray-600">ID</th>
            <th className="p-3 font-medium text-gray-600">Book</th>
            <th className="p-3 font-medium text-gray-600">User</th>
            <th className="p-3 font-medium text-gray-600">Issue Date</th>
            <th className="p-3 font-medium text-gray-600">Due Date</th>
            <th className="p-3 font-medium text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {isLoading ? (
            <tr>
              <td colSpan="6" className="p-8 text-center">
                Loading...
              </td>
            </tr>
          ) : transactions.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-8 text-center text-gray-500">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-xs text-gray-500">#{t.id}</td>
                <td className="p-3 font-medium">{t.book_title}</td>
                <td className="p-3">
                  <div className="text-sm font-medium">{t.user_name}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {t.user_type}
                  </div>
                </td>
                <td className="p-3 text-gray-600">
                  {new Date(t.issue_date).toLocaleDateString()}
                </td>
                <td className="p-3 text-gray-600">
                  {new Date(t.due_date).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs capitalize ${
                      t.status === "issued"
                        ? "bg-blue-100 text-blue-800"
                        : t.status === "returned"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// MY BOOKS TAB
// ==========================================
const MyBooksTab = () => {
  const { data: myBooks = [], isLoading } = useQuery({
    queryKey: ["my-books"],
    queryFn: () => libraryAPI.getMyBooks().then((res) => res.data || []),
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        <p>Loading...</p>
      ) : myBooks.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>You haven't borrowed any books yet.</p>
        </div>
      ) : (
        myBooks.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-gray-800 leading-tight">
                {item.book_title}
              </h3>
              <span
                className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                  item.status === "issued"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">by {item.author}</p>

            <div className="text-sm space-y-1 border-t pt-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Issued:</span>
                <span>{new Date(item.issue_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due:</span>
                <span
                  className={
                    item.status === "issued" &&
                    new Date(item.due_date) < new Date()
                      ? "text-red-600 font-bold"
                      : ""
                  }
                >
                  {new Date(item.due_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LibraryManagement;
