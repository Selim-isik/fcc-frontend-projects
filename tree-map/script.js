document.addEventListener("DOMContentLoaded", function () {
  const jsonUrl =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
  const container = d3.select("#data-visualization");

  const width = 960;
  const height = 600;

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select("#tooltip");

  d3.json(jsonUrl).then((data) => {
    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    d3.treemap().size([width, height]).paddingInner(1)(root);

    const categories = root.leaves().map((nodes) => nodes.data.category);
    const categoryColors = [...new Set(categories)];

    const colorScale = d3
      .scaleOrdinal()
      .domain(categoryColors)
      .range(d3.schemeCategory10);

    const tile = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`);

    tile
      .append("rect")
      .attr("class", "tile")
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => colorScale(d.data.category))

      .on("mouseover", function (event, d) {
        tooltip
          .attr("data-value", d.data.value)
          .style("opacity", 0.9)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 60 + "px").html(`
                        Name: ${d.data.name}<br>
                        Platform: ${d.data.category}<br>
                        Sales: $${d.data.value}M
                    `);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

    tile
      .append("text")
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => 13 + i * 10)
      .text((d) => d)
      .attr("font-size", 10)
      .attr("fill", "black");

    const legend = d3.select("#legend");

    categoryColors.forEach((category) => {
      const item = legend.append("div").attr("class", "legend-item");

      item
        .append("div")
        .attr("class", "category-color")
        .attr("id", category)
        .style("background-color", colorScale(category));

      item.append("span").text(category);
    });
  });
});
