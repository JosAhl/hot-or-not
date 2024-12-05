fetch('https://restcountries.com/v3.1/all')
  .then(response => response.json())
  .then(data => {
    const filteredCountry = data.map(country => {
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
        console.log(filteredCountry)
})
  .catch(error => {
    console.error('Error:', error);
})
