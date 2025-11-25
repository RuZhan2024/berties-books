// Create a new router
const express = require("express")
const router = express.Router()

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs', {isAuthenticated: res.locals.isAuthenticated})
});

// -----------------------------------------------------------------------------
// Logout route – destroy the session and log the user out
// -----------------------------------------------------------------------------

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect("/");
      }
      // Simple confirmation + link back to home
      res.send('you are now logged out. <a href="/">Home</a>');
    });
  });

router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

// Export the router object so index.js can access it
module.exports = router