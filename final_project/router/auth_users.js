const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.find((u) => u.username === username && u.password === password) ? true : false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

    // Validate if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the user exists and the password matches
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

    // Save the accessToken and username in the session
    req.session.authorization  = {
        accessToken, username
    }

    res.status(200).json({ message: "Login successful" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the route parameters
    const review = req.query.review; // Get the review from the query parameters
    const username = req.user.username; // Get the logged-in username from the session (assumes authentication middleware added `req.user`)

    // Validate inputs
    if (!isbn || !review) {
        return res.status(400).json({ message: "ISBN and review are required" });
    }

    // Check if the book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or modify the review
    if (!book.reviews) {
        book.reviews = {};
    }
    book.reviews[username] = review;

    res.status(200).json({
        message: "Review added/updated successfully",
        reviews: book.reviews,
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the route parameters
    const username = req.user.username; // Get the logged-in username from the session (assumes authentication middleware added `req.user`)

    // Check if the book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the review exists for the user
    if (book.reviews && book.reviews[username]) {
        delete book.reviews[username]; // Delete the user's review
        return res.status(200).json({
            message: "Review deleted successfully",
            reviews: book.reviews, // Return the updated reviews
        });
    } else {
        return res.status(404).json({ message: "No review found for the user to delete" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
