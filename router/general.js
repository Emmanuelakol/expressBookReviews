const express = require('express');
let books = require("./booksdb.js"); // Assuming this exports an array of book objects
let isValid = require("./auth_users.js").isValid; // Assuming this is a function for user validation
let users = require("./auth_users.js").users; // Assuming this is an array to store user data
const public_users = express.Router();

// User Registration
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  const existingUser = users.find(user => user.username === username);
  
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Register new user
  users.push({ username, password }); // Store user data securely in practice
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.json(JSON.stringify(books)); // Displaying books using JSON.stringify
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books.find(b => b.isbn === isbn); // Assuming books is an array of book objects

  if (book) {
    res.json(JSON.stringify(book));
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = books.filter(b => b.author === author); // Filter books by author

  if (booksByAuthor.length > 0) {
    res.json(JSON.stringify(booksByAuthor));
  } else {
    res.status(404).json({ message: 'No books found by this author' });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = books.filter(b => b.title === title); // Filter books by title

  if (booksByTitle.length > 0) {
    res.json(JSON.stringify(booksByTitle));
  } else {
    res.status(404).json({ message: 'No books found with this title' });
  }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books.find(b => b.isbn === isbn); // Find the book by ISBN

  if (book && book.reviews) { // Assuming reviews is an array in each book object
    res.json(JSON.stringify(book.reviews));
  } else {
    res.status(404).json({ message: 'No reviews found for this book' });
  }
});

module.exports.general = public_users;
