const API_KEY = "3e3dccbf0700d2091cefaf3fa3061534";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const weatherDataContainer = document.getElementById("weather-data");

const weatherColors = {
  Clear: "#f7d08a",
  Clouds: "#d1d8e0",
  Rain: "#778ca3",
  Snow: "#ffffff",
  Thunderstorm: "#4b4b4b",
  Drizzle: "#a5b1c2",
};

async function fetchWeather(cityOrCoords) {
  let url;
  if (typeof cityOrCoords === "string") {
    url = `${BASE_URL}/weather?q=${cityOrCoords}&appid=${API_KEY}&units=metric&lang=tr`;
  } else {
    url = `${BASE_URL}/weather?lat=${cityOrCoords.lat}&lon=${cityOrCoords.lon}&appid=${API_KEY}&units=metric&lang=tr`;
  }

  try {
    weatherDataContainer.innerHTML = "<p>Yükleniyor...</p>";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Şehir bulunamadı.");
    const data = await res.json();
    renderWeather(data);
    fetchForecast(data.name);
  } catch (err) {
    weatherDataContainer.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

async function fetchForecast(city) {
  const url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=tr`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    renderForecast(data.list);
  } catch (err) {
    console.error("Tahmin alınamadı");
  }
}

function renderWeather(data) {
  document.body.style.backgroundColor =
    weatherColors[data.weather[0].main] || "#f0f2f5";

  weatherDataContainer.innerHTML = `
        <h2>${data.name}</h2>
        <div class="temp">${Math.round(data.main.temp)}°C</div>
        <p class="description">${data.weather[0].description}</p>
        <div class="details-grid">
            <div class="detail-item"><small>Nem</small><br><strong>%${data.main.humidity}</strong></div>
            <div class="detail-item"><small>Rüzgar</small><br><strong>${data.wind.speed} m/s</strong></div>
        </div>
        <div id="forecast-section"></div>
    `;
}

function renderForecast(list) {
  const forecastSection = document.getElementById("forecast-section");
  let html = `<h3>5 Günlük Tahmin</h3><div class="forecast-grid">`;

  for (let i = 7; i < list.length; i += 8) {
    const day = list[i];
    const date = new Date(day.dt * 1000).toLocaleDateString("tr-TR", {
      weekday: "short",
    });
    html += `
            <div class="forecast-item">
                <div>${date}</div>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <div>${Math.round(day.main.temp)}°C</div>
            </div>
        `;
  }
  html += `</div>`;
  forecastSection.innerHTML = html;
}

window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => console.log("Konum izni reddedildi.")
    );
  }
};

searchButton.addEventListener("click", () =>
  fetchWeather(cityInput.value.trim())
);
cityInput.addEventListener(
  "keypress",
  (e) => e.key === "Enter" && fetchWeather(cityInput.value.trim())
);
