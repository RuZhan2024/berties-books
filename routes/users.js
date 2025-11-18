const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// Number of salt rounds used by bcrypt when hashing passwords
const SALT_ROUNDS = 10;

// Show registration form
router.get("/register", function (req, res, next) {
  // Pass an empty message the first time the form is shown
  res.render("register.ejs", { msg: "" });
});

// Handle registration
router.post("/registered", function (req, res, next) {
  const { first, last, email, password, confirm_password } = req.body;

  // Basic input validation: make sure all fields are filled in
  if (!first || !last || !email || !password || !confirm_password) {
    return res.render("register.ejs", {
      msg: "Please complete all fields before submitting.",
    });
  }

  // Check that the two password fields match
  if (password !== confirm_password) {
    return res.render("register.ejs", {
      msg: "The passwords you entered do not match. Please try again.",
    });
  }

  const selectQuery = "SELECT email FROM users WHERE email = ?";

  // Check if an account with this email already exists
  db.query(selectQuery, [email], (err, rows) => {
    if (err) return next(err); // Pass DB errors to Express error handler

    if (rows.length > 0) {
      // Do not create a second account with the same email
      return res.render("register.ejs", {
        msg: "An account with this email already exists. Please log in or use a different email.",
      });
    }

    // Email is free — hash the password before saving it
    bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
      if (err) return next(err);

      const insertQuery =
        "INSERT INTO users (first_name, last_name, email, hashed_password) VALUES (?, ?, ?, ?)";

      // Store the new user in the database
      db.query(
        insertQuery,
        [first, last, email, hashedPassword],
        (err, insertResult) => {
          if (err) return next(err);

          // Registration succeeded, send user to the login page
          return res.redirect("/users/login");
        }
      );
    });
  });
});

// Show login form
router.get("/login", function (req, res, next) {
  // `msg` is used to display errors (e.g. wrong password) in the template
  res.render("login.ejs", { msg: "" });
});

// Handle login
router.post("/login", function (req, res, next) {
  const { email, password } = req.body;

  // Make sure both fields are provided
  if (!email || !password) {
    return res.render("login.ejs", {
      msg: "Please enter both your email and password.",
    });
  }

  const query = "SELECT id, email, hashed_password FROM users WHERE email = ?";

  // Look up the user by email
  db.query(query, [email], function (err, rows) {
    if (err) return next(err);

    if (rows.length === 0) {
      // Do not reveal whether the email exists — generic message is safer
      return res.render("login.ejs", {
        msg: "Incorrect email or password. Please try again.",
      });
    }

    const user = rows[0];

    // Compare the provided password with the stored hash
    bcrypt.compare(password, user.hashed_password, function (err, isMatch) {
      if (err) return next(err);

      if (!isMatch) {
        // Password mismatch — again, use a generic message
        return res.render("login.ejs", {
          msg: "Incorrect email or password. Please try again.",
        });
      }

      // At this point, the user is authenticated.
      // Store user info in the session later:
      // req.session.userId = user.id;
      res.redirect("/");
    });
  });
});

// List all users (for admin/testing purposes)
router.get("/userlist", function (req, res, next) {
  const sqlquery = "SELECT id, first_name, last_name, email FROM users";

  // Fetch all users from the database
  db.query(sqlquery, (err, rows) => {
    if (err) {
      return next(err);
    }

    // Render the userList view and pass the users array
    res.render("userList.ejs", { users: rows });
  });
});

// Export the router to be used in app.js / index.js
module.exports = router;
