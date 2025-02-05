const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Middleware to parse JSON bodies
public_users.use(express.json());

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

const getAllBooks = () => {
  return books;
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  } else if (doesExist(username)) {
    return res.status(400).json({ message: "User already exists." });
  } else {
    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User successfully registered. Please login." });
  }
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).json(allBooks);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const targetISBN = req.params.isbn; // Changed from parseInt to direct access
  const targetBook = books[targetISBN];
  
  if (!targetBook) {
    return res.status(404).json({ message: "ISBN not found." });
  } else {
    return res.status(200).json(targetBook);
  }
});

// Route to handle GET requests to /books for multiple ISBNs
public_users.get("/books", async (req, res) => {
  const { isbn } = req.query;

  if (!isbn) {
    return res.status(400).json({ error: 'ISBN is required' });
  }

  // Handle multiple ISBNs
  const requestedBooks = Array.isArray(isbn) ? isbn : [isbn];
  const foundBooks = requestedBooks.map(id => books[id]).filter(Boolean);

  if (foundBooks.length === 0) {
    return res.status(404).json({ error: 'No books found for the given ISBN(s)' });
  }

  res.json(foundBooks);
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const matchingBooks = Object.values(await getAllBooks()).filter(
    (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
  );

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books by that author." });
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  const matchingTitle = Object.values(await getAllBooks()).filter(
    (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
  )[0];

  if (matchingTitle) {
    return res.status(200).json(matchingTitle);
  } else {
    return res.status(404).json({ message: "Title not found." });
  }
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const targetISBN = req.params.isbn;
  const targetBook = books[targetISBN];

  if (targetBook && targetBook.reviews) {
    return res.status(200).json(targetBook.reviews);
  } else {
    return res.status(404).json({ message: "ISBN not found." });
  }
});

module.exports.general = public_users;


