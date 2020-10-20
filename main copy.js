var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    padding = { top: 10, right: 10, bottom: 10, left: 10 },
    vizWidth = 900,
    vizHeight = 500,
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

// d3.select('body').append('svg')
//     .attr('id','barchart')
//     .attr('width',1400-vizWidth)
//     .attr('height',800)
//     // .attr('transform','translate(0,300)');   

d3.select('body').append('svg')
    .attr('id', 'treemap')
    .attr('width', 800)
    .attr('height', 300)
// .attr('transform','translate(0,-300)');

d3.select('body').append('svg')
    .attr('id', 'piechart')
    .attr('width', 500)
    .attr('height', 500)

var tip1 = d3.select('#tooltip').append('tr').attr('id', 'districts');
var tip2 = d3.select('#tooltip').append('tr').attr('id', 'votes1');
var tip2 = d3.select('#tooltip').append('tr').attr('id', 'votes2');
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
};

function mouseover(data) {
    d3.select(this).transition().duration(300)
        .style('stroke-width', '5');
    drawTooltip(data);
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
    // .then( d=>{
    //     districts.forEach(data=>{
    //         console.log(data);
    //         //todo 生成barchart
    //         barchart.append('rect')
    //         .attr('x',50)
    //         .attr('y',50)
    //         .attr('width',100)
    //         .attr('height',100) 
    //     });
    // }
    // );
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
    .size([700, 280])
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
        return d.data.seat;
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
    .outerRadius(radius-200)
    .innerRadius(radius);

var label = d3.arc()
    .outerRadius(radius-100)
    .innerRadius(radius);

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

    console.log(arc)

    arc.append("text")
        .attr("transform", function (d) {
            return "translate(" + label.centroid(d) +100+ ")";
        })
        .text(function (d) { return d.data.party; });


    arc.append("text")
        .attr("transform", function (d) {
            return "translate(" + path.centroid(d) +100+ ")";
        })
        .text(function (d) { return d.data.percent; });

});
