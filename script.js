/*-------------------- LOAD DETAILS, SEARCH AND FILL FORM --------------------*/
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    let filteredCountry = [];

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        /*--- Trim search ---*/
        const country = document.getElementById('country').value.trim().toLowerCase();

        /*--- Clear results ---*/
        document.getElementById('weatherInfo').innerHTML = '';
        document.getElementById('travelTip').innerHTML = '';

        const foundCountry = filteredCountry.find(c => 
            c.countryName.toLowerCase() === country
        );

        if (!foundCountry) {
            alert('Please enter a valid country.');
            return;
        }

        /*--- Timeout delay for countries to load ---*/
        setTimeout(() => {
            fetchCountryDetails(country)
                .then(countryData => {
                    return Promise.all([
                        fetchWeather(countryData.lat, countryData.lon),
                        countryData
                    ]);
                })
                .then(([weatherData, countryData]) => {
                    /*--- Display results in HTML ---*/
                    displayCountryInfo(countryData);
                    displayWeather(weatherData);
                    displayTravelTip(weatherData);
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Something went wrong. Please check the country name and try again.');
                });
        /*--- Delay for countries to load ---*/
        }, 1000); 
    });



/*-------------------- FETCH AND FILTER COUNTRY API --------------------*/
fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
        filteredCountry = data.map(country => {
            const countryName = country.name?.common || "N/A";
            const countryFlag = country.flags?.png || "N/A";
            const countryLatLong = country.latlng || [];
            const countryCurrency = country.currencies
            ? Object.keys(country.currencies).map(curr => ({
                code: curr,
                name: country.currencies[curr]?.name,
                symbol: country.currencies[curr]?.symbol
              }))
            : [];

            return {
                countryName,
                countryFlag,
                latitude: countryLatLong[0] || "N/A",
                longitude: countryLatLong[1] || "N/A",
                countryCurrency,
            };
        });
})
    .catch(error => {
        console.error('Error:', error);
});

/*--- Fetch country details ---*/
function fetchCountryDetails(searchCountry) {
    const foundCountry = filteredCountry.find(country => 
        country.countryName.toLowerCase() === searchCountry.toLowerCase()
    );

    if (!foundCountry) {
        throw new Error('Country not found');
    }

    return Promise.resolve({
        name: foundCountry.countryName,
        flag: foundCountry.countryFlag,
        lat: foundCountry.latitude,
        lon: foundCountry.longitude,
        currencies: foundCountry.countryCurrency
    });
}

/*-------------------- FETCH WEATHER API --------------------*/
function fetchWeather(latitude, longitude) {
    return fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
    )
    .then(response => {
        if (!response.ok) throw new Error('Weather data unavailable');
        return response.json();
    })
    .then(data => {
        return data.daily;
    })
    .catch(error => {
        console.error('Error fetching weather:', error);
        throw error;
    });
}



/*-------------------- DISPLAY IN HTML --------------------*/

/*--- Display country in HTML ---*/
function displayCountryInfo(countryData) {
    const weatherDiv = document.getElementById('weatherInfo');
        
    weatherDiv.innerHTML = `
        <section class="country-info">
            <h2>${countryData.name}</h2>
            <img src="${countryData.flag}" alt="Flag of ${countryData.name}" class="country-flag">
        </section>
    `;
    
    return countryData;
}

/*--- Display weather in HTML ---*/
function displayWeather(data) {
    const weatherDiv = document.getElementById('weatherInfo');
        
    let weatherHtml = '<h3>Weather Forecast:</h3><div class="weather-grid">';

    const firstDate = new Date(data.time[0]);

    data.temperature_2m_max.forEach((tempMax, index) => {
        const tempMin = data.temperature_2m_min[index];
        const weatherIcon = getWeatherIcon(tempMax);

        const currentDate = new Date(firstDate);
        currentDate.setDate(firstDate.getDate() + index);
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[currentDate.getDay()];

        weatherHtml += `
            <div class="weather-day">
                <img src="${weatherIcon}" alt="Weather icon" class="weather-icon">
                <p class="weather-day-text">${dayName}</p>
                <p>Max:<br> ${tempMax}°C</p>
                <p>Min:<br> ${tempMin}°C</p>
            </div>
        `;
    });

    weatherHtml += '</div>';
    weatherDiv.innerHTML += weatherHtml;
}})

/*--- Display travel tip in html ---*/
function displayTravelTip(weatherData) {
    const tipDiv = document.getElementById('travelTip');
    const maxTemp = weatherData.temperature_2m_max[0];
    
    /*--- Display tip depending on max temperature ---*/
    let tip = 'Remember your bag and enjoy your trip!';
    
    if (maxTemp > 35) {
        tip = 'Extreme heat! Stay hydrated and stay in the shade. Maybe just cancel and go to a sauna instead...';
    } else if (maxTemp > 30) {
        tip = 'Pack sunscreen, water, wear light clothing and don\'t stay in the sun for too long!';
    } else if (maxTemp > 25) {
        tip = 'Pack sunscreen and stay hydrated!';
    } else if (maxTemp > 15) {
        tip = 'Mild temperatures. A light jacket could be useful.';
    } else if (maxTemp > 5) {
        tip = 'Bring some warm clothes and a jacket.';
    } else if (maxTemp > -5) {
        tip = 'Cool days this week, bring a jacket and your most fancy long johns.';
    } else {
        tip = 'Pack a jacket or four, don\'t forget your gloves and read up on how to build an igloo.';
    }

    tipDiv.innerHTML = `<h3>Travel Tip:</h3><p>${tip}</p>`;
}

/*--- Weather icon depending on temperature---*/
function getWeatherIcon(temp) {
    if (temp > 15) {
        /*--- Sun icon for hot ---*/
        return '/assets/hot.png';
    } else if (temp <= 15 && temp >= 0) {
        /*--- Cloud icon for medium ---*/
        return '/assets/or.png';
    } else {
        /*--- Snowflake icon for minus ---*/
        return '/assets/not.png';
    }
}



/*-------------------- LOGO HOVER ANIMATION --------------------*/
const logo = document.querySelector('.logo');

logo.addEventListener('mouseenter', () => {
    /*--- Add spin class to logo ---*/
    if (!logo.classList.contains('spin')) {
        logo.classList.add('spin');
    }
});

logo.addEventListener('animationend', () => {
    /*--- Remove spin class from logo when animation is done ---*/
    logo.classList.remove('spin');
});