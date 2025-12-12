document.addEventListener("DOMContentLoaded", function () {
  const jsonUrl =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
  const container = d3.select("#data-visualization");
  const margin = { top: 20, right: 30, bottom: 60, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  fetch(jsonUrl)
    .then((response) => response.json())
    .then((data) => {
      const dataset = data.data;
      const years = dataset.map((item) => new Date(item[0]));
      const gdp = dataset.map((item) => item[1]);

      const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      const xScale = d3
        .scaleTime()
        .domain([d3.min(years), d3.max(years)])
        .range([0, width]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(gdp)])
        .range([height, 0]);

      const barWidth = width / dataset.length;
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      svg
        .append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

      svg.append("g").attr("id", "y-axis").call(yAxis);

      svg
        .selectAll(".bar")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("data-date", (d) => d[0])
        .attr("data-gdp", (d) => d[1])
        .attr("x", (d, i) => xScale(years[i]))
        .attr("y", (d) => yScale(d[1]))
        .attr("width", barWidth)
        .attr("height", (d) => height - yScale(d[1]))
        .attr("fill", "steelblue")
        .on("mouseover", function (event, d) {
          const date = new Date(d[0]);
          const gdp = d[1].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");

          d3.select("#tooltip")
            .attr("data-date", d[0])
            .style("opacity", 0.9)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 60 + "px")
            .html(`$${gdp} Billion<br>${date.getFullYear()}`);
        })
        .on("mouseout", function () {
          d3.select("#tooltip").style("opacity", 0);
        });

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Gross Domestic Product (Billion USD)");
    })
    .catch((error) => console.error("Veri yüklenirken hata oluştu:", error));
});
