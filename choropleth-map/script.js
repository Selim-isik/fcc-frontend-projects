document.addEventListener("DOMContentLoaded", function () {
  const educationUrl =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
  const countyUrl =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
  const container = d3.select("#data-visualization");

  const width = 960;
  const height = 600;

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const colorScheme = d3.schemeBlues[9];

  Promise.all([d3.json(countyUrl), d3.json(educationUrl)]).then((datasets) => {
    const us = datasets[0];
    const education = datasets[1];

    const minBachelors = d3.min(education, (d) => d.bachelorsOrHigher);
    const maxBachelors = d3.max(education, (d) => d.bachelorsOrHigher);

    const colorScale = d3
      .scaleThreshold()
      .domain(
        d3.range(
          minBachelors,
          maxBachelors,
          (maxBachelors - minBachelors) / colorScheme.length
        )
      )
      .range(colorScheme);

    const educationMap = new Map(education.map((d) => [d.fips, d]));

    svg
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => educationMap.get(d.id).bachelorsOrHigher)
      .attr("fill", (d) => {
        const eduData = educationMap.get(d.id);
        return eduData ? colorScale(eduData.bachelorsOrHigher) : "grey";
      })
      .attr("d", d3.geoPath())

      .on("mouseover", function (event, d) {
        const eduData = educationMap.get(d.id);
        if (!eduData) return;

        d3
          .select("#tooltip")
          .attr("data-education", eduData.bachelorsOrHigher)
          .style("opacity", 0.9)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 60 + "px").html(`
                        ${eduData.area_name}, ${eduData.state}<br>
                        ${eduData.bachelorsOrHigher}%
                    `);
      })
      .on("mouseout", function () {
        d3.select("#tooltip").style("opacity", 0);
      });

    const legendWidth = 300;
    const legendHeight = 20;

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${width - legendWidth - 20}, ${20})`);

    const legendXScale = d3
      .scaleLinear()
      .domain([minBachelors, maxBachelors])
      .range([0, legendWidth]);

    const legendXAxis = d3
      .axisBottom(legendXScale)
      .tickValues(colorScale.domain())
      .tickFormat(d3.format(".1f"))
      .tickSize(10, 0);

    legend
      .selectAll("rect")
      .data(
        colorScale.range().map((color) => {
          const d = colorScale.invertExtent(color);
          if (d[0] == null) d[0] = legendXScale.domain()[0];
          if (d[1] == null) d[1] = legendXScale.domain()[1];
          return d;
        })
      )
      .enter()
      .append("rect")
      .attr("height", legendHeight)
      .attr("width", (d) => legendXScale(d[1]) - legendXScale(d[0]))
      .attr("x", (d) => legendXScale(d[0]))
      .attr("fill", (d) => colorScale(d[0]));

    legend
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendXAxis);
  });
});
