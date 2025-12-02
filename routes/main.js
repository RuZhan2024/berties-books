// Create a new router
const express = require("express")
const router = express.Router()
const request = require("request");

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


router.get("/weather", (req, res, next) => {
  const city = (req.query.city || "London,uk").trim();

  // Ideally move this into .env as OPENWEATHER_API_KEY
  const apiKey = "b44940e5eda0e721e710cd08b3725ba0";

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`; // metric = Celsius

  request(url, (err, response, body) => {
    if (err) {
      return next(err);
    }

    let weather;
    try {
      weather = JSON.parse(body);
    } catch (parseErr) {
      return next(parseErr);
    }

    // Handle API errors (e.g. city not found)
    if (!weather || weather.cod !== 200) {
      const message =
        weather && weather.message
          ? `No data found for "${city}": ${weather.message}`
          : `No data found for "${city}".`;

      return res.render("weatherforecast.ejs", {
        result: null,
        error: message,
      });
    }

    // Build a nice result object from the API response
    const result = {
      city: weather.name,                        // "London"
      country: weather.sys && weather.sys.country, // "GB"
      temp: weather.main.temp,                  // current temp (°C)
      feelsLike: weather.main.feels_like,       // feels like (°C)
      tempMin: weather.main.temp_min,
      tempMax: weather.main.temp_max,
      humidity: weather.main.humidity,
      description:
        weather.weather && weather.weather[0]
          ? weather.weather[0].description      // e.g. "few clouds"
          : "",
      windSpeed: weather.wind && weather.wind.speed,
      windDeg: weather.wind && weather.wind.deg,
      raw: weather, // keep full data if you need extra fields in the view
    };

    res.render("weatherforecast.ejs", {
      result,
      error: null,
    });
  });
});


// Export the router object so index.js can access it
module.exports = router