import * as d3 from "d3";
import { url } from "./queries.js";

export const createRadarChart = (data, labels, selector) => {
  const svg = d3.select(selector);
  if (svg.empty()) {
    console.error(`Element with selector ${selector} not found`);
    return;
  }
  const container = svg.node().parentNode;
  const width = container.clientWidth;
  const height = container.clientHeight;
  const padding = 60;
  const radius = Math.min(width, height) / 2 - padding;
  const levels = 5;

  svg.attr("width", width).attr("height", height);
  svg.selectAll("*").remove(); // Clear any existing content

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const angleSlice = (Math.PI * 2) / data.length;
  const labelRadius = radius + 20; // adjust the radius to position the labels
  const labelAngle = (Math.PI * 2) / labels.length;

  // Draw the background circles
  for (let i = 0; i < levels; i++) {
    const levelFactor = radius * ((i + 1) / levels);
    g.selectAll(".levels")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "gridCircle")
      .attr("r", levelFactor)
      .style("fill", "#CDCDCD")
      .style("stroke", "#CDCDCD")
      .style("fill-opacity", 0.1);
  }

  // Draw the axis lines
  const axis = g
    .selectAll(".axis")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "axis");

  axis
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
    .style("stroke", "white")
    .style("stroke-width", "2px");

  // Draw the labels
  axis;
  g.selectAll(".label")
    .data(labels)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", (d, i) => labelRadius * Math.cos(labelAngle * i - Math.PI / 2))
    .attr("y", (d, i) => labelRadius * Math.sin(labelAngle * i - Math.PI / 2))
    .text((d) => d)
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "10px");

  const rScale = d3
    .scaleLinear()
    .range([20, radius])
    .domain([0, d3.max(data)]);

  // Draw the radar chart
  const radarLine = d3
    .lineRadial()
    .curve(d3.curveLinearClosed)
    .radius((d) => rScale(d))
    .angle((d, i) => i * angleSlice);

  g.append("path")
    .datum(data)
    .attr("d", radarLine)
    .style("fill", "rgba(34, 202, 236, 0.5)")
    .style("stroke", "rgba(34, 202, 236, 1)")
    .style("stroke-width", "2px");
};

export const ProgressBar = (selector, percentage, color) => {
  const svg = d3.select(selector);
  const container = svg.node().parentNode;
  const width = container.clientWidth;
  const height = 20;

  svg.attr("width", width).attr("height", height);

  svg.selectAll("*").remove();

  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#f8f9fa");

  svg
    .append("rect")
    .attr("width", (percentage / 100) * width)
    .attr("height", height)
    .attr("fill", color);
};

export const updateProgressBars = async (auditInfo) => {
  //Format audit ratio to one decimal place
  const auditRatioFormatted = auditInfo.auditRatio.toFixed(1);

  //Function to format values to MB or kB with up to specified significant digits
  const formatValue = (value) => {
    const bytesInMB = 1000 * 1000;
    const bytesInKB = 1000;

    if (value >= bytesInMB) {
      const mbValue = value / bytesInMB;
      return `${(Math.ceil(mbValue * 1000) / 1000).toFixed(2)} MB`;
    } else if (value >= bytesInKB) {
      const kbValue = value / bytesInKB;
      return `${(Math.ceil(kbValue * 1000) / 1000).toFixed(2)} kB`;
    } else {
      return `${value.toFixed(0)} bytes`;
    }
  };

  // Format totalDown and totalUp
  const formattedTotalDown = formatValue(auditInfo.totalDown);
  const formattedTotalUp = formatValue(auditInfo.totalUp);

  // Calculate the maximum value between totalDown and totalUp
  const maxAuditValue = Math.max(auditInfo.totalDown, auditInfo.totalUp);

  // Calculate the percentages based on the maximum value
  const totalDownPercentage = (auditInfo.totalDown / maxAuditValue) * 100;
  const totalUpPercentage = (auditInfo.totalUp / maxAuditValue) * 100;

  // Determine colors based on comparison
  const doneColor =
    auditInfo.totalUp >= auditInfo.totalDown ? "#28a745" : "#dc3545";
  const receivedColor =
    auditInfo.totalDown >= auditInfo.totalUp ? "#17a2b8" : "#ffc107";

  // Create or update progress bars
  ProgressBar("#total-audits-done-progress", totalUpPercentage, doneColor);
  ProgressBar(
    "#total-audits-received-progress",
    totalDownPercentage,
    receivedColor
  );

  // Update text content
  document.getElementById(
    "total-audits-done-text"
  ).textContent = `${formattedTotalUp}`;
  document.getElementById(
    "total-audits-received-text"
  ).textContent = `${formattedTotalDown}`;
  document.getElementById(
    "audit-ratio-text"
  ).textContent = `${auditRatioFormatted}`;
};

export const fetchData = async (query, token) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data;
};

export const formatSkillName = (skill) => {
  return skill
    .replace("skill_", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
