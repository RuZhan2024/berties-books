// Create a new router
const express = require("express")
const router = express.Router()

router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

router.get('/search-result', function (req, res, next) {
    //searching in the database
    res.send("You searched for: " + req.query.keyword)
});

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render('list.ejs', {availableBooks:result})
     });
});

router.get("/addBook", function(req,res,next) {
    res.render("addBook.ejs");
});

router.post('/bookadded', (req, res, next) => {
  const db = req.app.locals.db;
  const { name, price } = req.body;

  if (!name || !price) {
    return res.render('addbook', { error: 'Name and price are required.' });
  }
  const sql = 'INSERT INTO books (name, price) VALUES (?, ?)';
  db.query(sql, [name.trim(), parseFloat(price)], (err) => {
    if (err) return next(err);
    
    res.send(`This book is added to database, name: ${name} price ${price}`);
  });
});

router.get('/bargainbooks', (req, res, next) => {
  const db = req.app.locals.db;
  const sql = 'SELECT id, name, price FROM books WHERE price < 20.00 ORDER BY price ASC';
  db.query(sql, (err, rows) => {
    if (err) return next(err);
    res.render('bargainbooks', { books: rows });
  });
});

router.get('/search', (req, res) => {
  res.render('search', { results: null, keyword: '', mode: 'partial' });
});

router.post('/search', (req, res, next) => {
  const db = req.app.locals.db;
  const { keyword, mode } = req.body;
  if (!keyword) {
    return res.render('search', { results: [], keyword: '', mode: 'partial' });
  }

  const trimmed = keyword.trim();
  let sql, params;

  if (mode === 'exact') {
    // Basic search: exact title match
    sql = 'SELECT id, name, price FROM books WHERE name = ? ORDER BY name ASC';
    params = [trimmed];
  } else {
    // Advanced search: partial match (case-insensitive with LOWER)
    sql = 'SELECT id, name, price FROM books WHERE LOWER(name) LIKE LOWER(?) ORDER BY name ASC';
    params = [`%${trimmed}%`];
  }

  db.query(sql, params, (err, rows) => {
    if (err) return next(err);
    res.render('search', { results: rows, keyword: trimmed, mode: mode || 'partial' });
  });
});

// Export the router object so index.js can access it
module.exports = router
