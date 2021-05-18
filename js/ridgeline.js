// set the dimensions and margins of the graph
var margin = { top: 80, right: 30, bottom: 50, left: 200 },
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3v4.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//read data
d3v4.csv("https://raw.githubusercontent.com/6859-sp21/final-project-impact-of-automation-on-labor-markets/main/data/ridgeline_data.csv", function (data) {

    // List of groups (here I have one group per column)
    var allGroup = d3v4.map(data, function (d) { return (d.risk) }).keys()

    // add the options to the button
    d3v4.select("#selectButton")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // Get the different categories and count them
    //var categories = ["NoFormal","HighSchool","SomeCollege","Associate","Bachelor","Master"]
    var categories = ["No formal educational credential", "High school diploma", "Some college or postsecondary nondegree", "Associate's degree", "Bachelor's degree", "Master's or doctoral degree"]
    var n = categories.length

    // Compute the mean of each group
    allMeans = []
    for (i in categories) {
        currentGroup = categories[i]
        mean = d3v4.mean(data
            .filter(function (d) { return d.risk == "AI EXPOSURE" }), function (d) { return +d[currentGroup] })
        allMeans.push(mean)
    }

    // Create a color scale using these means.
    //var myColor = d3v4.scaleSequential()
    //  .domain([30,50])
    //  .interpolator(d3v4.interpolateViridis);
    var myColor = d3v4.scaleSequential(d3v4.interpolateBlues)
        .domain([10, 65]);
    //colors = ['#e6eff9', '#c9e2f5', '#95cbee', '#0098db', '#0079ae']

    // Add X axis
    var x = d3v4.scaleLinear()
        .domain([-10, 120])
        .range([0, width]);
    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3v4.axisBottom(x).tickValues([0, 25, 50, 75, 100]).tickSize(-height))
        .select(".domain").remove()

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .text("Risk percentile");

    // Create a Y scale for densities
    var y = d3v4.scaleLinear()
        .domain([0, 0.25])
        .range([height, 0]);

    // Create the Y axis for names
    var yName = d3v4.scaleBand()
        .domain(categories)
        .range([0, height])
        .paddingInner(1)
    svg.append("g")
        .call(d3v4.axisLeft(yName).tickSize(0))
        .select(".domain").remove()

    // Compute kernel density estimation for each column:
    var kde = kernelDensityEstimator(kernelEpanechnikov(9), x.ticks(40)) // increase this 40 for more accurate density.
    var allDensity = []
    for (i = 0; i < n; i++) {
        key = categories[i]
        density = kde(data
            .filter(function (d) { return d.risk == "AI EXPOSURE" })
            .map(function (d) { return d[key]; }))
        allDensity.push({ key: key, density: density })
    }

    // tooltip
    var div = d3v4.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);

    // Add areas
    var curve = svg.selectAll("areas")
        .data(allDensity)
        .enter()
        .append("path")
        .attr("transform", function (d) { return ("translate(0," + (yName(d.key) - height) + ")") })
        .on('mouseover', function (d, i) {
            d3v4.select(this).transition()
                .duration('50')
                .attr('opacity', '.85')
        })
        .on('mouseout', function (d, i) {
            d3v4.select(this).transition()
                .duration('50')
                .attr('opacity', '0.7')
        })
        .attr("fill", function (d) {
            grp = d.key;
            index = categories.indexOf(grp)
            value = allMeans[index]
            return myColor(value)
        })
        .datum(function (d) { return (d.density) })
        .attr("opacity", 0.7)
        .attr("stroke", "#000")
        .attr("stroke-width", 0.1)
        .attr("d", d3v4.line()
            .curve(d3v4.curveBasis)
            .x(function (d) { return x(d[0]); })
            .y(function (d) { return y(d[1]); })
        )
    //Our new hover effects


    // A function that update the chart when slider is moved?
    function updateChart(selectedGroup) {
        // recompute density estimation
        //kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40))
        //var density =  kde( data
        //  .filter(function(d){ return d.Species == selectedGroup})
        //  .map(function(d){  return +d.Sepal_Length; })
        //)

        // Re-Compute the mean of each group
        allMeans = []
        for (i in categories) {
            currentGroup = categories[i]
            mean = d3v4.mean(data
                .filter(function (d) { return d.risk == selectedGroup }), function (d) { return +d[currentGroup] })
            allMeans.push(mean)
        }

        kde = kernelDensityEstimator(kernelEpanechnikov(9), x.ticks(40)) // increase this 40 for more accurate density.
        var allDensity = []
        for (i = 0; i < n; i++) {
            key = categories[i]
            density = kde(data
                .filter(function (d) { return d.risk == selectedGroup })
                .map(function (d) { return d[key]; }))
            allDensity.push({ key: key, density: density })
        }



        // update the chart // from code example 
        //curve
        //  .datum(density)
        //  .transition()
        //  .duration(1000)
        //  .attr("d",  d3v4.line()
        //    .curve(d3v4.curveBasis)
        //      .x(function(d) { return x(d[0]); })
        //      .y(function(d) { return y(d[1]); })
        //  );
        //curve = svg.selectAll("areas")
        //  .data(allDensity)

        //curve.exit().remove()
        console.log(data);

        curve
            .data(allDensity)
            //.enter()
            //.append("path")
            .attr("transform", function (d) { return ("translate(0," + (yName(d.key) - height) + ")") })
            .attr("fill", function (d) {
                grp = d.key;
                index = categories.indexOf(grp)
                value = allMeans[index]
                return myColor(value)
            })
            .datum(function (d) { return (d.density) })
            .transition()
            .duration(400)
            .attr("opacity", 0.7)
            .attr("stroke", "#000")
            .attr("stroke-width", 0.1)
            .attr("d", d3v4.line()
                .curve(d3v4.curveBasis)
                .x(function (d) { return x(d[0]); })
                .y(function (d) { return y(d[1]); })
            )

    }

    // Listen to the slider?
    d3v4.select("#selectButton").on("change", function (d) {
        selectedGroup = this.value
        updateChart(selectedGroup)
    })

})

// This is what I need to compute kernel density estimation
function kernelDensityEstimator(kernel, X) {
    return function (V) {
        return X.map(function (x) {
            return [x, d3v4.mean(V, function (v) { return kernel(x - v); })];
        });
    };
}
function kernelEpanechnikov(k) {
    return function (v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}

function ridgeline_robot_to_ai() {
    d3v4.select('#selectButton').property('value', 'ROBOT EXPOSURE');
    console.log(d3v4.select('#selectButton'));
    d3v4.select('#selectButton').dispatch("change");
}

	//<button onclick="updateChart('AI EXPOSURE')">AI EXPOSURE</button>
    //<button onclick="updateChart('ROBOT EXPOSURE')">ROBOT EXPOSURE</button>
    //<button onclick="updateChart('SOFTWARE EXPOSURE')">SOFTWARE EXPOSURE</button>
