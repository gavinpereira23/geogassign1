mapboxgl.accessToken =
    'pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw';
let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 3, // starting zoom
    center: [-102.5, 38] // starting center
});




async function geojsonfetch() {
    let response = await fetch('assets/us-covid-2020/us-covid-2020-rates.geojson');
    let covid = await response.json();
    //load data to the map as new layers.
    //map.on('load', function loadingData() {
    map.on('load', () => { //simplifying the function statement: arrow with brackets to define a function

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-96, 37.8],
            zoom: 3
        });

        // San Francisco
        const origin = [-122.414, 37.776];

        // Washington DC
        const destination = [-77.032, 38.913];

        // A simple line from origin to destination.
        const route = {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [origin, destination]
                }
            }]
        };

        // A single point that animates along the route.
        // Coordinates are initially set to origin.
        const point = {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'Point',
                    'coordinates': origin
                }
            }]
        };

        // Calculate the distance in kilometers between route start/end point.
        const lineDistance = turf.length(route.features[0]);

        const arc = [];

        // Number of steps to use in the arc and animation, more steps means
        // a smoother arc and animation, but too many steps will result in a
        // low frame rate
        const steps = 500;

        // Draw an arc between the `origin` & `destination` of the two points
        for (let i = 0; i < lineDistance; i += lineDistance / steps) {
            const segment = turf.along(route.features[0], i);
            arc.push(segment.geometry.coordinates);
        }

        // Update the route with calculated arc coordinates
        route.features[0].geometry.coordinates = arc;

        // Used to increment the value of the point measurement against the route.
        let counter = 0;

        map.on('load', () => {
            // Add a source and layer displaying a point which will be animated in a circle.
            map.addSource('route', {
                'type': 'geojson',
                'data': route
            });

            map.addSource('point', {
                'type': 'geojson',
                'data': point
            });

            map.addLayer({
                'id': 'route',
                'source': 'route',
                'type': 'line',
                'paint': {
                    'line-width': 2,
                    'line-color': '#007cbf'
                }
            });

            map.addLayer({
                'id': 'point',
                'source': 'point',
                'type': 'symbol',
                'layout': {
                    // This icon is a part of the Mapbox Streets style.
                    // To view all images available in a Mapbox style, open
                    // the style in Mapbox Studio and click the "Images" tab.
                    // To add a new image to the style at runtime see
                    // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
                    'icon-image': 'airport-15',
                    'icon-rotate': ['get', 'bearing'],
                    'icon-rotation-alignment': 'map',
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true
                }
            });

            function animate() {
                const start =
                    route.features[0].geometry.coordinates[
                        counter >= steps ? counter - 1 : counter
                    ];
                const end =
                    route.features[0].geometry.coordinates[
                        counter >= steps ? counter : counter + 1
                    ];
                if (!start || !end) return;

                // Update point geometry to a new position based on counter denoting
                // the index to access the arc
                point.features[0].geometry.coordinates =
                    route.features[0].geometry.coordinates[counter];

                // Calculate the bearing to ensure the icon is rotated to match the route arc
                // The bearing is calculated between the current point and the next point, except
                // at the end of the arc, which uses the previous point and the current point
                point.features[0].properties.bearing = turf.bearing(
                    turf.point(start),
                    turf.point(end)
                );

                // Update the source with this new data
                map.getSource('point').setData(point);

                // Request the next frame of animation as long as the end has not been reached
                if (counter < steps) {
                    requestAnimationFrame(animate);
                }

                counter = counter + 1;
            }

            document.getElementById('replay').addEventListener('click', () => {
                // Set the coordinates of the original point back to origin
                point.features[0].geometry.coordinates = origin;

                // Update the source layer
                map.getSource('point').setData(point);

                // Reset the counter
                counter = 0;

                // Restart the animation
                animate(counter);
            });

            // Start the animation
            animate(counter);
        });









        const layers = [
            '0-19',
            '20-39',
            '40-59',
            '60-79',
            '80-99',
            '100-119',
            '120-139',
            '140+'
        ];
        const colors = [
            '#FFEDA070',
            '#FED97670',
            '#FEB24C70',
            '#FD8D3C70',
            '#FC4E2A70',
            '#E31A1C70',
            '#BD002670',
            '#80002670'
        ];

        const legend = document.getElementById('legend');
        legend.innerHTML = "<b>COVID Case Rate<br>(cases / 1000 people)</b><br><br>";

        layers.forEach((layer, i) => {
            const color = colors[i];
            const item = document.createElement('div');
            const key = document.createElement('span');
            key.className = 'legend-key';
            key.style.backgroundColor = color;

            const value = document.createElement('span');
            value.innerHTML = `${layer}`;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        });

    });
};


geojsonfetch();
