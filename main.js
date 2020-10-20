var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    padding = { top: 10, right: 10, bottom: 10, left: 10 },
    vizWidth = 900,
    vizHeight = 480,
    plotWidth = vizWidth - margin.left - margin.right,
    plotHeight = vizHeight - margin.top - margin.bottom,
    panelWidth = plotWidth - padding.left - padding.right,
    panelHeight = plotHeight - padding.top - padding.bottom;


var colorBlues = d3.scaleLinear()
    .domain([1, 6])
    .range(["#77ffff", "#2244aa"]);

var colorVoteShare = d3.scaleThreshold()
    .domain([-30, -20, -10, 0, 10, 20, 30, 40, 50])
    .range(["#0000AA", "#3838AF", "#7171C6", "#AAAADD", "#FFDDDD", "#EEB0B0", "#DD8484", "#CC5858", "#BB2C2C", "#AA0000"]);



var viz = d3.select("body").append("svg")
    .classed("viz", true)
    .attr("width", vizWidth)
    .attr("height", vizHeight)
// .attr('transform','translate(0,-300)');

var plot = viz.append("g")
    .attr("class", "plot")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var panel = plot.append("g")
    .attr("class", "panel")
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

var div = d3.select("body").append("div")
    .attr("id", "tooltip")
    .classed('hidden');

viz.append("g")
    .attr("id", "legend")
    .attr("transform", "translate(20, 20)");

viz.append("g")
    .attr("id", "maptitle")
    .attr('font-size', '16px')
    .attr("text-anchor", "middle")
    .attr('transform', 'translate(' + vizWidth / 2 + ',400)')
    .append('text')
    .text('Vote share difference');

d3.select('body').append('svg')
    .attr('id', 'treemap')
    .attr('width', 800)
    .attr('height', 300)
    .attr('transform', 'translate(0,-220)');

d3.select('body').append('svg')
    .attr('id', 'piechart')
    .attr('width', 500)
    .attr('height', 500)
    .style("visibility", "visible")
    .attr('transform', 'translate(30,-520)');


var tip1 = d3.select('#tooltip').append('tr').attr('id', 'districts');
// var tip2 = d3.select('#tooltip').append('tr').attr('id', 'votes1');
// var tip2 = d3.select('#tooltip').append('tr').attr('id', 'votes2');

//Important Functions
function drawTooltip(d) {
    console.log('pop detail');
    var xPosition = d3.event.pageX;
    var yPosition = d3.event.pageY;

    d3.select("#tooltip")
        .classed("hidden", false)
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .style('font-size', '14px')
    d3.select('#districts')
        .text(d.properties.name)
        .style('font-weight', '700');

    d3.select('#votes1')
        .text(data => {
            var party = electionData[d.properties.name].parties[0].party;
            var votes = electionData[d.properties.name].parties[0].votes;
            var percent = votes / electionData[d.properties.name].voters * 100;
            result = party + ' votes: ' + votes + '(' + percent.toFixed(2) + '%)';
            return result;
        })
    d3.select('#votes2')
        .text(data => {
            var party = electionData[d.properties.name].parties[1].party;
            var votes = electionData[d.properties.name].parties[1].votes;
            var percent = votes / electionData[d.properties.name].voters * 100;
            result = party + ' votes: ' + votes + '(' + percent.toFixed(2) + '%)';
            return result;
        })
}

function mouseout() {
    d3.select("#tooltip").classed("hidden", true);
    d3.select("#piechart").classed("hidden", true);
    d3.select(this).transition().duration(300)
        .style('stroke-width', '0.5');

    d3.select("#infoPanel").select("div").remove();
    d3.select("#infoPanel").select("svg").select("g").remove();
    d3.select("#infoPanel").style("visibility", "hidden");
    d3.select("#piechart").style("visibility", "visible");
    d3.select("#linechart").style("visibility", "visible");
};

function mouseover(data) {
    d3.select(this).transition().duration(300)
        .style('stroke-width', '5');
    d3.select("#piechart")
        .style("visibility", "hidden");
    d3.select("#linechart")
        .style("visibility", "hidden");
    drawTooltip(data);
    updateInfoPanel(data);
};

//读取选数据
var electionData;
var parties = [];
var districts = [];
function getElectionData() {
    d3.json('elections2020.json').then(data => {
        electionData = data;
        for (district in data) {
            districts.push(district);
        }
    })
}
getElectionData();

d3.json("ge2020.json").then(function (sg) {
    var projection = d3.geoMercator().fitSize([panelWidth, panelHeight], sg),
        geoPath = d3.geoPath(projection);
    var areas = panel.selectAll("path")
        .data(sg.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .classed("area", true)
        .style('fill', d => {
            var percent1 = electionData[d.properties.name].parties[0].votes / electionData[d.properties.name].voters;
            var percent2 = electionData[d.properties.name].parties[1].votes / electionData[d.properties.name].voters;
            percent = percent1 - percent2;
            return colorVoteShare(percent * 100);
        })
        .style('stroke-width', '0.5')
        .style('stroke', 'white')
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);
});


//绘制legend
var legenddata = [-30, -20, -10, 0, 10, 20, 30, 40, 50]
legenddata.reverse().forEach(updateLegend);
function updateLegend(data) {
    let i = legenddata.indexOf(data);
    d3.select("#legend")
        .append('rect')
        .transition()
        .duration(1000)
        .attr("x", 0)
        .attr("y", i * 22)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", colorVoteShare(data));

    d3.select("#legend")
        .append("text")
        .transition()
        .duration(1000)
        .attr("x", 30)
        .attr("y", i * 22 + 13)
        .attr("font-size", "14px")
        .text(data + "%")
}



d3.select("#legend")
.append('rect')
.transition()
.duration(1000)
.attr("x", 0)
.attr("y", 10 * 22)
.attr("width", 20)
.attr("height", 20)
.style("fill", "#AA0000")
.attr('opacity', 0.7);

d3.select("#legend")
.append("text")
.transition()
.duration(1000)
.attr("x", 30)
.attr("y", 10 * 22 + 13)
.attr("font-size", "14px")
.text("PAP")

d3.select("#legend")
.append('rect')
.transition()
.duration(1000)
.attr("x", 0)
.attr("y", 11 * 22)
.attr("width", 20)
.attr("height", 20)
.style("fill", "#0000AA")
.attr('opacity', 0.7);

d3.select("#legend")
.append("text")
.transition()
.duration(1000)
.attr("x", 30)
.attr("y", 11 * 22 + 13)
.attr("font-size", "14px")
.text("WP")




var data = {
    "color": "white",
    "children": [
        {
            "party": "PAP",
            "seat": 93,
            "color": '#AA0000'
        },
        {
            "party": "PSP",
            "seat": 24,
            "color": '#ff7f00'
        },
        {
            "party": "WP",
            "seat": 21,
            "color": '#0000AA'
        },
        {
            "party": "SDP",
            "seat": 11,
            "color": '#984ea3'
        },
        {
            "party": "NSP",
            "seat": 10,
            "color": '#4daf4a'
        },
        {
            "party": "PV",
            "seat": 10,
            "color": '#c2d425'
        },
        {
            "party": "RP",
            "seat": 6,
            "color": '#7d7d7d'
        },
        {
            "party": "RDU",
            "seat": 5,
            "color": '#00f9b4'
        },
        {
            "party": "SDA",
            "seat": 5,
            "color": '#191970'
        },
        {
            "party": "SPP",
            "seat": 5,
            "color": '#fa8072'
        },
        // {
        //     "party": "PPP",
        //     "seat": 1,
        //     "color": '#af8a4a'
        // },
        {
            "party": "INDP1",
            "seat": 10,
            "color": '#90af4a'
        },
    ]
};

var treemapLayout = d3.treemap()
    .size([800, 280])
    .paddingOuter(16)

var rootNode = d3.hierarchy(data)

rootNode.sum(function (d) {
    return d.seat;
});

treemapLayout(rootNode);

var nodes = d3.select('#treemap')
    .selectAll('g')
    .data(rootNode.descendants())
    .enter()
    .append('g')
    .attr('transform', function (d) { return 'translate(' + [d.x0, d.y0] + ')' })

nodes
    .append('rect')
    .transition()
    .duration(1000)
    .attr('width', function (d) { return d.x1 - d.x0; })
    .attr('height', function (d) { return d.y1 - d.y0; })
    .attr("fill", function (d) { return d.data.color; })
    .attr('opacity', 0.6)

nodes
    .append('text')
    .transition()
    .duration(1000)
    .attr('dx', function (d) { return (d.x1 - d.x0) / 4 })
    .attr('dy', function (d) { return (d.y1 - d.y0) / 2.5 })
    .attr('transform', 'scale(1.5)')
    .style('font-size', '10px')
    .text(function (d) {
        return d.data.party;
    })

nodes
    .append('text')
    .transition()
    .duration(1000)
    .style('font-size', '10px')
    .attr('dx', 5)
    .attr('dy', 12)
    .attr('transform', 'scale(1.5)')
    .text(function (d) {
        if (d.data.seat == undefined)
            return null;
        else
            return d.data.seat + " seats";
    })





var svg = d3.select("#piechart"),
    width = svg.attr("width"),
    height = svg.attr("height"),
    radius = Math.min(width, height) / 2.5;

var g = svg.append("g")
    .attr("transform", "translate(" + 300 + "," + height / 2 + ")");

var color = d3.scaleOrdinal(['#AA0000', '#0000AA', '#ff7f00', '#AAAADD', '#e41a1c', '#c2d425', '#7d7d7d', '#00f9b4', '#191970', '#fa8072', '#af8a4a', '#90af4a']);

var pie = d3.pie().value(function (d) {
    return d.percent;
});

var path = d3.arc()
    .outerRadius(radius - 200)
    .innerRadius(radius);

var label = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius - 100);

d3.csv("PieChart.csv").then(function (data) {
    var arc = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function (d) { return color(d.data.party); })
        .transition()
        .duration(1000)
        .attr("fill-opacity", 0.6);

    // console.log(arc)

    arc.append("text")
        .attr("transform", function (d) {
            return "translate(" + label.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function (d) { return d.data.party; });


    arc.append("text")
        .attr("transform", function (d) {
            return "translate(" + path.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function (d) { return d.data.percent + '%'; });

});


function updateInfoPanel(d) {
    d3.select("#infoPanel")
        .style("visibility", "visible");

    var infoPanel = d3.select("#infoPanel")
        .append("div");

    infoPanel
        .append("h2")
        .text(d.properties.name);

    //var district = data[1][d.properties.name];
    //var seatText = (district.seats == 1) ? "-seat SMC" : "-seat GRC"

    var district = electionData[d.properties.name];
    var seatText = (district.seats == 1) ? "-seat SMC" : "-seat GRC"

    infoPanel
        .append("h3")
        .text("(" + district.seats + seatText + " - " + d3.format(",")(district.voters) + " voters )");

    if (district.parties.length == 1) {
        infoPanel.append("h3").text("Walkover - no opposition");
    } else {
        // console.log(district);
        var validVotes = 0;
        district.parties.forEach(function (element) {
            validVotes += element.votes;
        });
        //bar chart
        DrawBarChart(infoPanel, district, validVotes);
        //
        district.parties.forEach(function (element) {
            var votepercentage = d3.format("0.2%")(element.votes / validVotes)

            //infoPanel.append("p").html(element.party + "</b> votes: " + d3.format(",")(element.votes) + " (" + votepercentage + ")");
            infoPanel.append("p").html("<b><img src='imgs/" + element.party.toLowerCase() + ".png' width='24px'> " + element.party + "</b> votes: " + d3.format(",")(element.votes) + " (" + votepercentage + ")");
            element.candidates.forEach(function (item) {
                infoPanel.append("p").html(item);
            })

        })

        //if (district.isSample == true) { infoPanel.append("h3").html("<img src='assets/images/alert.svg' width='15' /> This is the sampling result. To be updated when full results are in.") };
    }
    if (district.parties.length == 2) {
        infoPanel.append("h3").text("Vote percentage difference (PAP vs opposition) (%) = " + d3.format("0.2%")((district.parties[0].votes - district.parties[1].votes) / validVotes));
    } else if (district.parties.length == 3) {
        infoPanel.append("h3").text("Vote percentage difference (PAP vs opposition) (%) = " + d3.format("0.2%")((district.parties[0].votes - district.parties[1].votes - district.parties[2].votes) / validVotes));
    }

}

function DrawBarChart(infoPanel, d, validVotes) {
    var svg = d3.select("#barChartSvg"),
        margin = { top: 20, right: 20, bottom: 30, left: 80 },
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom;

    var tooltip = infoPanel.append("div").attr("class", "toolTip");

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleBand().range([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // d.parties
    var data = [];
    d.parties.forEach(function (element) {
        item = {}
        item["area"] = element.party;
        item["value"] = element.votes;

        data.push(item);

    })



    data.sort(function (a, b) { return a.value - b.value; });

    x.domain([0, d3.max(data, function (d) { return d.value; })]);
    y.domain(data.map(function (d) { return d.area; })).padding(0.1);

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", function (d) { return y(d.area); })
        .transition()
        .duration(1000)
        .attr("width", function (d) { return x(d.value); })
}
drawLineChart();
function drawLineChart() {
    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 30, left: 60 },
        width = 500 - margin.left - margin.right,
        height = 280 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%Y");

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line1
    var valueline = d3.line()
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.close); });

    // define the line2
    var valueline2 = d3.line()
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.other); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("body").append("svg")
        .attr('id', 'linechart')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("LineChartData.csv").then(function (data) {

        // format the data
        data.forEach(function (d) {
            d.date = parseTime(d.date);
            d.close = +d.close;
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function (d) { return d.date; }));
        y.domain([0, d3.max(data, function (d) { return d.close; })]);

        // Add the valueline path.
        svg.append("path")
            .data([data])
            .style('fill', '#ffffff00')
            .attr("class", "line")
            .attr("stroke", "#AA0000")
            .attr("stroke-width", "4")
            .attr('opacity', 0.6).attr("d", valueline);//.styleTween("stroke-dashoffset", function() { return d3.interpolateNumber(10

        // Add the valueline2 path.
        svg.append("path")
            .data([data])
            .style('fill', '#ffffff00')
            .attr("class", "line")
            .attr("stroke", "#AAAADD")
            .attr("stroke-width", "4")
            .attr('opacity', 0.8)
            .attr("d", valueline2)
            .transition()
            .duration(4000)
            .styleTween("stroke-dashoffset", function () { return d3.interpolateNumber(1000, 0); });

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

    });
}


d3.select("#linechart")
    .attr('transform', 'translate(850,-530)')
    .style("visibility", "visible");


d3.select('#linechart').append('g')
    .attr('id', 'linelegend');

d3.select("#linelegend")
    .append('rect')
    .transition()
    .duration(1000)
    .attr("x", 70)
    .attr("y", 22)
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", "#AA0000")
    .attr('opacity', 0.6);

d3.select("#linelegend")
    .append("text")
    .transition()
    .duration(1000)
    .attr("x", 100)
    .attr("y", 22 + 13)
    .attr("font-size", "14px")
    .text('PAP')

d3.select("#linelegend")
    .append('rect')
    .transition()
    .duration(1000)
    .attr("x", 70)
    .attr("y", 44)
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", "#AAAADD")
    .attr('opacity', 0.8);

d3.select("#linelegend")
    .append("text")
    .transition()
    .duration(1000)
    .attr("x", 100)
    .attr("y", 44 + 13)
    .attr("font-size", "14px")
    .text('Other parties')

d3.select('#treemap').append('g')
    .attr('id', 'treetitle');

d3.select('#treetitle').append('text')
    .attr("text-anchor", "middle")
    .attr("x", 400)
    .attr("y", 280)
    .attr("font-size", "16px")
    .text('The number of seats contested')

d3.select("#piechart").append('g')
    .attr('id', 'pietitle');

d3.select('#pietitle').append('text')
    .attr("text-anchor", "middle")
    .attr("x", 305)
    .attr("y", 465)
    .attr("font-size", "16px")
    .text('Vote share')

d3.select("#linechart").append('g')
    .attr('id', 'linetitle');

d3.select('#linetitle').append('text')
    .attr("text-anchor", "middle")
    .attr("x", 280)
    .attr("y", 280)
    .attr("font-size", "14px")
    .text('1955~2020: General Election Results')
