// Create a map object
var myMap = L.map("map", {
    center: [35.2, -79.79],
    zoom: 8
});
  
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
}).addTo(myMap);

// Add county boundaries
d3.json("NC_Counties.geojson", function(data) {
 
  //county_colors = d3.csv("county_tier_colors.csv");

  function onEachFeature(feature, layer) {
    
    //Adds county names to county as a tooltip
    layer.bindTooltip(feature.properties.CO_NAME,
    {className: 'countyLabel', permanent: true, direction:"center", opacity: 1})
  };

  function style(feature) {
  
        
      return {
          fillColor: "white",
          fillOpacity: 0,
          weight: 1,
          opacity: 1,
          color: "white"
      }
  }
  
  L.geoJson(data, {onEachFeature: onEachFeature, style: style, color:"white",interactive: false}).addTo(myMap).openTooltip();

}); 

// Add school circles

// These will be shading for circles, based on EOG score quintile
const eog_color = ['#1a9641','#4575b4','#fcae91','#fb6a4a','#a50f15'];

d3.json("prelim_schools_gj.geojson", function(data) {

  createFeatures(data.features)
});

function createFeatures(schoolData) {

  function onEachFeature(feature) {
        // Conditionals for circle color based on EOG Quintile        
        
        color = eog_color[(feature.properties.EOG_quintile-1)];
        fillcolor = color;
        
        // Add circles to map with popup
        L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            fillOpacity: .7,
            color: color,
            opacity: .6,
            fillColor: fillcolor,
            radius: 1000
            }).bindPopup(("<p><strong>" + feature.properties.name + "</strong><br>" +
                        feature.properties.district + "<br>" +
                        "EOG 2018/2019: "  + feature.properties.EOG_18_19 + "%" + "<br>" +
                        "SP Grade: "  + feature.properties.SPgrade + "<br>" +
                        "% Econ Disadvataged Students: "  + feature.properties.percent_EDS + "%" +  "<br>" +
                        "County Median Income: " + feature.properties.median_inc_county + "<br>" +
                        "County Poverty: " + feature.properties.poverty_county + "%" + "<br>" +
                        "County Tier: "  + feature.properties.county_tier + "</p>"),{className: 'custom'})
            .addTo(myMap);
  }
  
  L.geoJSON(schoolData, {
    onEachFeature: onEachFeature
  });
};

// Add legend

var legend = L.control({ position: "bottomleft" });

legend.onAdd = function() {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += `<span>Combined Reading/Math End of Grade Score<span><br>`
  div.innerHTML += `<i style="background: ${eog_color[0]}"></i><span>80%-100%</span><br>`;
  div.innerHTML += `<i style="background: ${eog_color[1]}"></i><span>60%-79%</span><br>`;
  div.innerHTML += `<i style="background: ${eog_color[2]}"></i><span>40%-59%</span><br>`;
  div.innerHTML += `<i style="background: ${eog_color[3]}"></i><span>20%-39%</span><br>`;
  div.innerHTML += `<i style="background: ${eog_color[4]}"></i><span>0%-19%</span><br>`;
    
  return div;
};

legend.addTo(myMap);

// Add Title
var title = L.control({ position: "topright" });

title.onAdd = function() {
  var div = L.DomUtil.create("div", "pageTitle");
  div.innerHTML += `<span">NC School Academic Performance 2018/19</span>`;
  return div;
};

title.addTo(myMap);

