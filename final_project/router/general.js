const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


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