const express = require('express');
// Load env for PORT
require('dotenv').config();
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;


// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register the new user
  users.push({ username: username, password: password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Display books in a neat JSON format
  return res.status(200).json(JSON.stringify(books, null, 2));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  // Check if book exists
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const bookKeys = Object.keys(books);
  const booksByAuthor = [];

  // Iterate through books and find matching authors
  for (let key of bookKeys) {
    if (books[key].author === author) {
      booksByAuthor.push(books[key]);
    }
  }

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const bookKeys = Object.keys(books);
  const booksByTitle = [];

  // Iterate through books and find matching titles
  for (let key of bookKeys) {
    if (books[key].title === title) {
      booksByTitle.push(books[key]);
    }
  }

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Check if book exists and has reviews
  if (books[isbn]) {
    if (books[isbn].reviews) {
      return res.status(200).json(books[isbn].reviews);
    } else {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;

// --- Axios-based example routes (Tasks 10-13) ---
// These call the existing public endpoints via HTTP using Axios
// Task 10: Get book list using Promise callbacks
public_users.get('/axios/books', (req, res) => {
  axios.get(`${BASE_URL}/`)
    .then(response => {
      // response.data may already be JSON or a string depending on the original handler
      return res.status(response.status).json({ data: response.data });
    })
    .catch(error => {
      const status = error.response ? error.response.status : 500;
      return res.status(status).json({ message: 'Failed to fetch book list', error: error.message });
    });
});

// Task 11: Get book details by ISBN using async/await
public_users.get('/axios/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: 'Failed to fetch book by ISBN', error: error.message });
  }
});

// Task 12: Get book details by author using Promise callbacks
public_users.get('/axios/author/:author', (req, res) => {
  const author = req.params.author;
  axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`)
    .then(response => res.status(response.status).json(response.data))
    .catch(error => {
      const status = error.response ? error.response.status : 500;
      return res.status(status).json({ message: 'Failed to fetch books by author', error: error.message });
    });
});

// Task 13: Get book details by title using async/await
public_users.get('/axios/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: 'Failed to fetch books by title', error: error.message });
  }
});