// Define SVG areas and margins
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2])
      .range([0, width]);
  
    return xLinearScale;
};

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d[chosenYAxis]) * 1.1])
      .range([height, 0]);
  
    return yLinearScale;
};

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
};

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
};

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    
    return circlesGroup;
};

// function used for updating text position
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]) + 4.5);

    return textGroup;
}

// read into data
d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;

    // parse data
    censusData.forEach(x => {
        x.id = +x.id;
        x.poverty = +x.poverty;
        x.healthcare = +x.healthcare;
        x.obesity = +x.obesity;
        x.smokes = +x.smokes;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d[chosenYAxis]) * 1.1])
      .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .attr("fill", "#69b3a2")
      .attr("opacity", "0.7")
      .classed("stateCircle", true);

    // appending initial circles text
    var textGroup = chartGroup.append("g").selectAll("text")
      .data(censusData)
      .enter()
      .append("text")
      .classed("stateText", true)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]) + 4.5)
      .attr("style", "font-size: 12")
      .text((d, i) => d.abbr);

    // create x-axis labels
    var xLabels = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
      
    var povertyLabel = xLabels.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = xLabels.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");
  
    var incomeLabel = xLabels.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income (Median)");
    
    // create event listener for x labels
    xLabels.selectAll("text")
      .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenXAxis) {

              // replaces chosenXAxis with value
              chosenXAxis = value;

              // console.log(chosenXAxis)

              // updates x scale for new data
              xLinearScale = xScale(censusData, chosenXAxis);
            
              // updates x axis with transition
              xAxis = renderXAxes(xLinearScale, xAxis);
            
              // updates circles with new x values
              circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
            
              // updates text
              textGroup = renderText(textGroup, xLinearScale, chosenXAxis);
            
              // updates tooltips with new info
              textGroup = updateToolTip(chosenXAxis, textGroup, chosenYAxis);

              // Updating labels
              if (value === "age") {
                  ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
              }
              else if (value === "income") {
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
                povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
                incomeLabel
                  .classed("active", true)
                  .classed("inactive", false);
              }
              else {
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
                povertyLabel
                  .classed("active", true)
                  .classed("inactive", false);
                incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
          };
      });
    
    // create y-axis labels
    var yLabels = chartGroup.append("g")
      .attr("transform", `translate(${-20}, ${height / 2})`);
    
    var healthcareLabel = yLabels.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", -20)
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = yLabels.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", -40)
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smokes (%)");

    var obeseLabel = yLabels.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", -60)
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("Obese (%)");
    
    // create event listener for x labels
    yLabels.selectAll("text")
      .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {

              // replaces chosenYAxis with value
              chosenYAxis = value;

              // console.log(chosenYAxis)

              // updates x scale for new data
              yLinearScale = xScale(censusData, chosenYAxis);
            
              // updates x axis with transition
              yAxis = renderYAxes(yLinearScale, yAxis);
            
              // updates circles with new x values
              circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
            
              // updates text
              textGroup = renderYText(textGroup, yLinearScale, chosenYAxis);
            
              // updates tooltips with new info
              textGroup = updateYToolTip(chosenYAxis, textGroup, chosenYAxis);

              // Updating labels
              if (value === "healthcare") {
                  healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
              }
              else if (value === "smokes") {
                  healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
              }
              else {
                  healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  obeseLabel
                    .classed("active", true)
                    .classed("inactive", false);
              }
          };
      });

      // Initialize tooltip
      var toolTip = d3.tip() 
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
          return  `${d.state}<br>Poverty: ${d.poverty}<br>Healthcare: ${d.healthcare}<br>`; 
        });

      // Create tooltip in the chart
      chartGroup.call(toolTip);

      // Create event listeners to display and hide the tooltip
      textGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
      })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
});

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, textGroup, chosenYAxis) {

    var label;
  
    if (chosenXAxis === "poverty") {
      label = "Poverty:";
    }
    else if (chosenXAxis === "age") {
      label = "Age:";
    }
    else {
      label = "Household Income:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]} <br>${chosenYAxis}: ${d[chosenYAxis]}<br>`);
      });
  
    chartGroup.call(toolTip);
  
    textGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })

    // on mouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
  
    return textGroup;
};

// function used for updating circles group with new tooltip
function updateYToolTip(chosenYAxis, textGroup, chosenXAxis) {

    var label;
  
    if (chosenYAxis === "healthcare") {
      label = "Healthcare:";
    }
    else if (chosenYAxis === "smokes") {
      label = "Smokes:";
    }
    else {
      label = "Obese:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${chosenXAxis} ${d[chosenXAxis]} <br>${label} ${d[chosenYAxis]}<br>`);
      });
  
    chartGroup.call(toolTip);
  
    textGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })

    // on mouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
  
    return textGroup;
}
