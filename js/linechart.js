
var myData = "date	New York	San Francisco	Austin\n\
20111001	63.4	62.7	72.2\n\
20111002	58.0	59.9	67.7\n\
20111003	53.3	59.1	69.4\n\
20111004	55.7	58.8	68.0\n\
20111005	64.2	58.7	72.4\n\
20111006	58.8	57.0	77.0\n\
20111007	57.9	56.7	82.3\n\
20111008	61.8	56.8	78.9\n\
20111009	69.3	56.7	68.8\n\
20111010	71.2	60.1	68.7\n\
20111011	68.7	61.1	70.3\n\
20111012	61.8	61.5	75.3\n\
20111013	63.0	64.3	76.6\n\
20111014	66.9	67.1	66.6\n\
20111015	61.7	64.6	68.0\n\
20111016	61.8	61.6	70.6\n\
20111017	62.8	61.1	71.1\n\
20111018	60.8	59.2	70.0\n\
20111019	62.1	58.9	61.6\n\
20111020	65.1	57.2	57.4\n\
20111021	55.6	56.4	64.3\n\
20111022	54.4	60.7	72.4\n";

var margin = {
    top: 20,
    right: 250,
    bottom: 30,
    left: 100
},
    width = 1400 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3v4.timeParse("%Y-%m-%d");

var x = d3v4.scaleTime()
    .range([0, width]);

var y = d3v4.scaleLinear()
    .range([height, 0]);

var color = d3v4.scaleOrdinal(d3v4.schemeCategory10);

var xAxis = d3v4.axisBottom(x);

var yAxis = d3v4.axisLeft(y);

var line = d3v4.line()
    .curve(d3v4.curveBasis)
    .x(function (d) {
        return x(d.date);
    })
    .y(function (d) {
        return y(d.temperature);
    });


async function _data() {
    console.log('requesting Data!');
    return d3v4.csv("data/fredgraph.csv");
}

function build_graph(data) {
    var svg = d3v4.select("#linechart-box").append("svg")
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 960 500")
        .attr("margin", "auto")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(d3v4.keys(data[0]).filter(function (key) {
        return key !== "date";
    }));


    data.forEach(function (d) {
        d.date = parseDate(d.date);
    });

    var cities = color.domain().map(function (name) {
        return {
            name: name,
            values: data.map(function (d) {
                return {
                    date: d.date,
                    temperature: +d[name]
                };
            })
        };
    });

    x.domain(d3v4.extent(data, function (d) {
        return d.date;
    }));

    y.domain([
        d3v4.min(cities, function (c) {
            return d3v4.min(c.values, function (v) {
                return v.temperature;
            });
        }),
        d3v4.max(cities, function (c) {
            return d3v4.max(c.values, function (v) {
                return v.temperature;
            });
        })
    ]);

    var legend = svg.selectAll('g')
        .data(cities)
        .enter()
        .append('g')
        .attr('class', 'legend');

    legend.append('rect')
        .attr('x', 400)
        .attr('y', function (d, i) {
            return i * 20;
        })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function (d) {
            return color(d.name);
        });

    legend.append('text')
        .attr('x', 400 + 16)
        .attr('y', function (d, i) {
            return (i * 20) + 9;
        })
        .attr('font-size', '2em')
        .text(function (d) {
            return d.name;
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperature (??F)");

    var city = svg.selectAll(".city")
        .data(cities)
        .enter().append("g")
        .attr("class", "city");


    city.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        .attr("stroke-width", 3)
        .style("stroke", function (d) {
            return color(d.name);
        });

    // city.append("text")
    //     .datum(function (d) {
    //         return {
    //             name: d.name,
    //             value: d.values[d.values.length - 1]
    //         };
    //     })
    //     .attr("transform", function (d) {
    //         return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
    //     })
    //     .attr("x", 3)
    //     .attr("dy", ".35em")
    //     .text(function (d) {
    //         return d.name;
    //     });

    var mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(cities)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", function (d) {
            return color(d.name);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    mousePerLine.append("text")
        .attr("transform", "translate(10,3)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', width) // can't catch mouse events on a g element
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function () { // on mouse out hide line, circles and text
            d3v4.select(".mouse-line")
                .style("opacity", "0");
            d3v4.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
            d3v4.selectAll(".mouse-per-line text")
                .style("opacity", "0");
        })
        .on('mouseover', function () { // on mouse in show line, circles and text
            d3v4.select(".mouse-line")
                .style("opacity", "1");
            d3v4.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3v4.selectAll(".mouse-per-line text")
                .style("opacity", "1");
        })
        .on('mousemove', function () { // mouse moving over canvas
            var mouse = d3v4.mouse(this);
            d3v4.select(".mouse-line")
                .attr("d", function () {
                    var d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                });

            d3v4.selectAll(".mouse-per-line")
                .attr("transform", function (d, i) {
                    // console.log(width / mouse[0])
                    var xDate = x.invert(mouse[0]),
                        bisect = d3v4.bisector(function (d) { return d.date; }).right;
                    idx = bisect(d.values, xDate);

                    d3v4.select(this).select('text')
                        .text(d.values[idx].temperature);

                    return "translate(" + mouse[0] + "," + y(d.values[idx].temperature) + ")";
                });
        });

    // for (var i = 0; i < lines.length; i++) {
    //     const lineLength = lines[i].getTotalLength();
    //     d3v4.select(lines[i])
    //         .attr("stroke-dasharray", lineLength + " " + lineLength)
    //         .attr("stroke-dashoffset", lineLength)
    //         .transition()
    //         .duration(7000)
    //         .ease(d3v4.easeQuadOut)
    //         .attr("stroke-dashoffset", 0);
    // }

    // var year_svg = d3v4.select("#linechart-year").append("svg")
    //     .attr("width", 500)
    //     .attr("height", 100)
    //     .append("g")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // var year_text = year_svg.append("text")
    //     .attr("x", 50)
    //     .attr("y", 50)
    //     .text("start");

    // year_text.transition()
    //     .tween("text", function () {
    //         var selection = d3v4.select(this);    // selection of node being transitioned
    //         var start = 1983; // start value prior to transition
    //         var end = 2021; // specified end value
    //         var interpolator = d3v4.interpolateNumber(start, end); // d3 interpolator

    //         return function (t) { selection.text("1983-" + Math.round(interpolator(t))); };  // return value

    //     })
    //     .duration(7000)
    //     .ease(d3v4.easeQuadOut);
}

function linechart_animation() {
    var lines = document.getElementsByClassName('line');
    for (var i = 0; i < lines.length; i++) {
        const lineLength = lines[i].getTotalLength();
        d3v4.select(lines[i])
            .attr("stroke-dasharray", lineLength + " " + lineLength)
            .attr("stroke-dashoffset", lineLength)
            .transition()
            .duration(7000)
            .ease(d3v4.easeQuadOut)
            .attr("stroke-dashoffset", 0);
    }

    d3v4.select("#linechart-year > svg").remove();
    var year_svg = d3v4.select("#linechart-year").append("svg")
        .attr("width", 500)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var year_text = year_svg.append("text")
        .attr("x", 50)
        .attr("y", 50)
        .text("start");

    year_text.transition()
        .tween("text", function () {
            var selection = d3v4.select(this);    // selection of node being transitioned
            var start = 1983; // start value prior to transition
            var end = 2021; // specified end value
            var interpolator = d3v4.interpolateNumber(start, end); // d3 interpolator

            return function (t) { selection.text("1983-" + Math.round(interpolator(t))); };  // return value

        })
        .duration(7000)
        .ease(d3v4.easeQuadOut);
}


function line_highlight_blue_red() {
    var lines = document.getElementsByClassName('line');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        console.log(line);
        if (line.__data__.name != "Routine Cognitive" && line.__data__.name != "Non-Routine Manual") {
            line.style.opacity = 0.2;
        } else {
            line.style.opacity = 1.0
        }
    }
}

function line_highlight_yellow() {
    var lines = document.getElementsByClassName('line');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        console.log(line);
        if (line.__data__.name != "Non-Routine Cognitive") {
            line.style.opacity = 0.2;
        } else {
            line.style.opacity = 1.0
        }
    }
}

function line_highlight_green() {
    var lines = document.getElementsByClassName('line');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        console.log(line);
        if (line.__data__.name != "Routine Manual") {
            line.style.opacity = 0.2;
        } else {
            line.style.opacity = 1.0
        }
    }
}

async function main() {
    d3v4.csv("https://raw.githubusercontent.com/6859-sp21/final-project-impact-of-automation-on-labor-markets/main/data/fredgraph.csv", function (data) {
        // console.log(data);
        build_graph(data);
    })
}

main();