import {createInnudationLayers} from './innudation.js';

// Global Variables
var rectWidth = 730;
var rectHeight = 200;
var leftLong, rightLong, lowerLat, upperLat
var curBearing = 0
var curZoom = 1
var curCenter = [1, 1]
var curGeoCoords, curActiveRectangle, curEndCenters
    //City Coordinates
    //     // Atlanta:
    // var ATLleftCenter = { lng: -84.3880, lat: 33.7490 }
    // var ATLrightCenter = { lng: -82.3880, lat: 33.7490 }
    // NOLA
var leftCenter = { lng: -90.0715, lat: 29.9511 }
var rightCenter = { lng: -90.0715, lat: 29.9511 }
var rc, lc
var currentPoints = null;
var projRatio = 0.5
var zoomAdd = 2.75

var isLocked = false
var selectedCity;

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
var map = new mapboxgl.Map({
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
    var sliderDiv = document.getElementById("range-value");
    sliderDiv.innerHTML = slideAmount;
}

function getPixelCoordinates() {
    // get width & height from current rectangle
    width = rectWidth;
    height = rectHeight;
    // get map center in pixel coordinates
    var center = map.project(map.getCenter());
    // calculate pixel coordinates of corners
    var ur = { "x": (center.x + width / 2), "y": (center.y - height / 2) }; // upper right
    var ul = { "x": (center.x - width / 2), "y": (center.y - height / 2) }; // upper left
    var br = { "x": (center.x + width / 2), "y": (center.y + height / 2) }; // bottom right
    var bl = { "x": (center.x - width / 2), "y": (center.y + height / 2) }; // bottom left
    // return an json of pixel coordinates
    return { "ur": ur, "ul": ul, "br": br, "bl": bl };
}

function getGeoCoordinates() {
    // grab pixel coordinates from helper method
    var pixelCoordinates = getPixelCoordinates();
    // unproject to geographic coordinates
    var ur = map.unproject(pixelCoordinates.ur);
    var ul = map.unproject(pixelCoordinates.ul);
    var br = map.unproject(pixelCoordinates.br);
    var bl = map.unproject(pixelCoordinates.bl);
    // return a json of geographic coordinates
    return { "ur": ur, "ul": ul, "br": br, "bl": bl };
}

function getEndCenters() {
    var height = rectHeight;
    // get upper right & upper left pixels
    var pixelCoordinates = getPixelCoordinates();
    var ur = pixelCoordinates.ur;
    var ul = pixelCoordinates.ul;
    // calculate pixel coordinates for right & left center
    var rcPixel = { "x": (ur.x - height / 2), "y": (ur.y + height / 2) };
    var lcPixel = { "x": (ul.x + height / 2), "y": (ul.y + height / 2) };
    var rc = map.unproject(rcPixel);
    var lc = map.unproject(lcPixel);
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


/**
 * adds BeltLine and data layer sources from MapBox GL Studio
 * and then adds the layers to the map to be toggled
 */
map.on('load', function() {
    var nav = new mapboxgl.NavigationControl({
        showCompass: true
    });
    var scale = new mapboxgl.ScaleControl({
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
var toggleableLayerIds = ['Median Income', 'Percent College Educated', 'Percent White Occupancy'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = id;
    link.onclick = function(e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();
        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            // hide all layers
            var activeItem = document.getElementsByClassName('active');
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

    var layers = document.getElementById('menu');
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
//     var legend = document.createElement('div');
//     legend.id = 'ts-map-legend';

//     //plug in vars for each slot replace as needed
//     var tsMapLegendTxtSlot1 = '&gt; 100k';
//     var tsMapLegendTxtSlot2 = '99k-80k';
//     var tsMapLegendTxtSlot3 = '79k-60k';

//     var tsMapLegendSlot1Color = '#f14b3e';
//     var tsMapLegendSlot2Color = '#f18c3e';
//     var tsMapLegendSlot3Color = '#f5c155';

//     //assemble html and place in var
//     var content = [];
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
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    var coordinates = e.lngLat;
    var tract = e.features[0].properties.NAMELSAD;
    var description = e.features[0].properties.MedIncome;
    description = formatter.format(description);

    var popup = new mapboxgl.Popup()
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
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    var coordinates = e.lngLat;
    var tract = e.features[0].properties.NAMELSAD;
    var description = e.features[0].properties.PctBachorH;

    var popup = new mapboxgl.Popup()
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
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    var coordinates = e.lngLat;
    var tract = e.features[0].properties.NAMELSAD;
    var description = e.features[0].properties.White_pop;

    var popup = new mapboxgl.Popup()
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
    floodValue.innerHTML = e.target.value;
}