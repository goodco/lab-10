const label_map = {
    'stores':'Number of Stores Worldwide',
    'revenue':'Revenue in Billions of USD'
}

const margin = {top: 30, right: 20, bottom: 30, left: 60}
const width = 1000 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom

const svg = d3.select(".bar-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("role", "graphics-document")
        .attr("aria-label", "Bar chart encoding a ranking of selected leading coffee house chains worldwide. Choose to either group by number of stores worldwide or revenue in billions of U.S. dollars")
        .attr("aria-roledescription", "bar chart")
        .attr("tabindex", "0")
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        

const xScale = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1)

const yScale = d3.scaleLinear()
    .rangeRound([height, 0])

const xAxis = d3.axisBottom(xScale)
const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.format(",.2r"))
    

const yGroup = svg.append("g")
        .attr("class","y-axis")
        .attr("aria-hidden", "true")

const xGroup = svg.append("g")
        .attr("class","x-axis")
        .attr("transform",`translate(0, ${height})`)
        .attr("aria-hidden", "true")
        

const yLabel = svg.append("text")
        .attr("class", "y-axis-label")
        .attr("x", 0)
        .attr("y", 0 - margin.top)
        .attr("dy", "1em")
        .style("text-anchor", "start")

const xLabel = svg.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width-(margin.right))
    .attr("y", height)
    .attr("dx", "2em")
    .style("text-anchor", "start")
        

let type = d3.select("#selection").node().value
let order = d3.select("#sort-button").node().value

function update(data, type){
	
    xScale.domain(data.map(d => d.company))
    yScale.domain([0, d3.max(data.map(d => d[type]))])

    
    const t = svg.transition().duration(2000)
    const delayTrans = (_, i) => i*100

    const bars = svg.selectAll("rect")
        .data(data, d => d.company)
        .join(
            enter => enter.append("rect")
                .attr("x", d => xScale(d.company))
                .attr("y", d => yScale(d[type]))
                .attr("width", xScale.bandwidth)
                .attr("height", d => height - yScale(d[type]))
                .attr("tabindex", "0")
                .attr("role", "graphics-symbol")
                .attr("aria-roledescription", "bar element")
                .attr("aria-label", d => type === "stores"
                    ? `${d.company} operates ${d[type]} stores.`
                    : `${d.company} makes ${d[type]} billion dollars in revenue.`),
            update => update
                .call(update => 
                    update
                    .transition(t).delay(delayTrans)
                    .attr("height", d => height - yScale(d[type]))
                    .attr("y", d => yScale(d[type]))
                    .attr("x", d => xScale(d.company)))
                    .attr("aria-label", d => type === "stores"
                    ? `${d.company} operates ${d[type]} stores.`
                    : `${d.company} makes ${d[type]} billion dollars in revenue.`
                    ),
            exit => exit.remove()
        )
    
    xGroup.transition(t)
        .call(xAxis)
        .call(g => g.selectAll(".tick").delay(delayTrans))
        

    yGroup
        .transition(t)
        .call(yAxis)

    yLabel
        .text(label_map[type])
        
    xLabel
        .text("Stores")
    
}

function sort(data, type){
    order = d3.select('#sort-button').node().value * -1
    d3.select('#sort-button').property("value", order)
    if (order > 0) {
        data.sort((a, b) => a[type]-b[type])
    } else if (order < 0) {
        data.sort((a, b) => b[type]-a[type])
    }
}

d3.csv("coffee-house-chains.csv", d3.autoType).then(data => {
    d3.select('#selection').on("change", () =>{
        type = d3.select('#selection').node().value
        update(data, type)
    })
    d3.select('#sort-button').on("click", () => {
        sort(data, type)
        update(data, type)
    })
    sort(data, type) 
	update(data, type); 
});
