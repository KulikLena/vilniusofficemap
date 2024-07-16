window.onload = init;
import { vilnius } from './static/vilnius.js';
import { retail } from './static/RetailDataselected.js';
import { population } from './static/population.js';

function init() {
    const mapElement = document.getElementById('mapid');
    const mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/lenakulik/cl4gubhle000114qtkjq2kz8f/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibGVuYWt1bGlrIiwiYSI6ImNranVqYnhxMDAzZHgyc2xncTI2ZTJlaWIifQ.__lIWTKzeHrjT0FABCVsjw', {
        attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
    });
    const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });


    const mymap = L.map(mapElement, {
        center: [54.68678431775792, 25.27905524694906],
        zoom: 12,
        layers: [mapbox]
    });
    const baseLayers = {
        'Mapbox': mapbox,
        'OpenStreetMap': openStreetMap,
    };

    const layerControls = L.control.layers(baseLayers, {}, { position: 'bottomright' }).addTo(mymap);

    var vilniusLayer = L.geoJSON(vilnius).addTo(mymap);

    // Add features to the map (e.g., retail data)
    addFeaturesToMap(retail.features, mymap);

    mymap.fitBounds(vilniusLayer.getBounds());

    var drawnItems = new L.FeatureGroup();
    mymap.addLayer(drawnItems);

    var counter = 0;
    var newLocations = [];

    var geojsonLayer = L.geoJSON(null, {

        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 0.3,
                fillColor: 'darkblue',  // Initial color
                color: 'darkblue',
                weight: 1,
                opacity: (feature.properties.POP / 991) * 4,
                fillOpacity: (feature.properties.POP / 991) * 4
            });
        }
    }).addTo(mymap);

    // Load the population data
    loadGeoJSON(population);

    mymap.on('click', function (e) {
        if (counter >= 3) {
            alert("You can only add a maximum of 2 points.");
            location.reload(); // Refresh the page
            return;
        }

        counter += 1;

        let new_retail_latlng = e.latlng;

        // Prompt user for marker size and number of anchors
        let size = parseInt(prompt("Please enter the marker size:", "25"));
        let anchors = parseInt(prompt("Please enter the number of anchors:", "5"));

        // Ensure size and anchors are numbers and set defaults if not
        if (isNaN(size)) size = 25; // Default size
        if (isNaN(anchors)) anchors = 5; // Default anchors

        // Create a custom icon with the specified size and opacity
        let icon = L.circleMarker(new_retail_latlng, {
            radius: Math.sqrt(size),
            fillColor: '#ff392e',  // Initial color
            color: '#ff392e',
            weight: 1,
            opacity: 1,
            fillOpacity: 1,
        });

        let new_location = {
            "type": "FeatureCollection",
            "name": "new_retail",
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "size": size,
                        "anchors": anchors,
                        "LAT": new_retail_latlng.lat,
                        "LON": new_retail_latlng.lng,
                        "geometry": { "type": "Point", "coordinates": [new_retail_latlng.lng, new_retail_latlng.lat] }
                    }
                }
            ]
        };

        newLocations.push(new_location.features[0].properties);
        console.log(newLocations, counter);


        // Create a popup for the marker
        let popup = L.popup({
            autoClose: false,
            closeOnClick: true
        }).setContent(String(counter), ' new shopping center');

        // Add the marker and popup to the map
        icon.addTo(mymap).bindPopup(popup).openPopup();

        icon.on('click', function () {
            if (confirm("Do you want to delete this marker?")) {
                mymap.removeLayer(icon);
            }
        });

        // Recolor the population points
        recolorPopulationPoints(population, retail, newLocations, geojsonLayer);
    });

    function addFeaturesToMap(features, map) {
        features.forEach(feature => {
            const properties = feature.properties;
            const geometry = feature.geometry;

            // Ensure properties and geometry are not null
            if (properties && geometry && geometry.coordinates) {
                const lat = properties.LAT;
                const lon = properties.LON;

                // Validate LAT and LON
                if (lat !== null && lon !== null) {
                    const marker = L.circleMarker([lat, lon], {
                        radius: Math.sqrt(feature.properties.size), // Size of the icon
                        fillColor: '#ff392e',  // Initial color
                        color: '#ff392e',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 1,
                    }).addTo(map);
                    marker.bindPopup(`<b>${properties["Property name"]}</b><br>${properties.Address}`);
                } else {
                    console.error("LAT or LON property is missing for feature:", feature);
                }
            } else {
                console.error("Invalid feature data:", feature);
            }
        });
    }

    function loadGeoJSON(data) {
        geojsonLayer.addData(data);
    }

    // Function to calculate the distance between two points (Haversine formula)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    }

    // Calculate the attraction score for each location
    function calculateAttraction(location) {
        if (location.size === undefined || location.anchors === undefined) {
            throw new Error("Location properties missing size or anchors");
        }
        return location.size * location.anchors;
    }

    // Huff Model calculation
    function huffModel(population, retail, newLocations, counter) {
        let resultsArray = [];
        let grandTotalVisitors = 0; // Variable to store the sum of all visitors
        const newAttraction = calculateAttraction(newLocations[counter - 1]);

        population.features.forEach(feature_pop => {
            let totalAttraction = 0;
            let grandtotalVisitors = 0;
            const newDistance = calculateDistance(feature_pop.properties.LAT, feature_pop.properties.LON, newLocations[counter - 1].LON, newLocations[counter - 1].LAT);


            // Calculate total attraction for existing retail locations
            retail.features.forEach(feature_re => {
                const distance = calculateDistance(feature_pop.properties.LAT, feature_pop.properties.LON, feature_re.properties.LON, feature_re.properties.LAT);
                const attraction = calculateAttraction(feature_re.properties) / Math.pow(distance, 2);
                totalAttraction += attraction;

            });
            // Add the new location's attraction

            totalAttraction += (newAttraction / Math.pow(newDistance, 2));

            // Calculate the probability and visitors for the new location  
            const probability = (newAttraction / Math.pow(newDistance, 2)) / totalAttraction;
            const visitors = feature_pop.properties.POP * probability;
            grandTotalVisitors += visitors;  // Add to the grand total visitors

            resultsArray.push({
                id: feature_pop.properties.OBJECTID,
                probability: probability,
                visitors: grandTotalVisitors
            });
            let popup = L.popup({
                autoClose: false,
                closeOnClick: true
            }).setContent(String(counter), " new shopping center","Total visitors: ", grandTotalVisitors );

        });

        console.log("Grand Total Visitors:", grandTotalVisitors); // Log the grand total visitors
        return {
            results: resultsArray,
            grandTotalVisitors: grandTotalVisitors
        };
    }

    // Function to recolor population points based on new retail point attraction
    function recolorPopulationPoints(population, retail, newLocations, geojsonLayer) {
        const huffResults = huffModel(population, retail, newLocations, counter);

        // Find max and min probabilities to normalize colors
        const maxProb = Math.max(...huffResults.results.map(r => r.probability));
        const minProb = Math.min(...huffResults.results.map(r => r.probability));
       // console.log("Max Probability:", maxProb);
       // console.log("Min Probability:", minProb);

        geojsonLayer.eachLayer(function (layer) {
            const result = huffResults.results.find(r => r.id === layer.feature.properties.OBJECTID);
            if (result) {
                const prob = result.probability;
                const normalizedProb = (prob - minProb) / (maxProb - minProb);
                const color = `rgba(${255 * normalizedProb}, 0, ${255 * (1 - normalizedProb)}, 1)`;
                layer.setStyle({
                    fillColor: color,
                    color: color
                });
            }

        });
        console.log(retail.features);
        console.log(newLocations);

        retail.features.
        push({
            type: 'Feature',
            properties:{ "LAT": newLocations[counter-1].LAT, "LON": newLocations[counter-1].LON, "size": newLocations[counter-1].size, "anchors": newLocations[counter-1].anchors}
            
            
        });
        
        console.log(retail.features);

    }
}
