const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add the new user to the users array
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
   // Get the list of all books
   // Simulate an Axios-like promise with local data
   new Promise((resolve, reject) => {
       if (books) {
           resolve(books); // Resolve the books object
        } else {
            reject(new Error("Books data not found")); // Reject if books are unavailable
        }
    })
    .then((books) => {
        const booksList = JSON.stringify(books, null, 4); // Neatly format the JSON output with 4 spaces indentation
        return res.status(200).send(booksList); // Send the books as the response
    })
    .catch((error) => {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Retrieve ISBN from request parameters
   const isbn = req.params.isbn;

   // Simulate a promise to fetch book details based on ISBN
   new Promise((resolve, reject) => {
       // Check if the book with the given ISBN exists
       const book = books[isbn];

       if (book) {
           resolve(book); // Resolve with book details if found
       } else {
           reject(new Error("Book not found")); // Reject if book does not exist
       }
   })
   .then((book) => {
        if (book) {
            return res.status(200).json(book); // Send the book details as a JSON response 
        } else {
            return res.status(404).json({ message: "Book not found" }); // Send an error if the book does not exist
        } 
    })
    .catch((error) => {
        res.status(404).json({ message: error.message }); // Send error if book not found
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Retrieve the author from the request parameters
  const author = req.params.author.toLowerCase().trim();
  // Simulate a promise to fetch book details based on the author
  new Promise((resolve, reject) => {
        // Filter books based on the matching author
        const matchingBooks = Object.values(books).filter(
            (book) => book.author.toLowerCase() === author
        );
        if (matchingBooks.length > 0) resolve(matchingBooks); // Resolve with the list of matching books
        else reject(new Error("No books found for the given author")); // Reject if no books are found
    })
    .then((matchingBooks) => {
        if (matchingBooks.length > 0) return res.status(200).json(matchingBooks); // Send the list of books by the author
        else return res.status(404).json({ message: "No books found for the given author" }); // If no books are found
    })
    .catch((error) => {
        res.status(404).json({ message: error.message }); // Send error if no books are found
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    // Retrieve the title from the request parameters
    const title = req.params.title.toLowerCase().trim();

    // Filter books based on the matching title
    const matchingBooks = Object.values(books).filter(
        (book) => book.title.toLowerCase() === title
    );
  
    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks); // Send the book details matching the title
    } else {
        return res.status(404).json({ message: "No books found for the given title" }); // If no books are found
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book with the given ISBN exists
  const book = books[isbn];

  if (book) {
      return res.status(200).json(book.reviews); // Send the reviews of the book as the response
  } else {
      return res.status(404).json({ message: "Book not found" }); // If the book does not exist
  }
});

module.exports.general = public_users;
