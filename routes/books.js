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

router.get("/addbook", function(req,res,next) {
    res.render("addbook.ejs");
});

// POST /books/bookadded — insert then confirm (Lab 6D Task 3)
router.post('/bookadded', (req, res, next) => {
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

// Export the router object so index.js can access it
module.exports = router
