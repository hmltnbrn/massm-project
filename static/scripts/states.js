(function() {
  const toolDiv = d3.select("body")
    .append("div")
      .attr("class", "state-tooltip")
      .style("opacity", 0);

  const margin = { top: 10, right: 20, bottom: 30, left: 30 };

  const width = 960 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select('#state-map')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call(responsive);

  const riskMap = d3.map();
  const stabilityMap = d3.map();
  const stateNames = d3.map();

  const path = d3.geoPath();

  const color = d3.scaleSequential()
    .interpolator(d3.interpolateOranges)
    .domain([0, 100]);

  const x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width/2]);

  const g = svg.append("g")
    .attr("class", "key")
    .attr("transform", `translate(${width/2}, 10)`);

  g.selectAll("rect")
    .data(Array.from(Array(100).keys()))
    .enter().append("rect")
      .attr("x", d => Math.floor(x(d)))
      .attr("y", 0)
      .attr("height", 10)
      .attr("width", d => {
        if (d == 100) {
          return 6;
        }
        return Math.floor(x(d+1)) - Math.floor(x(d)) + 1;
      })
      .attr("fill", d => color(d));

  g.append("text")
    .attr("class", "caption")
    .attr("x", width/4)
    .attr("y", 0)
    .attr("fill", "#000000")
    .text("Number of At-Risk Individuals");

  g.call(d3.axisBottom(x)
    .tickSize(15)
    .tickFormat(d => { return d === 0 ? 'Lowest' : 'Highest'; })
    .tickValues(color.domain()))
    .select(".domain").remove();

  const states = svg.append("g")
    .attr("class", "state-container");

  const borders = svg.append("g")
    .attr("class", "border-container");

  const dc = svg.append("g")
    .attr("transform", `translate(${width - 40}, ${height - 150})`)
    .attr("class", "dc-group");

  dc.append("text")
    .attr("class","dc-text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text("DC");

  const promises = [
    d3.json("https://d3js.org/us-10m.v1.json"),
    d3.tsv("./static/data/state-names.tsv", d => {
      stateNames.set(d.id, { code: d.code, name: d.name });
    }),
    d3.json("/api/state/total").then(d => {
      d.data.forEach(d => {
        riskMap.set(d.state, { total: d.total, percentage: d.percentage });
      });
    }),
    d3.json("/api/state/stability").then(d => {
      d.data.forEach(d => {
        stabilityMap.set(d.state, { total: d.total, percentage: d.percentage });
      });
    })
  ];

  Promise.all(promises).then(createAll);

  function createAll([us]) {
    d3.selectAll("input[name='state-view']").on("change", function() {
      if(this.value === "risk") {
        createMap(us, riskMap, 'Individuals', 'Number of Individuals');
      }
      else if(this.value === "stability") {
        createMap(us, stabilityMap, 'Economic Stability', 'Average Economic Stability (1-30) of Individuals');
      }
    });
    createMap(us, riskMap, 'Individuals', 'Number of Individuals');
  }

  function createMap(us, map, title, caption) {
    const paths = states.selectAll('path')
      .data(topojson.feature(us, us.objects.states).features);

    paths.exit().remove();

    paths.enter().append("path")
      .merge(paths)
      .attr("fill", d => {
        let state = stateNames.get(+d.id);
        d.percentage = map.get(state.code)["percentage"] || 0;
        d.total = map.get(state.code)["total"] || 0;
        let col = color(d.percentage);
        if (col) {
          return col;
        }
        else {
          return '#ffffff';
        }
      })
      .attr("d", path)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

    const state_paths = borders.selectAll('path')
      .data([topojson.mesh(us, us.objects.states, (a, b) => { return a !== b; })]);

    state_paths.exit().remove();

    state_paths.enter().append("path")
      .attr("class", "states")
      .merge(state_paths)
      .attr("d", path);
    
    const dc_data = dc.selectAll("rect")
      .data([map.get("DC")]);

    dc_data.exit().remove();

    dc_data.enter().append("rect")
      .attr("class", "dc-rect")
      .attr("width", 18)
      .attr("height", 18)
      .merge(dc_data)
      .attr("fill", d => {
        d.id = 11;
        let col = color(d.percentage); 
        if (col) {
          return col;
        }
        else {
          return '#ffffff';
        }
      })
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
    
    d3.select('.caption')
      .text(caption);

    d3.select(".key").selectAll('rect')
      .attr("fill", d => {
        if(title === 'Economic Stability') {
          return color(99 - d);
        }
        return color(d);
      });
    
    function handleMouseOver(d) {
      toolDiv.transition()
        .duration(200)
        .style("opacity", .9);
      toolDiv.html(`
        <h2>${stateNames.get(+d.id).name || "District of Columbia"}</h2>
        <h3>${title}</h3>
        <p>${d.total.toLocaleString()}</p>
      `)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    }

    function handleMouseOut() {
      toolDiv.transition()
        .duration(500)
        .style("opacity", 0);
    }
  }

})();
