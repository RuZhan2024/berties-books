const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

// -----------------------------------------------------------------------------
// Authorisation helper – only allow access if the user is logged in
// -----------------------------------------------------------------------------
const redirectLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    // If there's no logged-in user, redirect to the login page
    return res.redirect("./login");
  }
  // User is logged in, go to the next handler
  next();
};

// Number of salt rounds used by bcrypt when hashing passwords
const SALT_ROUNDS = 10;

/**
 * Helper: record every login attempt into login_audit.
 * Assumes a global `db` connection is available (as in books.js).
 */
function logLoginAttempt(email, wasSuccessful) {
  const sql = "INSERT INTO login_audit (email, was_successful) VALUES (?, ?)";
  db.query(sql, [email, wasSuccessful ? 1 : 0], (err) => {
    if (err) {
      console.error("Failed to insert login_audit row:", err);
    }
  });
}

// -----------------------------------------------------------------------------
// Registration
// -----------------------------------------------------------------------------

// GET /users/register — show registration form
router.get("/register", function (req, res, next) {
  // Pass a message; you can extend this later to show detailed errors if needed
  res.render("register.ejs", { msg: "" });
});

// POST /users/registered — handle registration form submission (Lab 8b)
// Validates: email, username length, password length
router.post(
  "/registered",
  [
    check("username")
      .trim()
      .isLength({ min: 5, max: 20 })
      .withMessage("Username must be between 5 and 20 characters."),
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email address."),
    check("first")
      .trim()
      .notEmpty()
      .isLength({ max: 20 })
      .withMessage("Firstname must be between 1 and 20 characters."),
      check("last")
      .trim()
      .notEmpty()
      .isLength({ max: 20 })
      .withMessage("Lastname must be between 1 and 20 characters."),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
    check("confirm_password")
      .custom((value, {req}) => {
        if (value !== req.body.password) {
          throw new Error("The passwords you entered do not match");
        }
        return true;
      })
  ],
  function (req, res, next) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      // If validation fails, re-render the register page
      return res.status(400).render("register.ejs", {
        msg: result.errors[0].msg,
      });
    }

    // Sanitise user input to protect against XSS (Lab 8b – Tasks 6–7)
    const username = req.sanitize(req.body.username);
    const first = req.sanitize(req.body.first);
    const last = req.sanitize(req.body.last);
    const email = req.sanitize(req.body.email);
    const password = req.body.password;

    const selectQuery = "SELECT username FROM users WHERE username = ?";

    // Check if an account with this email already exists
    db.query(selectQuery, [username], (err, rows) => {
      if (err) return next(err); // Pass DB errors to Express error handler

      if (rows.length > 0) {
        // Do not create a second account with the same email
        return res.render("register.ejs", {
          msg: "An account with this username already exists. Please log in or use a different username.",
        });
      }

      // Email is free — hash the password before saving it
      bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) return next(err);
        const insertQuery =
          "INSERT INTO users (username,first_name, last_name, email, hashed_password) VALUES (?, ?, ?, ?, ?)";

        // Store the new user in the database
        db.query(
          insertQuery,
          [username, first, last, email, hashedPassword],
          (err) => {
            if (err) return next(err);

            // Registration succeeded, send user to the login page
            return res.redirect("./login");
          }
        );
      });
    });
  }
);

// -----------------------------------------------------------------------------
// Login
// -----------------------------------------------------------------------------

// GET /users/login — show login form
router.get("/login", function (req, res, next) {
  // `msg` is used to display errors (e.g. wrong password) in the template
  res.render("login.ejs", { msg: "" });
});

// POST /users/login — handle login
router.post("/login",[
  check("username")
    .notEmpty()
    .isLength({min: 2, max: 20}) // min is not 5 because I need to match the length default username "gold"
    .withMessage("Please enter a valid email address"),
  check("password")
    .notEmpty()
    .isLength({min: 6, max: 20}) // Because the length of the password "smiths" is only 6.
    .withMessage("Please enter your password.")
], function (req, res, next) {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("login.ejs", {
        msg: errors.array()[0].msg,
      });
    }
  // Sanitise email; password is not rendered back to the page so no need
  const username = req.sanitize(req.body.username);
  const password = req.body.password;

  // Make sure both fields are provided
  if (!username || !password) {
    return res.render("login.ejs", {
      msg: "Please enter both your username and password.",
    });
  }

  const query = "SELECT id, username, email, hashed_password, first_name, last_name FROM users WHERE username = ?";

  // Look up the user by email
  db.query(query, [username], function (err, rows) {
    if (err) return next(err);

    if (rows.length === 0) {
      // No such email — log failed attempt and show generic message
      logLoginAttempt(username, false);
      return res.render("login.ejs", {
        msg: "Incorrect username or password. Please try again.",
      });
    }

    const user = rows[0];
    // Compare the provided password with the stored hash
    bcrypt.compare(password, user.hashed_password, function (err, isMatch) {
      if (err) return next(err);

      if (!isMatch) {
        // Password mismatch — log failed attempt and show generic message
        logLoginAttempt(username, false);
        return res.render("login.ejs", {
          msg: "Incorrect username or password. Please try again.",
        });
      }
      // At this point, the user is authenticated.
      // Save user session here, when login is successful
      req.session.userId = user.id; // or user.email if you prefer
      req.session.user = user.username;   // store login “username”
      logLoginAttempt(username, true);
      
      // After login, show the home page (or redirect somewhere else)
      return res.redirect("../");
    });
  });
});

// -----------------------------------------------------------------------------
// User list (for admin / testing) – protected by redirectLogin
// -----------------------------------------------------------------------------

// GET /users/userlist — list all users (logged-in users only)
router.get("/userlist", redirectLogin, function (req, res, next) {
  const sqlquery = "SELECT id, username, first_name, last_name, email FROM users";

  // Fetch all users from the database
  db.query(sqlquery, (err, rows) => {
    if (err) {
      return next(err);
    }
    // Render the userList view and pass the users array
    res.render("userList.ejs", { users: rows });
  });
});

// -----------------------------------------------------------------------------
// Login audit page – also protected
// -----------------------------------------------------------------------------

// GET /users/audit — show login audit entries (logged-in users only)
router.get("/audit", redirectLogin, function (req, res, next) {
  const sql =
    "SELECT id, email, was_successful, created_at FROM login_audit ORDER BY created_at DESC";

  db.query(sql, (err, rows) => {
    if (err) return next(err);

    // `entries` will be an array of audit rows
    res.render("audit.ejs", { entries: rows });
  });
});



// Export the router to be used in app.js / index.js
module.exports = router;
