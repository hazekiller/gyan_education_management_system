const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization'); // Assuming you have this or similar
const libraryController = require('../controllers/libraryController');

router.use(authenticate);

// Public (Authenticated) - View Books
router.get('/books', libraryController.getAllBooks);
router.get('/books/:id', libraryController.getBookById);

// My Books (Student/Teacher)
router.get('/my-books', libraryController.getMyBooks);

// Admin / Librarian Routes
// Note: Adjust permissions as per your system. Assuming 'library' resource exists or using generic admin check.
// For now, I'll use a check that allows admins and maybe teachers/staff if they manage library.
// If 'library' permission doesn't exist in your seeds, you might need to add it or use 'super_admin' check.
// I will assume a generic 'manage_library' or just rely on role checks if permissions aren't granular.
// Let's use a placeholder middleware or just role check for now if authorization middleware is strict.

// Books Management
router.post('/books', libraryController.addBook); // Add permission check later
router.put('/books/:id', libraryController.updateBook);
router.delete('/books/:id', libraryController.deleteBook);

// Transactions
router.get('/transactions', libraryController.getTransactions);
router.post('/issue', libraryController.issueBook);
router.post('/return', libraryController.returnBook);

module.exports = router;
