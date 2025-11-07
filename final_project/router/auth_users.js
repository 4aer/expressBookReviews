const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    req.session.username = username;
    return res.status(200).json({ message: "Login successful!" });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.username; // get logged-in user from session
  const isbn = req.params.isbn;
  const review = req.query.review; // review comes from query parameter

  if (!username) {
    return res.status(401).json({ message: "You must be logged in to post a review." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Add or update review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully!",
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.username; // get logged-in user from session
  const isbn = req.params.isbn;

  if (!username) {
    return res.status(401).json({ message: "You must be logged in to delete a review." });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!book.reviews[username]) {
    return res.status(404).json({ message: "You have not posted a review for this book." });
  }

  // Delete the user's review
  delete book.reviews[username];

  return res.status(200).json({
    message: "Your review has been deleted successfully.",
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
