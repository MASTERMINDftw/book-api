const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// In-memory list of books
let books = [];
let idCounter = 1;

// GET all books
app.get('/books', (req, res) => {
  res.json(books);
});

// GET a single book by ID
app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// POST one or multiple books
app.post('/books', (req, res) => {
  const data = req.body;

  // Helper function to validate book structure
  const isValidBook = (book) =>
    book && typeof book.title === 'string' && typeof book.author === 'string';

  // If array of books
  if (Array.isArray(data)) {
    const invalidBooks = data.filter(book => !isValidBook(book));
    if (invalidBooks.length > 0) {
      return res.status(400).json({ message: 'All books must have title and author' });
    }

    const newBooks = data.map(book => ({
      id: idCounter++,
      title: book.title,
      author: book.author
    }));

    books.push(...newBooks);
    return res.status(201).json({ message: 'Books added successfully', books: newBooks });

  } else {
    // Single book object
    if (!isValidBook(data)) {
      return res.status(400).json({ message: 'Title and Author are required' });
    }

    const newBook = {
      id: idCounter++,
      title: data.title,
      author: data.author
    };

    books.push(newBook);
    return res.status(201).json({ message: 'Book added successfully', book: newBook });
  }
});

// PUT (update) a book by ID
app.put('/books/:id', (req, res) => {
  const { title, author } = req.body;
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });

  if (title) book.title = title;
  if (author) book.author = author;

  res.json(book);
});

// DELETE a book by ID
app.delete('/books/:id', (req, res) => {
  const index = books.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Book not found' });

  const deletedBook = books.splice(index, 1);
  res.json(deletedBook[0]);
});

// DELETE multiple books by IDs
app.delete('/books', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: 'Please provide an array of IDs to delete.' });
  }

  let deleted = [];
  ids.forEach(id => {
    const index = books.findIndex(b => b.id === id);
    if (index !== -1) {
      deleted.push(books[index]);
      books.splice(index, 1);
    }
  });

  res.json({
    message: `${deleted.length} book(s) deleted.`,
    deletedBooks: deleted
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
