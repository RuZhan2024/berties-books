// Create a new router
const express = require("express")
const router = express.Router()

const bcrypt = require("bcrypt")


router.get('/register', function (req, res, next) {
    
    res.render('register.ejs', {msg: ""})
})

router.post('/registered', function (req, res, next) {
    const saltRound = 10
    const {first, last, email, password, confirm_password} = req.body;
    if (!(first&&last&&email&&password)) 
    return res.render("register.ejs", {msg: "All items required!"})
    if (password !== confirm_password) 
    return res.render("register.ejs", {msg: "Confirmed password and the password is not match!"})
    const query = `SELECT email FROM users WHERE email = (?)`
    db.query(query, [email], (err, result) => {
        if (err) return next(err)
        if (!!result.length) return res.render('register.ejs', {msg: "The email already registered!"})
    })
    bcrypt.hash(password, saltRound, (err,hashedPassword) => {
        if (err) return next(err);
        const query = `INSERT INTO users (first_name, last_name, email, hashed_password) VALUES(?,?,?,?)`
        db.query(query, [first, last, email, hashedPassword], (err, result) => {
            if (err) return next(err);
            return res.render("index.ejs")
        })
    })
});

// GET /list — Retrieve and display all books from the database
router.get('/userlist', function(req, res, next) {
    let sqlquery = "SELECT * FROM users"; // SQL query to get all books
    
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            // Pass the error to the Express error handler middleware
            next(err) 
        }
        // Renders the list view (list.ejs), passing the query result as 'availableBooks'
        res.render('userList.ejs', {users:result})
     });
});

// Export the router object so index.js can access it
module.exports = router
