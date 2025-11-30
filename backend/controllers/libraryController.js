const pool = require("../config/database");

// ==========================================
// BOOK MANAGEMENT
// ==========================================

// Get all books with filters
const getAllBooks = async (req, res) => {
  try {
    const { search, category, available_only } = req.query;

    let query = `SELECT * FROM library_books WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (book_title LIKE ? OR author LIKE ? OR isbn LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (available_only === "true") {
      query += ` AND available_copies > 0`;
    }

    query += ` ORDER BY created_at DESC`; // Note: Schema says added_at, but standard is created_at. Let's check schema again or alias.
    // Schema check from previous turn: `added_at` timestamp.
    // Correction: ORDER BY added_at DESC
    query = query.replace("created_at", "added_at");

    const [books] = await pool.query(query, params);

    res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
      error: error.message,
    });
  }
};

// Get single book
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const [books] = await pool.query(
      "SELECT * FROM library_books WHERE id = ?",
      [id]
    );

    if (books.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    res.json({ success: true, data: books[0] });
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch book",
      error: error.message,
    });
  }
};

// Add new book
const addBook = async (req, res) => {
  try {
    const {
      book_title,
      author,
      isbn,
      publisher,
      publication_year,
      category,
      total_copies,
      rack_number,
      description,
    } = req.body;

    if (!book_title || !total_copies) {
      return res.status(400).json({
        success: false,
        message: "Title and Total Copies are required",
      });
    }

    // Check ISBN uniqueness if provided
    if (isbn) {
      const [existing] = await pool.query(
        "SELECT id FROM library_books WHERE isbn = ?",
        [isbn]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Book with this ISBN already exists",
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO library_books 
      (book_title, author, isbn, publisher, publication_year, category, total_copies, available_copies, rack_number, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book_title,
        author,
        isbn || null,
        publisher,
        publication_year,
        category,
        total_copies,
        total_copies, // available = total initially
        rack_number,
        description,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: { id: result.insertId, book_title },
    });
  } catch (error) {
    console.error("Add book error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add book",
      error: error.message,
    });
  }
};

// Update book
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Logic to handle total_copies change vs available_copies needs care
    // For MVP, we'll just update fields directly, but in production, changing total_copies should adjust available_copies safely.

    // Simple update for now
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0)
      return res.status(400).json({ message: "No fields to update" });

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    values.push(id);

    await pool.query(
      `UPDATE library_books SET ${setClause} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: "Book updated successfully" });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update book",
      error: error.message,
    });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if any active transactions exist
    const [active] = await pool.query(
      "SELECT id FROM library_transactions WHERE book_id = ? AND status = 'issued'",
      [id]
    );

    if (active.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete book with active issues",
      });
    }

    await pool.query("DELETE FROM library_books WHERE id = ?", [id]);
    res.json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message,
    });
  }
};

// ==========================================
// TRANSACTIONS (ISSUE / RETURN)
// ==========================================

// Issue Book
const issueBook = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { book_id, user_id, user_type, due_date, remarks } = req.body;
    const issued_by = req.user.id;

    // 1. Resolve user_id (student/teacher ID) to users.id
    let dbUserId = null;
    if (user_type === "student") {
      const [s] = await connection.query(
        "SELECT user_id FROM students WHERE id = ?",
        [user_id]
      );
      if (s.length === 0) throw new Error("Student not found");
      dbUserId = s[0].user_id;
    } else if (user_type === "teacher") {
      const [t] = await connection.query(
        "SELECT user_id FROM teachers WHERE id = ?",
        [user_id]
      );
      if (t.length === 0) throw new Error("Teacher not found");
      dbUserId = t[0].user_id;
    } else {
      throw new Error("Invalid user type");
    }

    if (!dbUserId) throw new Error("User account not found for this member");

    // 2. Check book availability
    const [books] = await connection.query(
      "SELECT available_copies, total_copies FROM library_books WHERE id = ?",
      [book_id]
    );
    if (books.length === 0) throw new Error("Book not found");
    if (books[0].available_copies <= 0) throw new Error("Book not available");

    // 3. Check if user already has this book issued
    const [existing] = await connection.query(
      "SELECT id FROM library_transactions WHERE book_id = ? AND user_id = ? AND status = 'issued'",
      [book_id, dbUserId]
    );
    if (existing.length > 0)
      throw new Error("User already has this book issued");

    // 4. Create Transaction
    await connection.query(
      `INSERT INTO library_transactions 
      (book_id, user_id, user_type, issue_date, due_date, status, remarks, issued_by)
      VALUES (?, ?, ?, CURDATE(), ?, 'issued', ?, ?)`,
      [book_id, dbUserId, user_type, due_date, remarks, issued_by]
    );

    // 5. Decrease available copies
    await connection.query(
      "UPDATE library_books SET available_copies = available_copies - 1 WHERE id = ?",
      [book_id]
    );

    await connection.commit();
    res
      .status(201)
      .json({ success: true, message: "Book issued successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Issue book error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to issue book",
    });
  } finally {
    connection.release();
  }
};

// Return Book
const returnBook = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { transaction_id, return_date, fine_amount, remarks, status } =
      req.body;
    // status can be 'returned' or 'lost'

    // 1. Get transaction details
    const [trans] = await connection.query(
      "SELECT book_id, status FROM library_transactions WHERE id = ?",
      [transaction_id]
    );
    if (trans.length === 0) throw new Error("Transaction not found");
    if (trans[0].status !== "issued" && trans[0].status !== "overdue")
      throw new Error("Book already returned or processed");

    const bookId = trans[0].book_id;
    const finalStatus = status || "returned";

    // 2. Update Transaction
    await connection.query(
      `UPDATE library_transactions 
       SET return_date = ?, fine_amount = ?, status = ?, remarks = ?
       WHERE id = ?`,
      [
        return_date || new Date(),
        fine_amount || 0,
        finalStatus,
        remarks,
        transaction_id,
      ]
    );

    // 3. Increase available copies
    if (finalStatus === "returned") {
      await connection.query(
        "UPDATE library_books SET available_copies = available_copies + 1 WHERE id = ?",
        [bookId]
      );
    } else if (finalStatus === "lost") {
      // Optionally decrease total copies if it's permanently lost
      await connection.query(
        "UPDATE library_books SET total_copies = total_copies - 1 WHERE id = ?",
        [bookId]
      );
    }

    await connection.commit();
    res.json({ success: true, message: `Book marked as ${finalStatus}` });
  } catch (error) {
    await connection.rollback();
    console.error("Return book error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to return book",
    });
  } finally {
    connection.release();
  }
};

// Get Transactions (History)
const getTransactions = async (req, res) => {
  try {
    const { user_id, status, search } = req.query;

    let query = `
      SELECT lt.*, lb.book_title, lb.isbn,
      CASE 
        WHEN lt.user_type = 'student' THEN CONCAT(s.first_name, ' ', s.last_name)
        WHEN lt.user_type = 'teacher' THEN CONCAT(t.first_name, ' ', t.last_name)
        ELSE 'Unknown'
      END as user_name,
      CASE
        WHEN lt.user_type = 'student' THEN s.admission_number
        WHEN lt.user_type = 'teacher' THEN t.employee_id
        ELSE NULL
      END as user_code
      FROM library_transactions lt
      JOIN library_books lb ON lt.book_id = lb.id
      LEFT JOIN students s ON lt.user_type = 'student' AND lt.user_id = s.user_id
      LEFT JOIN teachers t ON lt.user_type = 'teacher' AND lt.user_id = t.user_id
      WHERE 1=1
    `;

    const params = [];

    if (user_id) {
      // Here user_id param might be the login ID or student ID.
      // Assuming admin filters by login ID or we need to resolve it.
      // For simplicity, let's assume filtering by transaction user_id (which is login ID)
      query += ` AND lt.user_id = ?`;
      params.push(user_id);
    }
    if (status) {
      query += ` AND lt.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (lb.book_title LIKE ? OR s.first_name LIKE ? OR t.first_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY lt.issue_date DESC`;

    const [transactions] = await pool.query(query, params);
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

// Get My Books (for logged in user)
const getMyBooks = async (req, res) => {
  try {
    const userId = req.user.id; // This is the users table ID

    const [myBooks] = await pool.query(
      `
      SELECT lt.*, lb.book_title, lb.author, lb.isbn
      FROM library_transactions lt
      JOIN library_books lb ON lt.book_id = lb.id
      WHERE lt.user_id = ?
      ORDER BY lt.issue_date DESC
    `,
      [userId]
    );

    res.json({ success: true, data: myBooks });
  } catch (error) {
    console.error("Get my books error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your books",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  getTransactions,
  getMyBooks,
};
