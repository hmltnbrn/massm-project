(function() {
  const margin = { top: 20, right: 50, bottom: 50, left: 30 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  
  const raceMap = {};
  const educationMap = {};
  const ownershipMap = {};
  
  const svg = d3.select('#bar-chart')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call(responsive)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
  const x0 = d3.scaleBand().rangeRound([margin.left, width - margin.right]).paddingInner(0.1);
  const x1 = d3.scaleBand();
  const y = d3.scaleLinear().rangeRound([height, margin.top]);
  
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "x axis");

  svg.append("text")
    .attr('class', 'x-text')
    .attr("transform", `translate(${width/2}, ${height + margin.top + 20})`)
    .style("text-anchor", "middle");

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("class", "y axis");

  svg.append("text")
    .attr('class', 'y-text')
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle");

  const color = d3.scaleOrdinal(d3.schemeCategory10);
  
  const promises = [
    d3.json("/api/demo/race").then(d => {
      d.data.forEach(val => {
        raceMap[val.race_code] = [...raceMap[val.race_code] || [], { gender: val.gender, total: val.total }];
      });
    }),
    d3.json("/api/demo/education").then(d => {
      d.data.forEach(val => {
        educationMap[val.education_id] = [...educationMap[val.education_id] || [], { gender: val.gender, total: val.total }];
      });
    }),
    d3.json("/api/demo/ownership").then(d => {
      d.data.forEach(val => {
        ownershipMap[val.home_owner] = [...ownershipMap[val.home_owner] || [], { gender: val.gender, total: val.total }];
      });
    })
  ];
  
  Promise.all(promises).then(createAll);
  
  function createAll() {
    d3.selectAll("input[name='bar-view']").on("change", function() {
      if(this.value === "race") {
        createBar(raceMap, "Race Code", "At-Risk Individuals", 750);
      }
      else if(this.value === "education") {
        createBar(educationMap, "Education ID", "At-Risk Individuals", 750);
      }
      else if(this.value === "ownership") {
        createBar(ownershipMap, "Home Owner Code", "At-Risk Individuals", 750);
      }
    });
    createBar(raceMap, "Race Code", "At-Risk Individuals", 0);
  }
  
  function createBar(data, xText, yText, speed) {
    const keyNames = Object.keys(data);
    const groupData = keyNames.map(k => {
      return { key: k, values: data[k] };
    });
    const valueNames = groupData[0].values.map(d => d.gender);
  
    x0.domain(keyNames);
    x1.domain(valueNames).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(groupData, key => d3.max(key.values, d => d.total))]);
  
    svg.selectAll(".y").transition().duration(speed)
      .call(d3.axisLeft().scale(y).ticks(null, "s"));
  
    svg.selectAll(".x").transition().duration(speed)
      .call(d3.axisBottom().scale(x0).tickSizeOuter(0));
    
    const groups = svg.selectAll("g.group")
      .data(groupData);

    groups.exit().remove();

    groups.enter().append("g")
      .merge(groups)
      .classed("group", true)
      .attr("transform", d => `translate(${x0(d.key)}, 0)` );

    const bars = svg.selectAll("g.group").selectAll("rect")
      .data(d => d.values);

    bars.exit().remove();

    bars.enter().append("rect")
      .attr("y", d => y(0))
      .attr("height", d => height - y(0))
      .merge(bars)
      .transition().duration(speed)
      .attr("width", x1.bandwidth())
      .attr("x", d => x1(d.gender))
      .style("fill", d => color(d.gender))
      .attr("y", d => y(d.total))
      .attr("height", d => height - y(d.total));

    const text = svg.selectAll("g.group").selectAll("text")
      .data(d => d.values);
  
    text.exit().remove();
  
    text.enter().append("text")
      .attr("class", "bar-text")
      .attr("text-anchor", "middle")
      .attr("y", d => y(0))
      .merge(text)
      .transition().duration(speed)
      .attr("x", d => x1(d.gender) + x1.bandwidth() / 2)
      .attr("y", d => y(d.total) - 5)
      .text(d => d.total.toLocaleString());

    d3.select('.x-text')
      .transition().duration(speed)
      .text(xText);
    d3.select('.y-text')
      .transition().duration(speed)
      .text(yText);

    const legend = svg.selectAll(".legend")
      .data(groupData[0].values.map(d => d.gender).reverse())
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
      .text(d => d);
  }

})();
