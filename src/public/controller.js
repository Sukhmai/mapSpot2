// Global letiables
let rectWidth = 730;
let rectHeight = 200;
let leftLong, rightLong, lowerLat, upperLat
let curBearing = 0
let curZoom = 1
let curCenter = [1, 1]
let curGeoCoords, curActiveRectangle, curEndCenters
    //City Coordinates
    //     // Atlanta:
    // let ATLleftCenter = { lng: -84.3880, lat: 33.7490 }
    // let ATLrightCenter = { lng: -82.3880, lat: 33.7490 }
    // NOLA
let leftCenter = { lng: -90.0715, lat: 29.9511 }
let rightCenter = { lng: -90.0715, lat: 29.9511 }
let rc, lc
let currentPoints = null;
let projRatio = 0.5
let zoomAdd = 2.75

let isLocked = false
let selectedCity;
let style = 0;

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
})

//document.getElementById("interactionButton").setAttribute('disabled', 'enabled');

/*--------------------------------------------------------------------------------------------------------------------*/
/*  Create the map.                                                                                                   */
/*--------------------------------------------------------------------------------------------------------------------*/

mapboxgl.accessToken = 'pk.eyJ1IjoiYXRsbWFwcm9vbSIsImEiOiJjamtiZzJ6dGIybTBkM3dwYXQ2c3lrMWs3In0.tJzsvakNHTk7G4iu73aP7g';

/**
 * creates the MapBox GL map with initial parameters
 */
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/atlmaproom/cjkbg9s6m8njm2roxkx8gprzj', // style from online MapBox GL Studio
    zoom: 12,
    bearing: 0, // refers to rotation angle
    // Atlanta:
    // center: [-84.3951, 33.7634],
    // New Orleans
    center: [-90.0715, 29.9511],
    interactive: true
});
/*--------------------------------------------------------------------------------------------------------------------*/
/*  Move the map.                                                                                                   */
/*--------------------------------------------------------------------------------------------------------------------*/
/*
 *  when arrow keys are used to adjust the projector image.
 *  Emits the corresponding updates to the socket in order
 *  to update the image on the controller (and projector).
 */

map.on('load', function() {
    map.getCanvas().focus();
    map.getCanvas().addEventListener('keydown', function(e) {
        e.preventDefault();
    }, true);
});

function updateSlider(slideAmount) {
    let sliderDiv = document.getElementById("range-value");
    sliderDiv.innerHTML = slideAmount;
}

function getPixelCoordinates() {
    // get width & height from current rectangle
    width = rectWidth;
    height = rectHeight;
    // get map center in pixel coordinates
    let center = map.project(map.getCenter());
    // calculate pixel coordinates of corners
    let ur = { "x": (center.x + width / 2), "y": (center.y - height / 2) }; // upper right
    let ul = { "x": (center.x - width / 2), "y": (center.y - height / 2) }; // upper left
    let br = { "x": (center.x + width / 2), "y": (center.y + height / 2) }; // bottom right
    let bl = { "x": (center.x - width / 2), "y": (center.y + height / 2) }; // bottom left
    // return an json of pixel coordinates
    return { "ur": ur, "ul": ul, "br": br, "bl": bl };
}

function getGeoCoordinates() {
    // grab pixel coordinates from helper method
    let pixelCoordinates = getPixelCoordinates();
    // unproject to geographic coordinates
    let ur = map.unproject(pixelCoordinates.ur);
    let ul = map.unproject(pixelCoordinates.ul);
    let br = map.unproject(pixelCoordinates.br);
    let bl = map.unproject(pixelCoordinates.bl);
    // return a json of geographic coordinates
    return { "ur": ur, "ul": ul, "br": br, "bl": bl };
}

function getEndCenters() {
    let height = rectHeight;
    // get upper right & upper left pixels
    let pixelCoordinates = getPixelCoordinates();
    let ur = pixelCoordinates.ur;
    let ul = pixelCoordinates.ul;
    // calculate pixel coordinates for right & left center
    let rcPixel = { "x": (ur.x - height / 2), "y": (ur.y + height / 2) };
    let lcPixel = { "x": (ul.x + height / 2), "y": (ul.y + height / 2) };
    let rc = map.unproject(rcPixel);
    let lc = map.unproject(lcPixel);
    // return a json of geographic coordinates
    return { "rc": rc, "lc": lc };
}


function dropDownSelect() {
    selectedCity = document.getElementById('input').value;
    //document.getElementById('output').innerHTML = a;
    if (selectedCity === 'Atlanta') {
        map.flyTo({
            center: [-84.3951, 33.7634],
            zoom: 12,
            minZoom: 10,
            speed: 2.5
        });
        document.getElementById('sls').style.visibility = 'hidden';
        document.getElementById('gateways').style.visibility = 'hidden';
    }
    if (selectedCity === 'New Orleans') {
        map.flyTo({
            center: [-90.0715, 29.9511],
            zoom: 12,
            minZoom: 10,
            speed: 2.5
        });
        document.getElementById('sls').style.visibility = 'hidden';
        document.getElementById('gateways').style.visibility = 'hidden';
    }
    if (selectedCity === 'Savannah') {
        map.flyTo({
            center: [-81.0912, 32.0809],
            zoom: 12,
            minZoom: 10,
            speed: 2.5
        });
        document.getElementById('sls').style.visibility = 'visible';
        document.getElementById('gateways').style.visibility = 'visible';
    }
}
/*--------------------------------------------------------------------------------------------------------------------*/
/*  Lock the map.                                                                                                   */
/*--------------------------------------------------------------------------------------------------------------------*/
/**
 * when button is clicked, all user interaction (pinch/drag) with map is
 * disabled to "lock" so map does not become disaligned while drawing
 */
//document.getElementById('interactionButton').addEventListener('click', function() {
function lockMap() {
    //console.log(isLocked);
    // lock the map
    if (!isLocked) {
        map.boxZoom.disable();
        map.scrollZoom.disable();
        map.dragPan.disable();
        map.dragRotate.disable();
        map.keyboard.disable();
        map.doubleClickZoom.disable();
        map.touchZoomRotate.disable();
        isLocked = true;
       // console.log(isLocked);
        map.interactive = false;
        document.getElementById("interactionButton").style.filter = "brightness(75%)";

    }

    // unlock the map
    else {
        //console.log("in true" + isLocked);

        map.boxZoom.enable();
        map.scrollZoom.enable();
        map.dragPan.enable();
        map.dragRotate.enable();
        map.keyboard.enable();
        map.doubleClickZoom.enable();
        map.touchZoomRotate.enable();
        isLocked = false;
        document.getElementById("interactionButton").style.filter = "brightness(100%)";
    }
}

function createInnudationLayers(map) {
    let sources = ['0ft_flood', '1ft_flood', '2ft_flood', '3ft_flood', '4ft_flood',
        '5ft_flood', '6ft_flood', '7ft_flood', '8ft_flood', '9ft_flood', '10ft_flood'];
    let urls = ['atlmaproom.93btovy5', 'atlmaproom.648gihzb', 'atlmaproom.d8ny5yls', 'atlmaproom.djqk6f2y', 'atlmaproom.2ygvk1sa',
        'atlmaproom.4gufk4q2', 'atlmaproom.85425a0c', 'atlmaproom.anc8gj9d', 'atlmaproom.d3gpkygm', 'atlmaproom.6qqx7qn1', 'atlmaproom.4vxrmiod'];
    let sourceLayers = ['SLR_0ft-0o7756', 'SLR_1ft-6r3rtk', 'SLR_2ft-9f6erf', 'SLR_3ft-8jphh4', 'SLR_4ft-b3d67f',
        'SLR_5ft-boolll', 'SLR_6ft-9pigdt', 'SLR_7ft-010eyg', 'SLR_8ft-12hgg0', 'SLR_9ft-d2x7e7', 'SLR_10ft-bdjxeh'];
    for (let i = 0; i < sources.length; i++) {
        map.addSource(sources[i], {
            type: 'vector',
            url: 'mapbox://' + urls[i]
        })
        map.addLayer({
            'id': sources[i],
            'type': 'fill',
            'source': sources[i],
            'source-layer': sourceLayers[i],
            'layout': {
                'visibility': 'none'
            },
            'paint': {
                'fill-outline-color': '#f7ff05',
                'fill-color': 'blue',
                'fill-opacity': 0.6
            }
        })
    }
}


/**
 * adds BeltLine and data layer sources from MapBox GL Studio
 * and then adds the layers to the map to be toggled
 */
map.on('load', function() {
    let nav = new mapboxgl.NavigationControl({
        showCompass: true
    });
    let scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'imperial'
    });

    map.addControl(scale);
    scale.setUnit('imperial');
    map.addControl(nav, 'bottom-left');

    // beltline layer
    map.addSource('beltline', {
        type: 'vector',
        url: 'mapbox://atlmaproom.9v2e99o9'
    });
    map.addLayer({
        'id': 'beltline',
        'type': 'line',
        'source': 'beltline',
        'source-layer': 'Beltline_Weave-9xlpb5',
        'layout': {
            'visibility': 'visible',
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': 'yellow green',
            'line-width': 8
        }
    });

    // Merged Ga and LA layers
    // College education
    map.addSource('GALA_EDU', {
        type: 'vector',
        url: 'mapbox://atlmaproom.6izm8u6q'
    });
    map.addLayer({
        'id': 'Percent College Educated',
        'type': 'fill',
        'source': 'GALA_EDU',
        'source-layer': 'GALA_Edu_Merged-cvc094',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-outline-color': '#f7ff05',
            'fill-color': {
                property: 'PctBachorH',
                stops: [
                    //[0, '#00a4d1'],
                    //["", '#ffffff']
                    [8, '#fffcd6'],
                    [85, '#e92f2f']
                ]
            },
            'fill-opacity': 0.6
        }
    });
    // Median Income
    map.addSource('GALA_INC', {
        type: 'vector',
        url: 'mapbox://atlmaproom.d77n76r9'
    });
    map.addLayer({
        'id': 'Median Income',
        'type': 'fill',
        'source': 'GALA_INC',
        'source-layer': 'GALA_INC_Merged-5pmdmu',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-outline-color': '#f7ff05',
            'fill-color': {
                property: 'MedIncome',
                stops: [
                    [10906, '#fffcd6'],
                    [117250, '#4F6605']
                ]
            },
            'fill-opacity': 0.6
        }
    });
    // Percent White Occupancy
    map.addSource('GALA_White', {
        type: 'vector',
        url: 'mapbox://atlmaproom.5oq60h88'
    });
    map.addLayer({
        'id': 'Percent White Occupancy',
        'type': 'fill',
        'source': 'GALA_White',
        'source-layer': 'GALA_white_Merged-9mxzcb',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-outline-color': '#f7ff05',
            'fill-color': {
                property: 'White_pop',
                stops: [
                    [33, '#fffcd6'],
                    [94, '#0C2744']
                ]
            },
            'fill-opacity': 0.6
        }
    });
    //Sea Level Sensors
    map.addSource('Sensor_Source', {
      type: 'vector',
      url: 'mapbox://atlmaproom.Sensors2'
    });
    map.addLayer({
      'id': 'Sea_Level_Sensors',
      'type': 'circle',
      'source': 'Sensor_Source',
      'source-layer': 'Sensors2',
      'layout': {
          'visibility': 'none'
      },
      'paint' : {
        'circle-radius': 5,
        'circle-color': '#4c95f5',
        'circle-opacity' : 0.85
      }
    });
    map.addLayer({
      'id': 'InstallRings',
      'type': 'circle',
      'source': 'Sensor_Source',
      'source-layer': 'Sensors2',
      'layout': {
          'visibility': 'none'
      },
      'paint': {
        "circle-opacity": 0,
        "circle-radius": {
            property: 'install_time',
            stops: [
                [1546904750000, 45],
                [1579135222000, 15]
            ]
        },
        'circle-stroke-width': 3,
        'circle-stroke-color': '#4c95f5'
        }
    })
    map.addLayer({
      'id': 'CriticalRings',
      'type': 'circle',
      'source': 'Sensor_Source',
      'source-layer': 'Sensors2',
      'layout': {
          'visibility': 'none'
      },
      'paint': {
        "circle-opacity": 0,
        "circle-radius": {
            property: 'recent_max_time',
            stops: [
                [1546904750000, 45],
                [1579135222000, 15]
            ]
        },
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffa930'
        }
    })
      map.addLayer({
      'id': 'monthLabels',
      'type': 'symbol',
      'source': 'Sensor_Source',
      'source-layer': 'Sensors2',
      'layout': {
        'text-field': ['concat', ['to-string',['floor', ['/', ['-', Date.now() , ['get', 'install_time']], 2592000000]]], ' mo'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset': [5.5, 0],
        'text-anchor': 'top',
        'visibility' : 'none',
        'text-size' : 12
      },
      'paint': {
        'text-color': '#fff'
      }
      });

    //Gateways
    map.addSource('Gateway_Source', {
      type: 'vector',
      url: 'mapbox://atlmaproom.FloodLevels'
    });
    map.addLayer({
      'id': 'Flood_Levels',
      'type': 'circle',
      'source': 'Gateway_Source',
      'source-layer': 'FloodLevels',
      'layout': {
          'visibility': 'none'
      },
      'paint' : {
        'circle-radius': 5,
        'circle-color': '#ffd152',
        'circle-opacity' : 1
      }
    });

    //Innudation Levels
    createInnudationLayers(map);

  //Testing adding an image
  //We can add images in the same way we add layers, we just need a way to programmatically add layers/images
//   map.addSource('test_image', {
//    type: 'image',
//    url: 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
//    coordinates: [
//     [-80.425, 46.437],
//     [-71.516, 46.437],
//     [-71.516, 37.936],
//     [-80.425, 37.936]
//   ]
// });
//   map.addLayer({
//     id: 'test_image',
//     type: 'raster',
//     source: 'test_image',
//     paint: {"raster-opacity": 0.85}
//   })
    /* HERE IS WHERE YOU ADD A NEW DATA LAYER
     map.addSource('_______________', {
        type: 'vector',
        url: '_____________'
    });
    map.addLayer({
        'id': '     ',
        'type': 'fill',
        'source': '        ',
        'source-layer': '           ',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-outline-color': '#     ',
            'fill-color': {
                property: '         ',
                stops: [
                    [33, '#     '],
                    [94, '#     ']
                ]
            },
            'fill-opacity': 0.6
        }
    }); */


});

/**
 * link layers to buttons to toggle on screen
 */
let toggleableLayerIds = ['Median Income', 'Percent College Educated', 'Percent White Occupancy'];

for (let i = 0; i < toggleableLayerIds.length; i++) {
    let id = toggleableLayerIds[i];
    let link = document.createElement('a');
    link.href = '#';
    link.textContent = id;
    link.onclick = function(e) {
        let clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();
        let visibility = map.getLayoutProperty(clickedLayer, 'visibility');
        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            // hide all layers
            let activeItem = document.getElementsByClassName('active');
            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }
            map.setLayoutProperty('Median Income', 'visibility', 'none');
            map.setLayoutProperty('Percent College Educated', 'visibility', 'none');
            map.setLayoutProperty('Percent White Occupancy', 'visibility', 'none');
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                // createLegend()
        }
    };

    let layers = document.getElementById('menu');
    layers.appendChild(link);
}

function toggleSensors() {
  let visibility = map.getLayoutProperty('Sea_Level_Sensors', 'visibility');
  let slsButton = document.getElementById('sls');
  if (visibility === 'visible') {
    map.setLayoutProperty('Sea_Level_Sensors', 'visibility', 'none');
    map.setLayoutProperty('CriticalRings', 'visibility', 'none');
    map.setLayoutProperty('InstallRings', 'visibility', 'none');
    map.setLayoutProperty('monthLabels', 'visibility', 'none');
    slsButton.style.backgroundColor = '#ffffff';
    slsButton.style.color = '#404040';
  } else {
    map.setLayoutProperty('Sea_Level_Sensors', 'visibility', 'visible');
    map.setLayoutProperty('CriticalRings', 'visibility', 'visible');
    map.setLayoutProperty('InstallRings', 'visibility', 'visible');
    map.setLayoutProperty('monthLabels', 'visibility', 'visible');
    slsButton.style.backgroundColor = '#2ECC71';
    slsButton.style.color = '#ffffff';
  }
}

function toggleGateways() {
  let visibility = map.getLayoutProperty('Flood_Levels', 'visibility');
  let gateways = document.getElementById('gateways');
  if (visibility === 'visible') {
    map.setLayoutProperty('Flood_Levels', 'visibility', 'none');
    gateways.style.backgroundColor = '#ffffff';
    gateways.style.color = '#404040';
  } else {
    map.setLayoutProperty('Flood_Levels', 'visibility', 'visible');
    gateways.style.backgroundColor = '#2ECC71';
    gateways.style.color = '#ffffff';
  }
}

// function createLegend() {
//     // Create the legend and display on the map
//     let legend = document.createElement('div');
//     legend.id = 'ts-map-legend';

//     //plug in lets for each slot replace as needed
//     let tsMapLegendTxtSlot1 = '&gt; 100k';
//     let tsMapLegendTxtSlot2 = '99k-80k';
//     let tsMapLegendTxtSlot3 = '79k-60k';

//     let tsMapLegendSlot1Color = '#f14b3e';
//     let tsMapLegendSlot2Color = '#f18c3e';
//     let tsMapLegendSlot3Color = '#f5c155';

//     //assemble html and place in let
//     let content = [];
//     content.push('<h3 class="ts-map-legend-headline">Legend</h3>');
//     content.push('<p><div class="ts-map-legend-color ts-map-legend-color-red"></div>' + tsMapLegendTxtSlot1 + '</p>');
//     content.push('<p><div class="ts-map-legend-color ts-map-legend-color-orange"></div>' + tsMapLegendTxtSlot2 + '</p>');
//     content.push('<p><div class="ts-map-legend-color ts-map-legend-color-yellow"></div>' + tsMapLegendTxtSlot3 + '</p>');
//     legend.innerHTML = content.join('');
//     legend.index = 1;
// }

/*--------------------------------------------------------------------------------------------------------------------*/
/*  Enable pop ups                                                                                             */
/*--------------------------------------------------------------------------------------------------------------------*/

// When a click event occurs on a tract in the median income layer, open a popup at the
// location of the tract, with description HTML from its properties.
map.on('click', 'Median Income', function(e) {
    let popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    let coordinates = e.lngLat;
    let tract = e.features[0].properties.NAMELSAD;
    let description = e.features[0].properties.MedIncome;
    description = formatter.format(description);

    let popup = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML('<h3>Median Income</h3>' + '<h5>' + tract + ':' + '</h5>' + '<h4>' + description + '</h4>' + '<h6>Georgia Median:   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $52,977<br>Louisiana Median:    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $46,710<br>United States Median: $57,652</h6>')
        .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'Median Income', function() {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'Median Income', function() {
    map.getCanvas().style.cursor = '';
});


/* Percent College Educated */
// When a click event occurs on a tract in the percent college educated layer, open a popup at the
// location of the tract, with description HTML from its properties.
map.on('click', 'Percent College Educated', function(e) {
    let popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    let coordinates = e.lngLat;
    let tract = e.features[0].properties.NAMELSAD;
    let description = e.features[0].properties.PctBachorH;

    let popup = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML('<h3>Percent College Educated</h3>' + '<h5>' + tract + ':' + '</h5>' + '<h4>' + description + '%' + '</h4>' + '<h6>Georgia:  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;29.9%<br>Louisiana:&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;23.4%<br>United States: &nbsp;30.9%</h6>')
        .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'Percent College Educated', function() {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'Percent College Educated', function() {
    map.getCanvas().style.cursor = '';
});

/* Percent White Occupancy */
// When a click event occurs on a tract in the percent White Occupancy layer, open a popup at the
// location of the tract, with description HTML from its properties.
map.on('click', 'Percent White Occupancy', function(e) {
    let popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    let coordinates = e.lngLat;
    let tract = e.features[0].properties.NAMELSAD;
    let description = e.features[0].properties.White_pop;

    let popup = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<h3>Percent White Occupancy</h3>` + '<h5>' + tract + ':' + '</h5>' + '<h4>' + description + '%' + '</h4>' + '<h6>Georgia: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 59.7%<br>Louisiana: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 62.6%<br>United States: &nbsp; 72.4%</h6>')
        .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'Percent White Occupancy', function() {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'Percent White Occupancy', function() {
    map.getCanvas().style.cursor = '';
});

let floodSlider = document.getElementsByClassName('input-range')[0];
let floodValue = document.getElementsByClassName('range-value')[0];

floodSlider.onchange = handlefloodSliderChange;

function handlefloodSliderChange(e) {
    let currentValue = floodValue.innerHTML.split(" ")[0];
    map.setLayoutProperty(currentValue + "ft_flood", 'visibility', 'none');
    floodValue.innerHTML = e.target.value + " ft";
    map.setLayoutProperty(e.target.value + "ft_flood", 'visibility', 'visible');
}

function toggleSatellite() {
    if (style === 0) {
        map.setStyle('mapbox://styles/mapbox/satellite-v9');
        style = 1;
    } else {
        map.setStyle('mapbox://styles/atlmaproom/cjkbg9s6m8njm2roxkx8gprzj');
        style = 0;
    }
    
}