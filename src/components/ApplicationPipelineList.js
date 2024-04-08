// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./ApplicationPipelineList.css"; // Import the CSS file here

// function ApplicationPipelineList() {
//   const [applications, setApplications] = useState([]);
//   const [selectedApplication, setSelectedApplication] = useState("");
//   const [latestPipeline, setLatestPipeline] = useState(null);
//   const [pipelineStatus, setPipelineStatus] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     // Fetch list of applications
//     axios
//       .get(
//         "http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084/applications"
//       )
//       .then((response) => {
//         setApplications(response.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching application list:", error);
//       });
//   }, []);

//   useEffect(() => {
//     if (!selectedApplication) return;

//     // Fetch latest pipeline for selected application
//     axios
//       .get(
//         `http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084/applications/${selectedApplication}/pipelines`
//       )
//       .then((response) => {
//         // Assuming response.data is an array of pipelines
//         // You can sort the pipelines based on timestamp and get the latest one
//         const sortedPipelines = response.data.sort(
//           (a, b) => new Date(b.startTime) - new Date(a.startTime)
//         );
//         const latest = sortedPipelines[0];
//         setLatestPipeline(latest);
//       })
//       .catch((error) => {
//         console.error("Error fetching pipelines:", error);
//       });
//   }, [selectedApplication]);

//   const handleApplicationChange = (event) => {
//     setSelectedApplication(event.target.value);
//   };

//   const handlePipelineTrigger = () => {
//     if (!latestPipeline) {
//       console.error("No latest pipeline available");
//       return;
//     }

//     // Set loading state to true
//     setLoading(true);

//     // Trigger latest pipeline for selected application
//     axios
//       .post(
//         `http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084/pipelines/${selectedApplication}/${latestPipeline.name}`
//       )
//       .then((response) => {
//         console.log("Pipeline Triggered:", response.data);

//         // Start polling for pipeline status
//         pollPipelineStatus(latestPipeline.id);
//       })
//       .catch((error) => {
//         console.error("Error triggering pipeline:", error);
//         // Set loading state to false on error
//         setLoading(false);
//       });
//   };

//   const pollPipelineStatus = (pipelineId) => {
//     // Polling function
//     const intervalId = setInterval(() => {
//       // Fetch pipeline status using the retrieved pipeline ID
//       axios
//         .get(
//           `http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084/pipelines/${pipelineId}`
//         )
//         .then((response) => {
//           console.log("Pipeline Status:", response.data.status);
//           const executionStatus = response.data.status;
//           setPipelineStatus(executionStatus);
//           if (executionStatus === "SUCCEEDED") {
//             clearInterval(intervalId);
//             setLoading(false);
//             setSuccess(true);
//           } else if (executionStatus === "FAILED") {
//             clearInterval(intervalId);
//             setLoading(false);
//             setSuccess(false);
//           } else if (executionStatus === "CANCELED") {
//             clearInterval(intervalId);
//             setLoading(false);
//             setSuccess(false);
//           }
//         })
//         .catch((error) => {
//           console.error("Error fetching pipeline status:", error);
//           // Set loading state to false on error
//           setLoading(false);
//         });
//     }, 5000); // Poll every 5 seconds
//   };

//   return (
//     <div className="container">
//       <img
//         src="https://www.minfytech.com/wp-content/uploads/2022/04/logo-minfy.png"
//         alt="MinfyTech Logo"
//         className="logo"
//       />
//       <div className="box">
//         <h2 className="heading">Application list</h2>
//         <select
//           className="dropdown"
//           value={selectedApplication}
//           onChange={handleApplicationChange}
//         >
//           <option key={"no-select"} value="">
//             Select an Application
//           </option>
//           {applications.map((application) => (
//             <option key={application.id} value={application.id}>
//               {application.name}
//             </option>
//           ))}
//         </select>

//         {selectedApplication && (
//           <div className="pipeline-table">
//             <h3>Pipelines</h3>
//             {latestPipeline && (
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Pipeline Name</th>
//                     <th>Action</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>{latestPipeline.name}</td>
//                     <td>
//                       <button
//                         className="trigger-button"
//                         disabled={loading}
//                         onClick={handlePipelineTrigger}
//                       >
//                         Trigger
//                       </button>
//                     </td>
//                     <td>
//                       {loading ? (
//                         <span>
//                           Running... <i className="fa fa-spinner fa-spin"></i>
//                         </span>
//                       ) : success ? (
//                         <span>
//                           <i className="fa fa-check-circle"></i> Success
//                         </span>
//                       ) : (
//                         <span>{pipelineStatus}</span>
//                       )}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ApplicationPipelineList;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ApplicationPipelineList.css"; // Import the CSS file here

function ApplicationPipelineList() {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState("");
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState("");
  const [pipelineStatus, setPipelineStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pipelineCount, setPipelineCount] = useState(0); // New state to hold the number of pipelines

  useEffect(() => {
    // Fetch list of applications
    axios
      .get(
        "http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084/applications"
      )
      .then((response) => {
        setApplications(response.data);
      })
      .catch((error) => {
        console.error("Error fetching application list:", error);
      });
  }, []);

  useEffect(() => {
    if (!selectedApplication) return;

    // Fetch pipelines for selected application
    axios
      .get(
        `http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084/applications/${selectedApplication}/pipelines`
      )
      .then((response) => {
        setPipelines(response.data);
        // Set the number of pipelines
        setPipelineCount(response.data.length);
      })
      .catch((error) => {
        console.error("Error fetching pipelines:", error);
      });
  }, [selectedApplication]);

  const handleApplicationChange = (event) => {
    setSelectedApplication(event.target.value);
  };

  const handlePipelineChange = (event) => {
    setSelectedPipeline(event.target.value);
  };

  const handlePipelineTrigger = () => {
    if (!selectedPipeline) {
      console.error("No pipeline selected");
      return;
    }

    // Set loading state to true
    setLoading(true);

    // Trigger selected pipeline for selected application
    axios
      .post(
        `http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084/pipelines/${selectedApplication}/${selectedPipeline}`
      )
      .then((response) => {
        console.log("Pipeline Triggered:", response.data);

        // Start polling for pipeline status
        pollPipelineStatus(response.data.id);
      })
      .catch((error) => {
        console.error("Error triggering pipeline:", error);
        // Set loading state to false on error
        setLoading(false);
      });
  };

  const pollPipelineStatus = (pipelineId) => {
    // Polling function
    const intervalId = setInterval(() => {
      // Fetch pipeline status using the retrieved pipeline ID
      axios
        .get(
          `http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084/pipelines/${pipelineId}`
        )
        .then((response) => {
          console.log("Pipeline Status:", response.data.status);
          const executionStatus = response.data.status;
          setPipelineStatus(executionStatus);
          if (executionStatus === "SUCCEEDED") {
            clearInterval(intervalId);
            setLoading(false);
            setSuccess(true);
          } else if (executionStatus === "FAILED" || executionStatus === "CANCELED") {
            clearInterval(intervalId);
            setLoading(false);
            setSuccess(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching pipeline status:", error);
          // Set loading state to false on error
          setLoading(false);
        });
    }, 5000); // Poll every 5 seconds
  };

  return (
    <div className="container">
      <img
        src="https://www.minfytech.com/wp-content/uploads/2022/04/logo-minfy.png"
        alt="MinfyTech Logo"
        className="logo"
      />
      <div className="box">
        <h2 className="heading">Application list</h2>
        <select
          className="dropdown"
          value={selectedApplication}
          onChange={handleApplicationChange}
        >
          <option key={"no-select"} value="">
            Select an Application
          </option>
          {applications.map((application) => (
            <option key={application.id} value={application.id}>
              {application.name}
            </option>
          ))}
        </select>

        {selectedApplication && (
          <div>
            <h3>Select a Pipeline</h3>
            <select
              className="dropdown"
              value={selectedPipeline}
              onChange={handlePipelineChange}
            >
              <option key={"no-select"} value="">
                Select a Pipeline
              </option>
              {Array.from(new Set(pipelines.map((pipeline) => pipeline.name))).map((pipelineName) => (
                <option key={pipelineName} value={pipelineName}>
                  {pipelineName}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedPipeline && (
          <div className="pipeline-table">
            <h3>Pipeline Status</h3>
            <table>
              <thead>
                <tr>
                  <th>Pipeline Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{selectedPipeline}</td>
                  <td>
                    {loading ? (
                      <span>
                        Running... <i className="fa fa-spinner fa-spin"></i>
                      </span>
                    ) : success ? (
                      <span>
                        <i className="fa fa-check-circle"></i> Success
                      </span>
                    ) : (
                      <span>{pipelineStatus}</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            <button
              className="trigger-button"
              disabled={loading}
              onClick={handlePipelineTrigger}
            >
              Trigger Pipeline
            </button>
          </div>
        )}
      </div>
      
      {/* Display the number of pipelines */}
      <div className="pipeline-count">
        <h3>Total Pipelines: {pipelineCount}</h3>
      </div>
    </div>
  );
}

export default ApplicationPipelineList;

