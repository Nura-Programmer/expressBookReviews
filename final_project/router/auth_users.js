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
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
