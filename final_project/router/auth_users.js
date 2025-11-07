const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Load environment variables
require('dotenv').config();

let users = [];

// Secret key for JWT from environment variable
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_development";

// Check if username is valid (exists in the users array)
const isValid = (username) => {
  // Check if username exists in users array
  const userExists = users.some(user => user.username === username);
  return userExists;
}

// Check if username and password match the records
const authenticatedUser = (username, password) => {
  // Find user with matching username and password
  const user = users.find(user => 
    user.username === username && user.password === password
  );
  return user !== undefined;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user exists and credentials are correct
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { username: username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Store token in session
  req.session.authorization = {
    accessToken: token,
    username: username
  };

  return res.status(200).json({ 
    message: "Login successful",
    token: token 
  });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.session.authorization?.accessToken;

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Add or modify a book review (authenticated users only)
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user.username;

  // Check if review text is provided
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update the review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({ 
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

// Delete a book review (authenticated users only)
regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if reviews exist for this book
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({ 
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;