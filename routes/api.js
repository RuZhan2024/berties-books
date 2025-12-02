
const express = require("express");
const router = express.Router();

const result = { "coord": { "lon": -0.1257, "lat": 51.5085 }, "weather": [{ "id": 801, "main": "Clouds", "description": "few clouds", "icon": "02d" }], "base": "stations", "main": { "temp": 282.77, "feels_like": 280.88, "temp_min": 281.76, "temp_max": 283.78, "pressure": 1004, "humidity": 83, "sea_level": 1004, "grnd_level": 1000 }, "visibility": 10000, "wind": { "speed": 3.6, "deg": 180 }, "clouds": { "all": 24 }, "dt": 1764689635, "sys": { "type": 2, "id": 2075535, "country": "GB", "sunrise": 1764661531, "sunset": 1764690886 }, "timezone": 0, "id": 2643743, "name": "London", "cod": 200 }

router.get('/books', function (req, res, next) {

    // Extract keyword and search mode from the request body
    const rawKeyword = req.query.search || "";
    const sort = req.sanitize(req.query.sort) || "name";
    // Sanitise keyword to protect against XSS when echoed back in the view
    const trimmed = req.sanitize(rawKeyword.trim());

    let sql, params;

    // Advanced search: partial match (case-insensitive search using LOWER() and LIKE)
    sql =
        "SELECT id, name, price FROM books WHERE LOWER(name) LIKE LOWER(?) ORDER BY (?) ASC";
    params = [`%${trimmed}%`, sortby]; // Parameter is the trimmed keyword wrapped in wildcards (%)

    // Execute the dynamic search query
    db.query(sql, params, (err, rows) => {
        if (err) return next(err); // Handle database errors

        // Render the search view again, passing the results and the search criteria for context
        res.json({
            results: rows,
        });
    });
})



module.exports = router;
