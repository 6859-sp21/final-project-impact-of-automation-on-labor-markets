
var data_ai_path = "https://raw.githubusercontent.com/6859-sp21/final-project-impact-of-automation-on-labor-markets/main/07_treemap%20chart/data_webb_pct_ai_g.json"
var data_robot_path = "https://raw.githubusercontent.com/6859-sp21/final-project-impact-of-automation-on-labor-markets/main/07_treemap%20chart/data_webb_pct_robot_g.json"


// code base from here https://www.d3-graph-gallery.com/graph/treemap_custom.html
// tooltip code http://bl.ocks.org/ndobie/90ae9f1a5c7f88ad4929  // not used
// tooltip code from here: https://bl.ocks.org/d3noob/a22c42db65eb00d4e369

// button code: https://www.d3-graph-gallery.com/graph/barplot_button_color.html // not used
// button code: https://www.d3-graph-gallery.com/graph/interactivity_button.html // not used
// https://www.d3-graph-gallery.com/graph/barplot_button_data_simple.html // used this

// set the dimensions and margins of the graph
var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 1300 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var tool = d3v4.select("#my_dataviz").append("div").attr("class", "toolTip");

// append the svg object to the body of the page
var svg = d3v4.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

function wrap(text, width) {
    text.each(function () {
        var text = d3v4.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
        }
    });
}

// read json data
function update(data_path) {
    d3v4.json(data_path, function (data) {

        // Give the data to this cluster layout:
        var root = d3v4.hierarchy(data).sum(function (d) { return d.value }) // Here the size of each leave is given in the 'value' field in input data

        // Then d3v4.treemap computes the position of each element of the hierarchy
        d3v4.treemap()
            .size([width, height])
            .paddingTop(28)
            .paddingRight(7)
            .paddingInner(3)      // Padding between each rectangle
            //.paddingOuter(6)
            //.padding(20)
            (root)

        // prepare a color scale
        var color = d3v4.scaleOrdinal()
            .domain(["boss1", "boss2", "boss3"])
            .range(["#402D54", "#D18975", "#8FD175"])

        // prepare a color scale
        var color2 = d3v4.scaleOrdinal()
            .domain(["very low", "low", "low to medium", "medium to high", "high", "very high"])
            .range(["#2e7f18", "#45731e", "#675e24", "#8d472b", "#b13433", "#c82538"])


        var color3 = d3v4.scaleOrdinal()
            .domain(["very low", "low", "low to medium", "medium to high", "high", "very high"])
            .range(['#e6eff9', '#c9e2f5', '#95cbee', '#0098db', '#0079ae']);


        // https://www.schemecolor.com/green-to-red-gradient.php

        // And a opacity scale
        var opacity = d3v4.scaleLinear()
            .domain([10, 30])
            .range([.5, 1])

        // Define the div for the tooltip
        var div = d3v4.select("body").append("div")
            .attr("class", "tooltip squaire-tooltip")
            .style("opacity", 0);

        // use this information to add rectangles:
        svg
            .selectAll("rect")
            .data(root.leaves())
            .enter()
            .append("rect")
            .attr('x', function (d) { return d.x0; })
            .attr('y', function (d) { return d.y0; })
            .attr('width', function (d) { return d.x1 - d.x0; })
            .attr('height', function (d) { return d.y1 - d.y0; })
            .style("stroke", "black")
            .style("fill", function (d) {
                console.log(d.data);
                return color2(d.data.coloring);
            })
            .style("opacity", function (d) { return opacity(d.data.value) })
            .on("mouseover", function (d) {
                div.transition()
                    .duration(100)
                    .style("opacity", .9);
                div.html(d.data.name + "<br /> Number of workers: " + d.data.value + "<br /> AI exposure: " + d.data.pct_ai_g + "<br /> Robot exposure: " + d.data.pct_robot_g + "<br /> Software exposure: " + d.data.pct_sw_g)
                    .style("left", (d3v4.event.pageX) + "px")
                    .style("top", (d3v4.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })


        // and to add the text labels

        svg
            .selectAll("text")
            .data(root.leaves())
            .enter()
            .append("text")
            .attr("x", function (d) { return d.x0 + 5 })    // +10 to adjust position (more right)
            .attr("y", function (d) { return d.y0 + 5 })    // +20 to adjust position (lower)
            //.text(function(d){ return d.data.name.replace('mister_','') })
            .text(function (d) {
                if (d.data.value < 3000000)
                    return '';
                else
                    return d.data.name;
            })
            .call(wrap, 50)
            .attr("font-size", "9px")
            .attr("fill", "white")

        // Add title for the 3 groups
        svg
            .selectAll("titles")
            .data(root.descendants().filter(function (d) { return d.depth == 1 }))
            .enter()
            .append("text")
            .attr("x", function (d) { return d.x0 })
            .attr("y", function (d) { return d.y0 + 21 })
            .text(function (d) { return d.data.name })
            .attr("font-size", "19px")
        //.attr("fill",  function(d){ return color(d.data.name)} )

        // Add title for the 3 groups
        svg
            .append("text")
            .attr("x", 0)
            .attr("y", 14)    // +20 to adjust position (lower)
            .html("Occupations by Typical Entry Level Education; <br/> size proportional to number of workers, color based on exposure to technology (here robots)")
            .attr("font-size", "19px")
            .attr("fill", "grey")

    })
}

update(data_robot_path);


/*

// This function is called by the buttons on top of the plot
function changeColor(color){
        svg.selectAll("rect")
            .data(root.leaves())
            .enter()
            .transition()
            .duration(1000)
            .append("rect")
            .style("fill", function (d) { return color })
        //.attr("stroke", function(d) { return myColor(d.properties.p2); })
        //.style("fill", color)
    }




*/

/*
  // and to add the text labels
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
      .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
      //.text(function(d){ return d.data.name.replace('mister_','') })
      .text(function (d) {
            if(d.data.name.length > 5)
                return d.data.name.substring(0,5)+'...';
             else
                return d.data.name;
        })
      .attr("font-size", "19px")
      .attr("fill", "white")

  // and to add the text labels
  svg
    .selectAll("vals")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
      .attr("y", function(d){ return d.y0+35})    // +20 to adjust position (lower)
      .text(function(d){ return d.data.value })
      .attr("font-size", "11px")
      .attr("fill", "white")
*/
