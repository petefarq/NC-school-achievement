// Initialize SVG

var svgWidth = 960;
var svgHeight = 700;

var margin = {
  top: 20,
  right: 40,
  bottom: 120,
  left: 50
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
d3.csv("/assets/data/main_data_final.csv").then(function(data) {

   // Set the names for the x-axis data categories
    var categories  = [data.percent_EDS, 
                        data.poverty_county, 
                        data.median_inc_county, 
                        data.county_poc, 
                        data.children_conc_poverty, 
                        data.no_HSdegree, 
                        data.parent_unemployed, 
                        data.elevated_lead, 
                        data.child_abuse_rate]

    var catLabels = ["% econ disadvantaged students",
                      "county child poverty",
                      "county median income",
                      "county % people of color",
                      "% of county children live in concentrated poverty areas",
                      "% of county heads of household with no HS degree",
                      "% of county children with no workforce member in household",
                      "county substantiated child maltreatment"] 
    
    // Create dropdown for choosing demographic categories
    var options = d3.select("#category").selectAll("option")
      .data(categories)
      .enter().append("option")
      .text(function(data, index) {return catLabels[index]})

      //event listener
    
    
      // Initial Params
      var chosenXAxis = data.percent_EDS;

      // function used for updating x-scale var upon click on axis label
      function xScale(data, chosenXAxis) {
      
        // create scales
      var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.chosenXAxis)-1, d3.max(data, d => d.chosenXAxis)+1])
        .range([0, width]);

      return xLinearScale;
      }
      // function used for updating xAxis var upon click on axis label
      function renderAxes(newXScale, xAxis) {
      var bottomAxis = d3.axisBottom(newXScale);

      xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

      return xAxis;
      }

      // function used for updating circles group with a transition to
      // new circles
      function renderCircles(circlesGroup, newXScale, chosenXaxis) {

      circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

      return circlesGroup;
      }


  // Parse Data/Cast as numbers
    // ==============================
    data.forEach(function(data) {
      data.percent_EDS = +data.percent_EDS;
      data.EOG_18_19 = +data.EOG_18_19;
    });

    // Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.percent_EDS)-1, d3.max(data, d => d.percent_EDS)+1])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.EOG_18_19)+1])
      .range([height, 0]);

    // Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

     // Initialize tool tip
    //==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-5, 0])
      .html(function(d) {
        return (`<u>${d.name}</u><br>EOG Reading/Math: ${d.EOG_18_19}%<br>% Econ Disadvantaged Students: ${d.percent_EDS}%`);
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
        .attr("cx", d => xLinearScale(d.percent_EDS))
        .attr("cy", d => yLinearScale(d.EOG_18_19))
        .attr("r", "5")
        .attr("fill", "green")
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
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "aText")
      .text("Reading/Math End-of-Grade Score 2018/19");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
      .attr("class", "aText")
      .text("% Economically Disadvantaged Students");

    
  }).catch(function(error) {
    console.log(error);
  });

// // x axis labels event listener
// labelsGroup.selectAll("text")
// .on("click", function() {
//   // get value of selection
//   var value = d3.select(this).attr("value");
//   if (value !== chosenXAxis) {

//     // replaces chosenXAxis with value
//     chosenXAxis = value;

//     // console.log(chosenXAxis)

//     // functions here found above csv import
//     // updates x scale for new data
//     xLinearScale = xScale(hairData, chosenXAxis);

//     // updates x axis with transition
//     xAxis = renderAxes(xLinearScale, xAxis);

//     // updates circles with new x values
//     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);



