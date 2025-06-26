const apiKey = '8ba1a049ab2dcdd1ce5a271d9f2ee778';

const searchBox = document.getElementById('city-input');
const weatherInfo = document.querySelector('.weather-info');
const forecastHours = document.querySelector('.forecast-hours');
const weeklyDays = document.querySelector('.weekly-days');
const realFeelEl = document.getElementById('real-feel');
const windEl = document.getElementById('wind');
const pressureEl = document.getElementById('pressure');
const uvIndexEl = document.getElementById('uv-index');
const tempIconEl = weatherInfo.querySelector('.temp-icon');
const weatherDescriptionEl = weatherInfo.querySelector('.weather-description');
const locationNameEl = weatherInfo.querySelector('h1');
const temperatureEl = weatherInfo.querySelector('h2');
const seeMoreBtn = document.getElementById('see-more');
const recentSearchContainer = document.getElementById('recent-searches');
const mapImage = document.getElementById('map-image');

const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
async function getWeatherData(city) {
  try {
    const res = await fetch(`http://api.weatherstack.com/current?access_key=${apiKey}&query=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (!data || !data.current) throw new Error('Weather not found');

    updateWeatherUI(data);
    updateMap(data.location.lat, data.location.lon);
    saveRecentSearch(city);
  } catch (err) {
    alert(err.message);
  }
}

function updateWeatherUI(data) {
  const { current, location } = data;

  locationNameEl.textContent = location.name;
  temperatureEl.textContent = `${current.temperature}°`;
  weatherDescriptionEl.textContent = current.weather_descriptions[0];
  tempIconEl.textContent = getWeatherEmoji(current.weather_descriptions[0]);

  realFeelEl.textContent = `Real Feel: ${current.feelslike}°`;
  windEl.textContent = `Wind: ${current.wind_speed} km/h`;
  pressureEl.textContent = `Pressure: ${current.pressure} mb`;
  uvIndexEl.textContent = `UV Index: ${current.uv_index || 'N/A'}`;

  forecastHours.innerHTML = `<div class="hour">${current.observation_time}<br>${getWeatherEmoji(current.weather_descriptions[0])} ${current.temperature}°</div>`;
  weeklyDays.innerHTML = `<div class="day"><span>Today</span><span>${getWeatherEmoji(current.weather_descriptions[0])} ${current.weather_descriptions[0]} ${current.temperature}°</span></div>`;
}

function getWeatherEmoji(desc) {
  const d = desc.toLowerCase();
  if (d.includes('sun')) return '☀️';
  if (d.includes('cloud')) return '☁️';
  if (d.includes('rain')) return '🌧️';
  if (d.includes('snow')) return '❄️';
  if (d.includes('storm')) return '🌩️';
  return '🌡️';
}

function updateMap(lat, lon) {
  mapImage.src = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${lon},${lat}&z=10&size=650,400&l=map&pt=${lon},${lat},pm2rdm`;
}

searchBox.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const city = searchBox.value.trim();
    if (city) getWeatherData(city);
  }
});

function saveRecentSearch(city) {
  let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  history = [city, ...history.filter(c => c !== city)].slice(0, 5);
  localStorage.setItem('searchHistory', JSON.stringify(history));
  renderRecentSearches();
}

function renderRecentSearches() {
  const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  recentSearchContainer.innerHTML = history.map(city => `<button class="sidebar-item">${city}</button>`).join('');
  recentSearchContainer.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => getWeatherData(btn.textContent));
  });
}

renderRecentSearches();

function loadTheme() {
  const saved = localStorage.getItem('theme');
  const light = saved === 'light' || (!saved && window.matchMedia('(prefers-color-scheme: light)').matches);
  body.classList.toggle('light-theme', light);
  themeToggleBtn.innerHTML = light ? '<i class="fas fa-sun"></i><span>Light</span>' : '<i class="fas fa-moon"></i><span>Dark</span>';
}

themeToggleBtn.addEventListener('click', () => {
  const isLight = body.classList.toggle('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  loadTheme();
});

loadTheme();

const modal = document.getElementById('details-modal');
document.getElementById('close-modal').addEventListener('click', () => modal.close());
seeMoreBtn.addEventListener('click', () => modal.showModal());

document.querySelectorAll('.sidebar-item[data-view]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    const view = item.dataset.view;
    document.getElementById('map-section').style.display = view === 'map' ? 'block' : 'none';
  });
});

getWeatherData('Greater Noida');
