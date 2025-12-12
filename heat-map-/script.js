document.addEventListener("DOMContentLoaded", function () {
  const jsonUrl =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
  const container = d3.select("#data-visualization");

  const margin = { top: 10, right: 30, bottom: 100, left: 100 };
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.json(jsonUrl).then((data) => {
    const baseTemp = data.baseTemperature;
    const dataset = data.monthlyVariance;

    const years = dataset.map((d) => d.year);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const minYear = d3.min(years);
    const maxYear = d3.max(years);

    const colorScheme = [
      "#313695",
      "#4575b4",
      "#74add1",
      "#abd9e9",
      "#e0f3f8",
      "#ffffbf",
      "#fee090",
      "#fdae61",
      "#f46d43",
      "#d73027",
      "#a50026",
    ];

    const xScale = d3.scaleBand().domain(years).range([0, width]);

    const yScale = d3
      .scaleBand()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      .range([0, height]);

    const tempVariance = dataset.map((d) => d.variance);
    const minVariance = d3.min(tempVariance);
    const maxVariance = d3.max(tempVariance);

    const colorScale = d3
      .scaleQuantile()
      .domain([minVariance, maxVariance])
      .range(colorScheme);

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(xScale.domain().filter((year) => year % 10 === 0))
      .tickFormat(d3.format("d"));

    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((monthIndex) => months[monthIndex]);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    svg.append("g").attr("id", "y-axis").call(yAxis);

    svg
      .selectAll(".cell")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => baseTemp + d.variance)
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.month - 1))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.variance))

      .on("mouseover", function (event, d) {
        const temp = (baseTemp + d.variance).toFixed(2);
        d3
          .select("#tooltip")
          .attr("data-year", d.year)
          .style("opacity", 0.9)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 60 + "px").html(`
                        ${d.year} - ${months[d.month - 1]}<br>
                        Temp: ${temp}°C<br>
                        Variance: ${d.variance.toFixed(2)}°C
                    `);
      })
      .on("mouseout", function () {
        d3.select("#tooltip").style("opacity", 0);
      });

    const legendColors = colorScale.range();
    const minVar = d3.min(tempVariance);
    const maxVar = d3.max(tempVariance);

    const legendWidth = 400;
    const legendHeight = 20;

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(${margin.left}, ${height + margin.bottom - 50})`
      );

    const legendXScale = d3
      .scaleLinear()
      .domain([minVar, maxVar])
      .range([0, legendWidth]);

    const legendXAxis = d3
      .axisBottom(legendXScale)
      .tickValues(colorScale.thresholds())
      .tickFormat(d3.format(".1f"));

    legend
      .selectAll("rect")
      .data(legendColors)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (legendWidth / legendColors.length))
      .attr("y", 0)
      .attr("width", legendWidth / legendColors.length)
      .attr("height", legendHeight)
      .attr("fill", (d) => d);

    legend
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendXAxis);
  });
});
