// Create a new router
const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router(); // Initialize the Express Router

const redirectLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    // If there's no logged-in user, redirect to the login page
    return res.redirect("../users/login");
  }
  // User is logged in, go to the next handler
  next();
};

// GET /search-result — simple GET-based search result display (legacy route)
router.get("/search-result", redirectLogin, function (req, res, next) {
  const rawKeyword = req.query.keyword || "";
  const cleaned = req.sanitize(rawKeyword); // protect from XSS in plain text response
  res.send("You searched for: " + cleaned);
});

// GET /list — Retrieve and display all books from the database
router.get("/list", redirectLogin, function (req, res, next) {
  let sqlquery = "SELECT * FROM books"; // SQL query to get all books

  // execute sql query
  db.query(sqlquery, (err, result) => {
    if (err) {
      // Pass the error to the Express error handler middleware
      next(err);
    }
    // Renders the list view (list.ejs), passing the query result as 'availableBooks'

    res.render("list.ejs", {
      pageTitle: "All Books",
      books: result,
      isBargain: false,
      threshold: null,
    });
  });
});

// GET /addbook — Render the form to add a new book
router.get("/addbook", redirectLogin, function (req, res, next) {
  res.render("addbook.ejs", { error: "" });
});

// POST /bookadded — Insert a new book into the database (Lab 8b extension)
// Adds validation + sanitisation for name and price
router.post(
  "/bookadded",
  [
    check("name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Book name is required."),
    check("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a number greater than or equal to 0."),
  ],
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Show the first validation error in the form
      const firstError = errors.array()[0].msg;
      return res.status(400).render("addbook.ejs", { error: firstError });
    }

    // Sanitise inputs to protect against XSS
    const name = req.sanitize(req.body.name);
    const price = parseFloat(req.body.price);

    // SQL query to insert a new row. Uses '?' as placeholders for safety (prepared statements)
    const sql = "INSERT INTO books (name, price) VALUES (?, ?)";

    // Execute the insert query
    db.query(sql, [name, price], (err) => {
      if (err) return next(err); // Handle database errors

      // Send a confirmation message upon successful insertion
      res.send(`
        This book is added to database, name: ${name} price ${price}
        <a href="/books/list">Back to book list</a>`);
    });
  }
);

// GET /bargainbooks — Retrieve and display books with price less than $20.00
router.get("/bargainbooks", redirectLogin, (req, res, next) => {
  // SQL query to select books where the price is less than 20.00, ordered by price
  const sql =
    "SELECT id, name, price FROM books WHERE price < 20.00 ORDER BY price ASC";

  // Execute the query
  db.query(sql, (err, result) => {
    if (err) return next(err); // Handle database errors

    // Render the 'bargainbooks' view, passing the result set
    res.render("list.ejs", {
      pageTitle: `Bargain Books (< £20)`,
      books: result,
      isBargain: true,
      threshold: 20,
    });
  });
});

// GET /search — Render the search form (with initial state)
router.get("/search", redirectLogin, (req, res) => {
  // Renders the search form, initializing results to null and mode to 'partial'
  res.render("search.ejs", { results: null, keyword: "", mode: "partial" });
});

// POST /search — Handle the submission of the search form and display results
router.post(
  "/search",
  redirectLogin,
  [
    check("keyword")
      .trim()
      .notEmpty()
      .withMessage("Please enter a search term."),
    check("mode")
      .optional()
      .isIn(["exact", "partial"])
      .withMessage("Invalid search mode."),
  ],
  (req, res, next) => {
    // Extract keyword and search mode from the request body
    const rawKeyword = req.body.keyword || "";
    const mode = req.body.mode || "partial";

    // Sanitise keyword to protect against XSS when echoed back in the view
    const trimmed = req.sanitize(rawKeyword.trim());

    // If no keyword is provided, re-render the search page with empty results
    if (!trimmed) {
      return res.render("search.ejs", {
        results: [],
        keyword: "",
        mode: "partial",
      });
    }

    let sql, params;

    // Determine the SQL query based on the selected search mode
    if (mode === "exact") {
      // Basic search: exact title match
      sql =
        "SELECT id, name, price FROM books WHERE name = ? ORDER BY name ASC";
      params = [trimmed]; // Parameter is the trimmed keyword
    } else {
      // Advanced search: partial match (case-insensitive search using LOWER() and LIKE)
      sql =
        "SELECT id, name, price FROM books WHERE LOWER(name) LIKE LOWER(?) ORDER BY name ASC";
      params = [`%${trimmed}%`]; // Parameter is the trimmed keyword wrapped in wildcards (%)
    }

    // Execute the dynamic search query
    db.query(sql, params, (err, rows) => {
      if (err) return next(err); // Handle database errors

      // Render the search view again, passing the results and the search criteria for context
      res.render("search", {
        results: rows,
        keyword: trimmed,
        mode: mode || "partial",
      });
    });
  }
);

// Export the router object so index.js (or the main application file) can access it
module.exports = router;
