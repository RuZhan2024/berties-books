// Import express and ejs
var express = require('express')
var ejs = require('ejs')
const path = require('path')
const mysql = require('mysql2')
const session = require('express-session')
const expressSanitizer = require('express-sanitizer')
require('dotenv').config()

// Create the express application object
const app = express()
const port = 8000

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

// Create an input sanitizer (Lab 8b – Task 6)
app.use(expressSanitizer())

// Create a session
app.use(session({
  secret: 'somerandomstuff',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000 // session cookie expiry in ms (10 minutes)
  }
}))

app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.userId;     // true/false
  res.locals.currentUser = req.session.user;   // email or undefined
  next();
});

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')))

// Define the database connection pool
const db = mysql.createPool({
  host: process.env.BB_HOST || 'localhost',
  user: process.env.BB_USER,
  password: process.env.BB_PASSWORD,
  database: process.env.BB_DATABASE,
  port: process.env.BB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})
global.db = db

// Define our application-specific data
app.locals.shopData = { shopName: "Bertie's Books" }

// Load the route handlers
const mainRoutes = require('./routes/main')
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)


// Load the route handlers for /books
const booksRoutes = require('./routes/books')
app.use('/books',booksRoutes)

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
