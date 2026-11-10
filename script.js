
const cityInput = document.getElementById("cityInput");
const searchForm = document.getElementById("searchForm");

const cityElement = document.getElementById("city");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const dateElement = document.getElementById("date");
const forecast = document.getElementById("forecast");
const message = document.getElementById("message");

const weatherTypes = {
    0: ["Clear Sky", "☀️"],
    1: ["Mainly Clear", "🌤️"],
    2: ["Partly Cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Foggy", "🌫️"],
    51: ["Light Drizzle", "🌦️"],
    53: ["Drizzle", "🌧️"],
    55: ["Heavy Drizzle", "🌧️"],
    61: ["Light Rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy Rain", "🌧️"],
    71: ["Light Snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy Snow", "❄️"],
    80: ["Rain Showers", "🌦️"],
    81: ["Rain Showers", "🌧️"],
    82: ["Heavy Showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm", "⛈️"],
    99: ["Heavy Thunderstorm", "⛈️"]
};

function getWeather(code) {
    return weatherTypes[code] || ["Unknown", "🌡️"];
}

function formatDate(date) {
    return new Date(date + "T12:00:00").toLocaleDateString(
        "en-US",
        { weekday: "short", day: "numeric", month: "short" }
    );
}

async function getWeatherData(cityName) {
    try {
        message.textContent = "Searching...";
        forecast.innerHTML = "Loading...";

        // Step 1: Search city
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);
        if (!geoResponse.ok) throw new Error("City search failed");

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Try another city.");
        }

        const city = geoData.results[0];
        const { latitude, longitude } = city;

        // Step 2: Get weather
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=5`;

        const weatherResponse = await fetch(weatherURL);
        if (!weatherResponse.ok) throw new Error("Weather loading failed");

        const data = await weatherResponse.json();

        // Current weather
        const current = data.current;
        const weather = getWeather(current.weather_code);

        cityElement.textContent = city.name;
        temperature.textContent =
            `${Math.round(current.temperature_2m)}°C`;

        condition.textContent = weather[0];
        weatherIcon.textContent = weather[1];

        humidity.textContent =
            `${current.relative_humidity_2m}%`;

        wind.textContent =
            `${current.wind_speed_10m} km/h`;

        dateElement.textContent = formatDate(current.time.slice(0, 10));

        // 4-day forecast
        forecast.innerHTML = "";

        for (let i = 1; i <= 4; i++) {
            const dayWeather = getWeather(data.daily.weather_code[i]);

            const card = document.createElement("div");
            card.className = "forecast-item";

            const day = document.createElement("small");
            day.textContent = formatDate(data.daily.time[i]);

            const icon = document.createElement("span");
            icon.className = "icon";
            icon.textContent = dayWeather[1];

            const temp = document.createElement("h4");
            temp.textContent =
                `${Math.round(data.daily.temperature_2m_max[i])}°C`;

            card.append(day, icon, temp);
            forecast.appendChild(card);
        }

        message.textContent = "";

    } catch (error) {
        message.textContent = error.message;
        forecast.innerHTML = "";
    }
}

// Search city
searchForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const city = cityInput.value.trim();

    if (city) {
        getWeatherData(city);
    }
});

// Default city
getWeatherData("Karachi");
