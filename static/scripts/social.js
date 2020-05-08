(function() {
  const margin = { top: 20, right: 30, bottom: 50, left: 30 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  
  const x = d3.scaleLinear().range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().range([height, margin.top]);
  const color = d3.scaleOrdinal().range(d3.schemeCategory10);

  const dataMap = {};
  
  const line = d3
    .line()
    .curve(d3.curveMonotoneX)
    .x(d => x(d.social_rank))
    .y(d => y(d.total));
  
  const svg = d3.select('#line-chart')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call(responsive)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const promises = [
    d3.json("/api/social/risk").then(d => {
      return d.data;
    })
  ];
  
  Promise.all(promises).then(createLine);
  
  function createLine([data]) {
    data.forEach(point => {
      dataMap[point.platform] = [...dataMap[point.platform] || [], { social_rank: +point.social_rank, total: point.total }];
    });
    const keyNames = Object.keys(dataMap);
    const frequencies = keyNames.map(k => {
      return { platform: k, datapoints: dataMap[k] };
    });

    x.domain(d3.extent(data.map(d => d.social_rank)));
    y.domain([0, d3.max(data, d => d.total)]);

    const social = svg.selectAll(".social")
      .data(frequencies)
      .enter().append("g")
        .attr("class", "social");

    social
      .append("path")
        .attr("class", "social-line")
        .attr("d", d => {
          return line(d.datapoints);
        })
        .style("stroke", d => {
          return color(d.platform);
        });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    svg.append("text")
      .attr("transform", `translate(${width/2}, ${height + margin.top + 20})`)
      .style("text-anchor", "middle")
      .text("Propensity to Use (Most Likely to Least Likely)");

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("class", "y axis")
      .call(d3.axisLeft(y).ticks(null, "s"));

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("At-Risk Individuals");

    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.social_rank))
        .attr("cy", d => y(d.total))
        .attr("fill", d => color(d.platform))
        .attr("r", 4);
    
    const legend = svg.selectAll(".legend")
      .data(keyNames.reverse())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d,i) => `translate(0, ${i * 20})`);

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => color(d));

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(d => d.capitalize());
  }

})();
