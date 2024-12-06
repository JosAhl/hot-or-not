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

        if (!country) {
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
    console.log(filteredCountry);
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
        console.log('Weather:', data.daily);
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
        
    console.log('Country info:', countryData.name);
    return countryData;
}

/*--- Display weather in HTML ---*/
function displayWeather(data) {
    const weatherDiv = document.getElementById('weatherInfo');
        
    let weatherHtml = '<h3>Weather Forecast:</h3><div class="weather-grid">';

    data.temperature_2m_max.forEach((tempMax, index) => {
        const tempMin = data.temperature_2m_min[index];
        const weatherCode = data.weathercode[index];

        weatherHtml += `
            <div class="weather-day">
                <p class="weather-day-text">Day ${index + 1}</p>
                <p>Max: ${tempMax}°C</p>
                <p>Min: ${tempMin}°C</p>
            </div>
        `;
    });

    weatherHtml += '</div>';
    weatherDiv.innerHTML += weatherHtml;
}})