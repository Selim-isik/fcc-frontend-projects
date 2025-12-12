document.addEventListener("DOMContentLoaded", function () {
  const jsonUrl =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
  const container = d3.select("#data-visualization");

  const margin = { top: 30, right: 30, bottom: 30, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.json(jsonUrl).then((data) => {
    data.forEach((d) => {
      d.Time = new Date(
        1970,
        0,
        1,
        0,
        d.Time.split(":")[0],
        d.Time.split(":")[1]
      );
      d.Year = new Date(d.Year, 0, 1);
    });

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(data, (d) => d.Year) - 31557600000,
        d3.max(data, (d) => d.Year),
      ])
      .range([0, width]);

    const yScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.Time))
      .range([0, height]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    svg.append("g").attr("id", "y-axis").call(yAxis);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Time in Minutes");

    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", (d) => xScale(d.Year))
      .attr("cy", (d) => yScale(d.Time))
      .attr("data-xvalue", (d) => d.Year)
      .attr("data-yvalue", (d) => d.Time)
      .style("fill", (d) => (d.Doping ? "red" : "blue"))

      .on("mouseover", function (event, d) {
        d3
          .select("#tooltip")
          .attr("data-year", d.Year.getFullYear())
          .style("opacity", 0.9)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px").html(`
                        ${d.Name}: ${d.Nationality}<br>
                        Year: ${d.Year.getFullYear()}, Time: ${d.Time.getMinutes()}:${d.Time.getSeconds() < 10 ? "0" : ""}${d.Time.getSeconds()}<br>
                        ${
                          d.Doping
                            ? `<span style="color: red;">${d.Doping}</span>`
                            : "No doping allegations"
                        }
                    `);
      })
      .on("mouseout", function () {
        d3.select("#tooltip").style("opacity", 0);
      });

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${width - 150}, ${height - 150})`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", "red");
    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text("Doping Allegations");

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 25)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", "blue");
    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 37)
      .text("No Doping Allegations");
  });
});
