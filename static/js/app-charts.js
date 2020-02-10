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
d3.csv("/static/data/main_data_final.csv").then(function(data) {

   // Set the names for the x-axis data categories
    var categories  = [data.percent_EDS, 
                       data.poverty_county, 
                       data.median_inc_county, 
                       data.county_poc, 
                       data.children_conc_poverty, 
                       data.no_HSdegree, 
                       data.parent_unemployed]

    var catLabels = ["% econ disadvantaged students",
                      "county child poverty",
                      "county median income",
                      "county % people of color",
                      "% of county children living in concentrated poverty areas",
                      "% of county heads of household with no HS degree",
                      "% of county children with no workforce member in household"] 
    
    // Create dropdown for choosing demographic categories
    var options = d3.select("#category").selectAll("option")
      .data(categories)
      .enter().append("option")
      .text(function(data, index) {return catLabels[index]})

    // Parse Data/Cast as numbers
    // ==============================
    data.forEach(function(data) {
        data.percent_EDS = +data.percent_EDS;
        data.EOG_18_19 = +data.EOG_18_19;
        data.poverty_county = +data.poverty_county;
        data.median_inc_county = +data.median_inc_county;
        data.county_poc = +data.county_poc;
        data.children_conc_poverty = +data.children_conc_poverty;
        data.no_HSdegree = +data.no_HSdegree;
        data.parent_unemployed = +data.parent_unemployed
    });

    // Initial Params
    var chosenXAxis = data.percent_EDS

    // Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => chosenXAxis) - 1, d3.max(data, d => chosenXAxis)+1])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.EOG_18_19)+1])
      .range([height, 0]);

    // Create axis functions
    // ==============================
    var xAxis = d3.axisBottom(xLinearScale);
    var yAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    chartGroup.append("g")
      .call(yAxis);

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
        .attr("cx", d => xLinearScale(chosenXAxis))
        .attr("cy", d => yLinearScale(d.EOG_18_19))
        .attr("r", "5")
        .attr("fill", "steelblue")
        .attr("opacity", .3)
        .attr("stroke", "black")
        .attr("stroke-width","0")
        .on('mouseover', function(d) {
          d3.select(this).style('stroke-width','4');
          toolTip.show(d);
        })
        .on('mouseout', function(d) {
          d3.select(this).style('stroke-width','0');
          toolTip.hide(d);
        })

    // Create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "aText")
        .text("Reading/Math End-of-Grade Score 2018/19");

    //-- Functions and event listener for updating chart after a dropdown choice ----

    // function used for updating x-scale var upon click on dropdown choice
    function xScale(data, chosenXAxis) {

        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(data, d => chosenXAxis) - 1, d3.max(data, d => chosenXAxis) + 1])
            .range([0, width]);

        return xLinearScale;
    }

    // function used for updating xAxis var upon click on dropdown choice
    function renderAxes(newXScale) {
        var xAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(xAxis);

        return xAxis;
    }

    // function used for updating circles group with a transition to
    // new circles upon click on dropdown choice
    function renderCircles(circlesGroup, newXScale, chosenXaxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]));

        return circlesGroup;
    }

   var select = d3.select("#category1")
        .on("change", function () {
            chosenXaxis = this.value;

            xScale(data, chosenXAxis);

            renderAxes(newXScale, xAxis);

            renderCircles(circlesGroup, newXScale, chosenXaxis);

        })

  }).catch(function(error) {
    console.log(error);
  });




