async function getCountryBorder() {
    showLoader();
    try {
        const response = await fetch('js/countryBorders.json');
        const data = await response.json();
        const countrySelect = document.getElementById('selectCountry');

        data.features.forEach(feature => {
            const name = feature.properties.name;
            const iso_a2 = feature.properties.iso_a2;

            const optionElement = document.createElement('option');
            optionElement.value = iso_a2;
            optionElement.textContent = name;
            countrySelect.appendChild(optionElement);
        });
        
    } catch (error) {
        console.error('Error fetching or parsing JSON file:', error);
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

async function showPosition(position) {
    const response = await fetch('/project1/js/countryBorders.json');
    const bordersData = await response.json();

    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    weatherApi(latitude, longitude, (weatherData) => {
        countryInfoApi(weatherData.weatherObservation.countryCode, (countryInfo) => {

            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {

                if (this.readyState == 4 && this.status == 200) {

                    let jsonData = this.response;
                    const exchangeRateData = JSON.parse(jsonData);

                    if (exchangeRateData && exchangeRateData.geonames) {
                        
                        xhttp.onreadystatechange = function () {

                            if (this.readyState == 4 && this.status == 200) {
                                let jsonData1 = this.response;
                                const currency = JSON.parse(jsonData1);
                                let exchangeRates = currency.rates;
                                
                                xhttp.onreadystatechange = function () {

                                    if (this.readyState == 4 && this.status == 200) {
                                        let jsonWiki = this.response;
                                        let wiki = JSON.parse(jsonWiki);

                                        xhttp.onreadystatechange = function () {

                                            if (this.readyState == 4 && this.status == 200) {
                                                let jsonnews = this.response;
                                                let news = JSON.parse(jsonnews);
                                                hideLoader();
                                                
                                                let coordinates = [];
                                                bordersData.features.forEach(feature => {
                                                    const name = feature.properties.name;
                                                    if (name == countryInfo.geonames[0].countryName) {
                                                        coordinates = feature.geometry.coordinates[0];
                                                    }
                                                });

                                                createMap(latitude, longitude,  coordinates, countryInfo, weatherData, exchangeRates, wiki, news);
                                            }
                                        }
                                        xhttp.open("GET", `https://newsdata.io/api/1/news?apikey=pub_39274d5e33960b980726a4fbf801509af4f36`, true);
                                        xhttp.send();
                                    }
                                }
                        /**/    xhttp.open("GET", `https://secure.geonames.org/wikipediaSearchJSON?q=${countryInfo.geonames[0].countryName}&username=evangeline_daniel`, true);
                                xhttp.send();
                            }
                        }
                        xhttp.open("GET", "https://open.er-api.com/v6/latest/" + countryInfo.geonames[0].currencyCode, true);
                        xhttp.send();
                    }
                }
            }
            xhttp.open("GET", "https://evangelinedaniel.com/project1/php/wikipedia.php?countryCode=" + weatherData.weatherObservation.countryCode + "&countryName=" + weatherData.weatherObservation.countryName, true);
            xhttp.send();
        })
    });
}

function search() {
    const countryCode = document.getElementById('selectCountry').value;
    showLoader();
    showPositionMap(countryCode);
}

async function showPositionMap(countryCode) {
    const response = await fetch('js/countryBorders.json');
    const bordersData = await response.json();
    
    countryInfoApi(countryCode, (countryInfo) => {

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {

            if (this.readyState == 4 && this.status == 200) {
                let jsonWiki = this.response;
                let wiki = JSON.parse(jsonWiki);

                weatherApi(wiki.geonames[0].lat, wiki.geonames[0].lng, (weatherData) => {
                    xhttp.onreadystatechange = function () {

                        if (this.readyState == 4 && this.status == 200) {

                            let jsonData = this.response;
                            const exchangeRateData = JSON.parse(jsonData);

                            if (exchangeRateData && exchangeRateData.geonames) {

                                xhttp.onreadystatechange = function () {

                                    if (this.readyState == 4 && this.status == 200) {
                                        let jsonData1 = this.response;
                                        const currency = JSON.parse(jsonData1);
                                        let exchangeRates = currency.rates;
                                        
                                        xhttp.onreadystatechange = function () {

                                            if (this.readyState == 4 && this.status == 200) {
                                                let jsonnews = this.response;
                                                let news = JSON.parse(jsonnews);
                                                hideLoader();
                                                
                                                let coordinates = [];
                                                bordersData.features.forEach(feature => {
                                                    const name = feature.properties.name;
                                                    if (name == countryInfo.geonames[0].countryName) {
                                                        coordinates = feature.geometry.coordinates[0];
                                                    }
                                                });

                                                let map_container = document.getElementById('map_container');
                                                map_container.innerHTML = '';

                                                createMap(wiki.geonames[0].lat, wiki.geonames[0].lng, coordinates, countryInfo, weatherData, exchangeRates, wiki, news);
                                            }
                                        }
                                        xhttp.open("GET", `https://newsdata.io/api/1/news?apikey=pub_39274d5e33960b980726a4fbf801509af4f36`, true);
                                        xhttp.send();
                                    }
                                }
                                xhttp.open("GET", "https://open.er-api.com/v6/latest/" + countryInfo.geonames[0].currencyCode, true);
                                xhttp.send();
                            }
                        }
                    }
            /**/    xhttp.open("GET", "https://secure.geonames.org/wikipediaSearchJSON?formatted=true&q=" + countryInfo.geonames[0].countryName.replace(/\s/g, '') + "&maxRows=1000&username=evangeline_daniel&countryCode=" + countryCode, true);
                    xhttp.send();
                });
                
            }
        }
/**/    xhttp.open("GET", `https://secure.geonames.org/wikipediaSearchJSON?q=${countryInfo.geonames[0].countryName}&username=evangeline_daniel`, true);
        xhttp.send();
        
    });
}

function createMap(latitude, longitude, coordinates, countryInfo, weatherData, exchangeRates, wiki, newsDaily) {

    let streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
    });

    let satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    });

    let basemaps = {
        "Streets": streets,
        "Satellite": satellite
    };

    if (document.getElementById("map") == null) {
        document.getElementById("map_container").innerHTML = "<div id='map'></div>";
    }

    let map = L.map('map', {
        layers: [streets]
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 13,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    let reversedCoordinates = [];
    coordinates.forEach(segment => {
        reversedCoordinates.push([segment[1], segment[0]]);
    });
    
    let polygon = L.polygon(reversedCoordinates, { color: 'red' }).addTo(map);
    let bounds = polygon.getBounds();
    map.fitBounds(bounds);
    
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        
        var markers = L.markerClusterGroup();
        
        if (xhr.readyState == 4 && xhr.status == 200) {
            
            let responseData = JSON.parse(this.response);

            let cities_data = [];
            let redMarker = L.icon({
                iconUrl: 'https://evangelinedaniel.com/project1/img/location.png',
                iconSize:     [40, 40],
                shadowSize:   [50, 64],
                iconAnchor:   [22, 94],
                shadowAnchor: [4, 62],
                popupAnchor:  [-3, -76]
            });

            for (let city_data of responseData) {
                let marker = L.marker([parseFloat(city_data.latitude), parseFloat(city_data.longitude)], { icon: redMarker }).bindPopup(city_data.name);
                markers.addLayer(marker);
                // cities_data.push(L.marker([parseFloat(city_data.latitude), parseFloat(city_data.longitude)], {icon: redMarker}).bindPopup(city_data.name));
            }
            
            // let city = L.marker(cities_data);
            // markers.addLayer(city);
            map.addLayer(markers);
            
            let cities = L.layerGroup(cities_data);
            let layerControl = L.control.layers(basemaps).addTo(map);
            layerControl.addOverlay(cities, "Cities");

            let airports_xhr = new XMLHttpRequest();
            
            airports_xhr.onreadystatechange = function () {
                if (airports_xhr.readyState == 4) {
                    if (airports_xhr.status == 200) {
                        let result = JSON.parse(airports_xhr.responseText);

                        let airports_data = [];
                        let redMarker = L.icon({
                            iconUrl: 'https://evangelinedaniel.com/project1/img/airplane.webp',
                            iconSize:     [20, 20],
                            shadowSize:   [50, 64],
                            iconAnchor:   [22, 94],
                            shadowAnchor: [4, 62],
                            popupAnchor:  [-3, -76]
                        });

                        for (let airport_data of result) {
                            airports_data.push(
                                L.marker([parseFloat(airport_data.latitude), parseFloat(airport_data.longitude)], {icon: redMarker}).bindPopup(airport_data.name));
                        }

                        let airports = L.layerGroup(airports_data);
                        layerControl.addOverlay(airports, "Airports");

                    } else {
                        console.error('Error fetching airports:', airports_xhr.statusText);
                    }
                }
            };
            airports_xhr.open('GET', 'https://api.api-ninjas.com/v1/airports?X-Api-Key=LSmiLBFquAgMDZ54SJuDLw==fFmOFJ8SzRckH1XU&country=' + countryInfo.geonames[0].countryCode, true);
            airports_xhr.setRequestHeader('X-Api-Key', 'LSmiLBFquAgMDZ54SJuDLw==fFmOFJ8SzRckH1XU');
            airports_xhr.setRequestHeader('Content-Type', 'application/json');
            airports_xhr.send();
        }
    };
    xhr.open('GET', 'https://evangelinedaniel.com/project1/php/cities.php?country_code=' + countryInfo.geonames[0].countryCode, true);
    xhr.send();

    let marker = L.marker([latitude, longitude],4);
    marker.addTo(map);

    let infoElement = document.getElementById('info');
    let info = `<div id="exampleModal1" class="modal" data-bs-backdrop="false" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content shadow">
                            <div class="modal-header bg-success bg-gradient text-white">
                                <h5 class="modal-title">Information</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <table class="table table-striped">
                                    <tr>
                                    <td class="text-center">
                                        <i class="fa fa-flag text-success"></i>
                                    </td>
                        
                                    <td>
                                        <b>Country Name: </b>
                                    </td>
                        
                                    <td class="text-end">
                                        ${countryInfo.geonames[0].countryName}
                                    </td>
                                    </tr>
                                    
                                    <tr>
                                    <td class="text-center">
                                        <i class="fa fa-map-marker text-success"></i>
                                    </td>
                        
                                    <td>
                                        <b>Capital City: </b>
                                    </td>
                        
                                    <td class="text-end">
                                        ${countryInfo.geonames[0].capital}
                                    </td>
                                    </tr>
                                    
                                    <tr>
                                    <td class="text-center">
                                        <i class="fa fa-venus text-success"></i>
                                    </td>
                        
                                    <td>
                                        <b>Population: </b>
                                    </td>
                        
                                    <td class="text-end">
                                        ${countryInfo.geonames[0].population}
                                    </td>
                                    </tr>
                                            
                                </table>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-success btn-sm" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>`;

    let forecastElement = document.getElementById('forecast');
    let forecast = `<div id="exampleModal2" class="modal" data-bs-backdrop="false" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content shadow">
        <div class="modal-header bg-danger bg-gradient text-white">
          <h5 class="modal-title">Weather Forecast</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="container">
                <div class="row">
                    <div class="col">
                        <h1 style="font-size: 25px;"><b>${weatherData.weatherObservation.stationName}</b></h1>
                    </div>
                    <div class="col">
                        <span class='fas fa-cloud-sun' style='font-size:35px; color: burlywood'></span><span style="font-size: 35px"> <b>${weatherData.weatherObservation.temperature}</b></span><span style="font-size: 15px;"> <b>&#8451;</b></span><br>
                        <span class="text-center">${weatherData.weatherObservation.clouds}</span>
                    </div>
                    <div class="col">
                        <b>Humidity: ${weatherData.weatherObservation.humidity} %</b><br><br>
                        <b>Wind: ${weatherData.weatherObservation.windSpeed} mph</b>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col">
                        <h1 style = "font-size: 15px;" class="text-center"><b>Morning</b></h1>
                        <i class="fa fa-cloud text-secondary text-center" style="font-size:36px"></i><span class="text-center" style="font-size: 18px;"> ${weatherData.weatherObservation.temperature} &#8451;</span> <br> <span class="text-center">${weatherData.weatherObservation.clouds}</span>
                    </div>
                    <div class="col">
                        <h1 style = "font-size: 15px;" class="text-center"><b>Afternoon</b></h1>
                        <i class="fa fa-cloud text-secondary text-center" style="font-size:36px"></i><span class="text-center" style="font-size: 18px;"> ${weatherData.weatherObservation.temperature} &#8451;</span> <br> <span class="text-center">${weatherData.weatherObservation.clouds}</span>
                    </div>
                    <div class="col">
                        <h1 style = "font-size: 15px;" class="text-center"><b>Evening</b></h1>
                        <i class="fa fa-cloud text-secondary text-center" style="font-size:36px"></i><span class="text-center" style="font-size: 18px;"> ${weatherData.weatherObservation.temperature} &#8451;</span> <br> <span class="text-center">${weatherData.weatherObservation.clouds}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-success btn-sm" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>`

    let currencyElement = document.getElementById('currency');
    let currency = `<div id="exampleModal3" class="modal" data-bs-backdrop="false" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content shadow">
        <div class="modal-header bg-danger bg-gradient text-white">
          <h5 class="modal-title">Currency Calculator</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="container">
                <div class="row">
                    <div class="col">
                        <input id="amount" type="number" class="form-control" placeholder="Enter the number" aria-label="Enter the number">
                        <label style="background-color: rgb(208 69 69);" class="bg-gradient p-1 rounded text-white w-25 m-1 text-center">${countryInfo.geonames[0].currencyCode}</label>
                        </div>
                        <div class="col">
                        <input id="amountConverted" type="number" class="form-control" placeholder="Converted amount" aria-label="Converted amount" disabled>
                        <label style="float: right;"><select onchange="calc()" style="background-color: rgb(208 69 69);" id='currencySelect' class="bg-gradient border border-0 p-1 rounded text-white m-1 text-center"><option class='d-none'>Select currency</option></select></label>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-success btn-sm" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>`

    let result = '';
    wiki.geonames.forEach(geonames => {
        if (geonames.title == countryInfo.geonames[0].countryName) {
            result = result + `<div class="container">
                                    <div style="background-color: rgb(222 225 227);" class="p-1 px-3 w-100 rounded">
                                        ${geonames.title}
                                    </div>

                                    <div class="p-1 px-3 w-100 text-justify">
                                        ${geonames.summary}
                                    </div>

                                    <div style="background-color: rgb(222 225 227);" class="p-1 px-3 w-100 rounded">
                                        <a href = "https://${geonames.wikipediaUrl}">Read More...</a>
                                    </div>
                                </div>`
        }
    });

    let wikipediaElement = document.getElementById('wikipedia');
    let wikipedia = `<div id="exampleModal4" class="modal" data-bs-backdrop="false" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div class="modal-content shadow">
                                <div class="modal-header bg-success bg-gradient text-white">
                                    <h5 class="modal-title">Wikipedia Wonders</h5>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body" id="wikiSearch">
                                    
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-outline-success btn-sm" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>`

    let newscontent = ''
    newsDaily.results.forEach(article => {
        newscontent += `
            <div class="border border-2 m-4">
                <div class="p-1 px-3 rounded">
                    <h1 style = "font-size: 20px">${article.title}</h1>
                </div>
    
                <div class="p-1 px-3 w-100 text-justify">
                    <p style="font-size: 12px">${article.description}</p>
                </div>
    
                <div class="rounded">
                    <img class="p-1 px-3 w-50 rounded" src="${article.image_url}">
                </div>
    
                <div class="container">
                    <div class="row">
                        <div class="col text-secondary">
                            ${article.pubDate}
                        </div>
                        <div class="col">
                            <a href="${article.link}">Read More..</a>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    let newsElement = document.getElementById('news');
    let news = `<div id="exampleModal5" class="modal" data-bs-backdrop="false" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content shadow">
                            <div class="modal-header bg-danger bg-gradient text-white">
                                <h5 class="modal-title">Today's Headlines</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body" id="newSearch">
                                
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-success btn-sm" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>`
    
    infoElement.innerHTML = info;
    forecastElement.innerHTML = forecast;
    currencyElement.innerHTML = currency;
    wikipediaElement.innerHTML = wikipedia;
    newsElement.innerHTML = news;

    const wikiSearch = document.getElementById('wikiSearch');
    const newSearch = document.getElementById('newSearch');

    wikiSearch.innerHTML = result;
    newSearch.innerHTML = newscontent;

    const currencySelect = document.getElementById("currencySelect");

    for (const currencyCode in exchangeRates) {
        const exchangeRate = exchangeRates[currencyCode];
        const optionElement = document.createElement('option');

        optionElement.value = exchangeRate;
        optionElement.textContent = `${currencyCode}`;
        currencySelect.appendChild(optionElement);
    }
}

function countryInfoApi(countryCode, callback) {
    
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let jsonData = this.response;
            const data = JSON.parse(jsonData);

            callback(data);
        }
    }
    xhttp.open("GET", "https://evangelinedaniel.com/project1/php/countryInfoApi.php?countryCode=" + countryCode, true)
    xhttp.send();
}

function weatherApi(latitude, longitude, callback) {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let jsonData = this.response;
            const data = JSON.parse(jsonData);
            
            callback(data);
        }
    }
    xhttp.open("GET", "https://evangelinedaniel.com/project1/php/weatherApi.php?latitude=" + latitude + "&longitude=" + longitude, true)
    xhttp.send();
}

function calc() {
    const amountConverted = document.getElementById('amountConverted');
    const amount = parseFloat(document.getElementById('amount').value);
    const currencyCode = parseFloat(document.getElementById('currencySelect').value);

    amountConverted.placeholder = (amount * currencyCode).toFixed(2);
}

function showLoader() {
    document.getElementById('load').style.display = "none";
    document.getElementById('loaderBackground').style.display = 'block';
}

function hideLoader() {
    document.getElementById('load').style.display = "block";
    document.getElementById('loaderBackground').style.display = 'none';
}