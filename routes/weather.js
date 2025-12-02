const request = require("request");
const express = require("express");
const router = express.Router();

const result = { "coord": { "lon": -0.1257, "lat": 51.5085 }, "weather": [{ "id": 801, "main": "Clouds", "description": "few clouds", "icon": "02d" }], "base": "stations", "main": { "temp": 282.77, "feels_like": 280.88, "temp_min": 281.76, "temp_max": 283.78, "pressure": 1004, "humidity": 83, "sea_level": 1004, "grnd_level": 1000 }, "visibility": 10000, "wind": { "speed": 3.6, "deg": 180 }, "clouds": { "all": 24 }, "dt": 1764689635, "sys": { "type": 2, "id": 2075535, "country": "GB", "sunrise": 1764661531, "sunset": 1764690886 }, "timezone": 0, "id": 2643743, "name": "London", "cod": 200 }

router.get("/weather", (req, res) => {

    const city = req.query.city || "London,uk";
    const key = "b44940e5eda0e721e710cd08b3725ba0";
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${key}`;
    request(api, (err, response, body) => {

        if (err) {
            nexrt(err)
        } else {
            const weather = JSON.parse(body);
            let wmsg = ""
            if (weather !== undefined && weather.main !== undefined) {
                wmsg = '<p>It is ' + weather.main.temp +
                    ' degrees in ' + weather.name +
                    '! </p> <p>The humidity now is: ' +
                    weather.main.humidity + '</p>';
            } else {
                wmsg = `<p>Haven't searched the weather forecast of ${city}</p>`;
            }
            res.render("weatherforecast.ejs", { result: wmsg });
        }
    })

});


module.exports = router;
