// Initialize SVG

var svgWidth = 960;
var svgHeight = 700;

var margin = {
  top: 20,
  right: 40,
  bottom: 120,
  left: 75
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load data
d3.csv("static/data/main_data_final.csv").then(function(data) {
    console.log(data);
   // Set the names for the x-axis data categories
    var categories  = ["percent_EDS", 
                       "poverty_county", 
                       "median_inc_county", 
                       "county_poc", 
                       "children_conc_pov", 
                       "No_HSdegree", 
                       "parent_unemployed"]

    var catLabels = ["% Economically Disadvantaged Students",
                      "County Child Poverty Rate",
                      "County Median Income",
                      "County % People of Color",
                      "% of County's Children in Concentrated Poverty Tracts",
                      "% of County Heads of Household Without HS Degree",
                      "% of County Children with no Household Member in Workforce"] 
    
    // Create dropdown for choosing demographic categories
    var options = d3.select("#category").selectAll("option")
        .data(categories)
        .enter().append("option")
        .attr("value", function(data, index) {return data})
      .text(function(data, index) {return catLabels[index]})

    // Parse Data/Cast as numbers
    // ==============================
    data.forEach(function(data) {
        data.percent_EDS = +data.percent_EDS;
        data.EOG_18_19 = +data.EOG_18_19;
        data.poverty_county = +data.poverty_county;
        data.median_inc_county = +data.median_inc_county;
        data.county_poc = +data.county_poc;
        data.children_conc_pov = +data.children_conc_pov;
        data.No_HSdegree = +data.No_HSdegree;
        data.parent_unemployed = +data.parent_unemployed
    });

    // Initial Params
    var chosenXAxis = 'percent_EDS'

    // Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) - 1, d3.max(data, d => d[chosenXAxis]) + 1])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.EOG_18_19)+1])
      .range([height, 0]);

    // Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var yAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    // ==============================
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(yAxis);

   

    // functions to add gridlines
    function make_x_gridlines() {
        return d3.axisBottom(xLinearScale)
            .ticks(5)
    }

    function make_y_gridlines() {
        return d3.axisLeft(yLinearScale)
            .ticks(5)
    }

    // add the X gridlines
   var xGridlines = chartGroup.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        )

    // add the Y gridlines
    chartGroup.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
            )

     // Initialize tool tip
    //==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-5, 0])
      .html(function(d) {
          return (`<u>${d.name}</u>
                <br>County: ${d.county}
                <br>District: ${d.district}
                <br>EOG Reading/Math: ${d.EOG_18_19}%
                <br>% Econ Disadvantaged Students: ${d.percent_EDS}%`);
      });

    // Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

 
      // Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.EOG_18_19))
        .attr("r", "5")
        .attr("fill", "steelblue")
        .attr("opacity", .3)
        .attr("stroke", "steelblue")
        .attr("stroke-width","0")
        .on('mouseover', function(d) {
          d3.select(this).style('stroke-width','4');
          toolTip.show(d);
        })
        .on('mouseout', function(d) {
          d3.select(this).style('stroke-width','0');
          toolTip.hide(d);
        })

    // Create y axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "aText")
        .text("End-of-Grade Score 2018/19");


    // Event listener and function for re-drawing chart with dropdown change
    var select = d3.select("#category")
        .on("change", function () {
            var chosen = this.value;
            var newScale = d3.scaleLinear()
                .domain([d3.min(data, d => d[chosen]), d3.max(data, d => d[chosen])])
                .range([0, width]);

            var bottomAxis = d3.axisBottom(newScale);

            // functions to add gridlines
            function make_x_gridlines() {
                return d3.axisBottom(newScale)
                    .ticks(5)
            }
            
            xAxis.transition()
                .duration(1000)
                .call(bottomAxis)

            xGridlines.transition()
                .duration(1000)
                .attr("class", "grid")
                .call(make_x_gridlines()
                    .tickSize(-height)
                    .tickFormat(""));

            circlesGroup.transition()
                .duration(1000)
                .attr("cx", d => newScale(d[chosen]));
        })

  }).catch(function(error) {
      console.log(error);
      throw error;
  });




