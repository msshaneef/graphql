import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import styles from "../styles/Dashboard.module.css";
import * as d3 from "d3";

import {
  url,
  userIdQuery,
  userQuery,
  xpQuery,
  currentProjectQuery,
  lastProjectsQuery,
  skillsQuery,
  auditQuery,
} from "../pages/queries.js";

import {
  createRadarChart,
  ProgressBar,
  updateProgressBars,
  fetchData,
  formatSkillName,
} from "../pages/utility.js";

// Main Component
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

      const renderCharts = () => {
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
      };

      renderCharts();
      window.addEventListener("resize", renderCharts);

      return () => window.removeEventListener("resize", renderCharts);
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


      // Call the signout endpoint
      await fetch("https://learn.reboot01.com/api/auth/signout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
      });

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
