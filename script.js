import config from './config.js';

const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const API_KEY = config.API_KEY; 
const content = $('#container');
const loader = $('#loader');
// let map = null;
let city_name = '';
let city_temp = 0;
let long = '';
let lat = '';
// var popup = L.popup();
let temp;
let darkMode = false;
const themeSwitcher = $('#switch');

const mapObj = document.querySelector('#map');






// HTML for the main weather card
const createWeatherCard = (cityName, weatherItem, index) => {
    city_name = cityName;
    city_temp = (weatherItem.main.temp - 273.15).toFixed(2);
    if(index === 0) { 
        return `<div class="details ">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { 
        // console.log(getDayAbbreviation(new Date(weatherItem.dt_txt.split(" ")[0])));
        // HTML for the other five day forecast card
        return `<li class="card !text-emerald-900">
                   <h3>${getDayAbbreviation(new Date(weatherItem.dt_txt.split(" ")[0]))}</h3> 
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}
const getWeatherDetails = async (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    // content.addClass('!hidden');
    try{

        const res = await  fetch(WEATHER_API_URL);
        const data = await res.json();
        // console.log(data);
        temp = (data.list[0].main.temp - 273.15).toFixed(2);
        window.localStorage.setItem("TEMP", temp);
        const uniqueForecastDays = new Set();
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            // console.log(new Date(forecast.dt_txt).getDate());
            if (!uniqueForecastDays.has(forecastDate)) {
                return uniqueForecastDays.add(forecastDate);
            }
        });
        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";
        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        }); 
        // content.removeClass('!hidden');
        // loader.addClass('!hidden');       
}
catch{
    console.error("BAD REQUEST: 400");
}
}
const getCityCoordinates = async () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return alert('INPUT FIELD IS EMPTY!');
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    try{
        const jsonData = await fetch(API_URL);
        const data = await jsonData.json();
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);

    }
    catch{
            alert("An error occurred while fetching the coordinates!");
    }
}
const getUserCoordinates = async  () => {
    // console.log(temp);
    // content.addClass('!hidden');
    // content.addClass('!hidden');
    // loader.show();
    // loader.removeClass('!hidden');
window
    navigator.geolocation.getCurrentPosition(
        async position => {
            const { latitude, longitude } = position.coords; 
            // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            long = longitude;
            lat = latitude;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            try{
                const jsonData = await fetch(API_URL);
                const data = await jsonData.json();
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);

            }
            catch{
                alert("An error occurred while fetching the city name!");
            }
            
        },
        error => { 
            // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
        // content.removeClass('!hidden');
        // loader.addClass('!hidden');
        
}
function getDayAbbreviation(date){
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayIndex = date.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  return daysOfWeek[dayIndex];
}

function switchTheme(){

    
        if (darkMode) {
            document.querySelector('#switch').innerHTML = 'DARK MODE';
            $('body').removeClass('dark');
            themeSwitcher.removeClass('dark-secondary');
            currentWeatherDiv.classList.remove('dark-secondary');
            searchButton.classList.remove('search-color');
            // $('separator').addClass('dark-secondary');
            darkMode = false;
        } else {
            
            document.querySelector('button.search-btn').classList.add('search-color');
            document.querySelector('#switch').innerHTML = 'LIGHT MODE';
            themeSwitcher.addClass('dark-secondary');
            currentWeatherDiv.classList.add('dark-secondary');
            $('body').addClass('dark');
            $('input').addClass('!text-black');
            searchButton.classList.remove('dark-secondary');
            // $('separator').removeClass('dark-secondary');
            darkMode = true;
        }
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
themeSwitcher.on('click', switchTheme);


// content.addClass('!hidden');
// loader.addClass('!hidden');
content.addClass('!hidden');

await getUserCoordinates();
setTimeout(()=>{
    //Map
    content.removeClass('!hidden');
    loader.addClass('!hidden');
    // WORK FROM HERE

     map = L.map('map').setView([lat, long], 13);
        var circle = L.circle([lat, long], {
        color: '#064E3B',
        fillColor: '#064E3B',
        fillOpacity: 0.9,
        radius: 900
        }).addTo(map);
        window.localStorage.setItem("Location", city_name);
        window.localStorage.setItem("Temp", city_temp);
        circle.bindPopup(`You're in ${window.localStorage.getItem("Location")}, Temp: ${window.localStorage.getItem("Temp")}°C`).openPopup();
        map.on('click', onMapClick);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    
}, 1000);
// const onMapClick = async (evt) => {
//     //console.log(evt.latlng.lat, evt.latlng.lng, evt);
//     const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${evt.latlng.lat}&lon=${evt.latlng.lng}&appid=${API_KEY}`
//     const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${evt.latlng.lat}&lon=${evt.latlng.lng}&limit=1&appid=${API_KEY}`;
//     try{

//         const data = await fetch(API_URL);
//         const data2 = await fetch(WEATHER_API_URL);
        
//         const contentData2 = await data2.json();
//         const contentData = await data.json();
//         const temp_C =  (contentData2.list[0].main.temp - 273.15).toFixed(2);
//         popup
//         .setLatLng(evt.latlng)
//         .setContent(`${contentData[0].name},  \n ${temp_C}°C `.toUpperCase())
//         .openOn(map);
//     }
//     catch{
//         console.error("BAD REQUEST: 400");
//     }
// }