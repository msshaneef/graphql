import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import styles from "../styles/Dashboard.module.css";
import * as d3 from "d3";

const url = "https://learn.reboot01.com/api/graphql-engine/v1/graphql";

const userIdQuery = `
  query {
    user {
      id
    }
  }
`;

const userQuery = (userId) => `
  {
    user(where: { id: { _eq: "${userId}" } }) {
      login
      campus
      email
      firstName
      lastName
    }
  }
`;

// Define the correct GraphQL query to fetch the user's XP
const xpQuery = (userId) => `
  query Transaction_aggregate {
    transaction_aggregate(
      where: {
        event: { path: { _eq: "/bahrain/bh-module" } }
        type: { _eq: "xp" }
        userId: { _eq: "${userId}" }
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }
`;

// Define the GraphQL query to fetch the current project
const currentProjectQuery = `
  {
    progress(
      where: { isDone: { _eq: false }, object: { type: { _eq: "project" } } }
      limit: 1
    ) {
      object {
        name
      }
    }
  }
`;

// Define the GraphQL query to fetch the last 4 projects

const lastProjectsQuery = `
{
    transaction(
      where: {
        type: { _eq: "xp" }
        _and: [
          { path: { _like: "/bahrain/bh-module%" } },
          { path: { _nlike: "/bahrain/bh-module/checkpoint%" } },
          { path: { _nlike: "/bahrain/bh-module/piscine-js%" } }
        ]
      }
      order_by: { createdAt: desc }
      limit: 4
    ) {
      object {
        type
        name
      }
    }
  }
  `;

// Define the GraphQL query to fetch the user's skills
const skillsQuery = `
  {
    user {
      transactions(where: {
          type: {_ilike: "%skill%"}
        }
      ) {
        type
        amount
      }
    }
  }
`;

// Define the GraphQL query to fetch the audit ratio, total audits done, and total audits received
const auditQuery = (userId) => `
{
  user(where: { id: { _eq: "${userId}" } }) {
    auditRatio
    totalUp
    totalDown
  }
}
`;

//Radar chart for technologies and technical skills
const createRadarChart = (data, labels, selector) => {
  const svg = d3.select(selector);
  if (svg.empty()) {
    console.error(`Element with selector ${selector} not found`);
    return;
  }
  const container = svg.node().parentNode;
  const width = container.clientWidth;
  const height = container.clientHeight;
  const padding = 60;
  const radius = 100;
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

//   if (!skillsData) return null;

//   const labels = skillsData.data.user[0].transactions.map(
//     (transaction) => transaction.type
//   );
//   const data = skillsData.data.user[0].transactions.map(
//     (transaction) => transaction.amount
//   );

//   return {
//     labels,
//     datasets: [
//       {
//         label: "Skills",
//         data,
//         backgroundColor: "rgba(34, 202, 236, .2)",
//         borderColor: "rgba(34, 202, 236, 1)",
//         pointBackgroundColor: "rgba(34, 202, 236, 1)",
//         pointBorderColor: "#ffffff",
//         pointHoverBackgroundColor: "#ffffff",
//         pointHoverBorderColor: "rgba(34, 202, 236, 1)",
//       },
//     ],
//   };
// };
//Progress bar for audit information
function ProgressBar(selector, percentage, color) {
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
}

//Fetch audit ratio, total audits done, and total audits received
async function updateProgressBars(auditInfo) {
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
}

//Fetch data with given query
async function fetchData(query, token) {
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
}

//Formatting skill names for labelling the Radarchart
const formatSkillName = (skill) => {
  return skill
    .replace("skill_", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function Dashboard() {
  const [userIdData, setUserIdData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [xpData, setXpData] = useState(null);
  const [currentProjectData, setCurrentProjectData] = useState(null);
  const [lastProjectsData, setLastProjectsData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [skillsData, setSkillsData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const jwt = Cookies.get("jwt");
    if (jwt) {
      async function fetchUserId() {
        try {
          //Fetch user ID
          const data = await fetchData(userIdQuery, jwt);
          const userId = data.data.user[0].id;
          setUserIdData(data);
          //Fetch user data using the user ID
          const userData = await fetchData(userQuery(userId), jwt);
          setUserData(userData);
          //Fetch user XP using the user ID
          const xpData = await fetchData(xpQuery(userId), jwt);
          setXpData(xpData);
          //Fetch current project
          const currentProjectData = await fetchData(currentProjectQuery, jwt);
          setCurrentProjectData(currentProjectData);
          //Fetch last 4 projects
          const lastProjectsData = await fetchData(lastProjectsQuery, jwt);
          setLastProjectsData(lastProjectsData);
          //Fetch audit data
          const auditData = await fetchData(auditQuery(userId), jwt);
          setAuditData(auditData);
          //Fetch skills data
          const skillsData = await fetchData(skillsQuery, jwt);
          setSkillsData(skillsData);
        } catch (error) {
          console.error(error);
        }
      }
      fetchUserId();
    }
  }, []);

  const userInfo = userData?.data?.user[0];
  const xpInfo = xpData?.data.transaction_aggregate.aggregate.sum.amount;
  const currentProject = currentProjectData?.data.progress[0]?.object.name;
  const auditInfo = auditData?.data.user[0];
  const lastProjects = lastProjectsData?.data.transaction.map((project) => {
    return {
      name: project.object.name,
      type: project.object.type,
    };
  });

  // Check if XP is 999.9 kB or above and convert to MB if necessary
  let displayXpText;
  if (xpInfo >= 999900) {
    const xpInMB = (xpInfo / 1000000).toFixed(2); // Convert to MB and format to two decimal places
    displayXpText = `${xpInMB} MB`;
  } else {
    // Round the XP value
    const roundedXp = Math.ceil(xpInfo / 1000);

    // Ensure values are rounded properly
    const displayXp =
      xpInfo % 1000 >= 500 ? roundedXp : Math.floor(xpInfo / 1000);
    displayXpText = `${displayXp} kB`;
  }

  useEffect(() => {
    if (skillsData) {
      const skills = skillsData.data.user[0].transactions || [];
      console.log(skills);
      const technicalSkills = {};
      const technologies = {};

      skills.forEach((skill) => {
        const skillType = skill.type;
        const skillAmount = skill.amount;

        if (
          [
            "skill_go",
            "skill_js",
            "skill_html",
            "skill_css",
            "skill_unix",
            "skill_docker",
          ].includes(skillType)
        ) {
          if (!technologies[skillType]) {
            technologies[skillType] = 0;
          }
          technologies[skillType] += skillAmount;
        } else if (
          [
            "skill_prog",
            "skill_ai",
            "skill_stats",
            "skill_back-end",
            "skill_front-end",
            "skill_algo",
          ].includes(skillType)
        ) {
          if (!technicalSkills[skillType]) {
            technicalSkills[skillType] = 0;
          }
          technicalSkills[skillType] += skillAmount;
        }
      });

      const technicalSkillsLabels =
        Object.keys(technicalSkills).map(formatSkillName);
      const technicalSkillsData = Object.values(technicalSkills);
      const technologiesLabels = Object.keys(technologies).map(formatSkillName);
      const technologiesData = Object.values(technologies);
      console.log(technicalSkillsLabels);
      console.log(technologiesLabels);

      createRadarChart(
        technicalSkillsData,
        technicalSkillsLabels,
        "#technical-skills-chart"
      );

      createRadarChart(
        technologiesData,
        technologiesLabels,
        "#technologies-chart"
      );
    }
  }, [skillsData]);

  useEffect(() => {
    if (auditInfo) {
      updateProgressBars(auditInfo);
      window.addEventListener("resize", () => updateProgressBars(auditInfo));
      return () =>
        window.removeEventListener("resize", () =>
          updateProgressBars(auditInfo)
        );
    }
  }, [auditInfo]);

  const handleLogout = async () => {
    try {
      // Call the expire endpoint
      await fetch("https://learn.reboot01.com/api/auth/expire", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Expire endpoint failed: ${response.statusText}`);
      }

      // Call the signout endpoint
      await fetch("https://learn.reboot01.com/api/auth/signout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Signout endpoint failed: ${response.statusText}`);
      }

      // Clear the JWT cookie
      Cookies.remove("jwt");

      // Redirect to the login page
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {userInfo ? (
          <>
            <div className={styles.header}>
              <h1 className={styles.h1}>
                Welcome, {userInfo.firstName} {userInfo.lastName}!
              </h1>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <div className={styles.icon}></div>
                Logout
              </button>{" "}
              {}
            </div>
          </>
        ) : (
          <h1 className={styles.h1}>Loading...</h1>
        )}
      </div>

      <div className={styles.infocontainer}>
        <div className={styles.infoitem}>
          <a href="#" className={styles.item_link}>
            <div className={styles.item_bg}> </div>
            <div className={styles.item_title}>Student information</div>
            {userInfo ? (
              <>
                <div className={styles.item_box}>
                  <div className={styles.item_text}>
                    Username: {userInfo.login} <br></br>
                    Email: {userInfo.email} <br></br>
                    Campus: {userInfo.campus} <br></br>
                  </div>
                </div>
              </>
            ) : (
              <h1 className={styles.h1}>Loading...</h1>
            )}
          </a>
        </div>
        <div className={styles.infoitem}>
          <a href="#" className={styles.item_link}>
            <div className={styles.item_bg}> </div>
            <div className={styles.item_title}>XP information</div>
            {xpInfo ? (
              <>
                <div className={styles.item_box}>
                  <div className={styles.item_text}>
                    XP: {displayXpText} <br></br>
                  </div>
                </div>
              </>
            ) : (
              <h1 className={styles.h1}>Loading...</h1>
            )}
          </a>
        </div>
        <div className={styles.infoitem}>
          <a href="#" className={styles.item_link}>
            <div className={styles.item_bg}> </div>
            <div className={styles.item_title}>Current project</div>
            {currentProject ? (
              <>
                <div className={styles.item_box}>
                  <div className={styles.item_text}>{currentProject}</div>
                </div>
              </>
            ) : (
              <h1 className={styles.h1}>Loading...</h1>
            )}
          </a>
        </div>
      </div>

      <div className={styles.infoitem}>
        <a href="#" className={styles.item_link}>
          <div className={styles.item_bg}> </div>
          <div className={styles.item_title}>Last activity</div>
          {lastProjects ? (
            <>
              <div className={styles.item_box}>
                <div className={styles.item_text}>
                  {lastProjects.map((project, index) => (
                    <div key={index}>
                      {project.name} — ({project.type})
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <h1 className={styles.h1}>Loading...</h1>
          )}
        </a>
      </div>
      <div className={styles.infoitem}>
        <a href="#" className={styles.item_link}>
          <div className={styles.item_bg}> </div>
          <div className={styles.item_title}>Audit information</div>
          {auditInfo ? (
            <>
              <div className={styles.item_box}>
                <div className={styles.item_text}>
                  <p>
                    Audit Ratio: <span id="audit-ratio-text"></span>
                  </p>
                  <p>
                    Total Audits Done: <span id="total-audits-done-text"></span>
                  </p>
                  <svg id="total-audits-done-progress"></svg>
                  <p>
                    Total Audits Received:{" "}
                    <span id="total-audits-received-text"></span>
                  </p>
                  <svg id="total-audits-received-progress"></svg>
                </div>
              </div>
            </>
          ) : (
            <h1 className={styles.h1}>Loading...</h1>
          )}
        </a>
      </div>

      <div className={styles.infocontainer3}>
        <div className={styles.infoitem}>
          <a href="#" className={styles.item_link}>
            <div className={styles.item_bg}> </div>
            <div className={styles.item_title}>Technical Skills</div>
            {skillsData ? (
              <>
                <div className={styles.item_box2}>
                  <svg id="technical-skills-chart"></svg>
                </div>
              </>
            ) : (
              <h1 className={styles.h1}>Loading...</h1>
            )}
          </a>
        </div>
        <div className={styles.infoitem}>
          <a href="#" className={styles.item_link}>
            <div className={styles.item_bg}> </div>
            <div className={styles.item_title}>Technologies</div>
            {skillsData ? (
              <>
                <div className={styles.item_box2}>
                  <svg id="technologies-chart"></svg>
                </div>
              </>
            ) : (
              <h1 className={styles.h1}>Loading...</h1>
            )}
          </a>
        </div>
      </div>
    </div>
  );
}
