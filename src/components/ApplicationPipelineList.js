import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ApplicationPipelineList.css";

function ApplicationPipelineList() {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState("");
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState("");
  const [pipelineStatus, setPipelineStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pipelineCount, setPipelineCount] = useState(0);
  const [showEndpointTable, setShowEndpointTable] = useState(false);
  const [endpointData, setEndpointData] = useState([]);
  const [pipelineTriggered, setPipelineTriggered] = useState(false);
  const [latestCommit, setLatestCommit] = useState(null);
  const [showCommitDetails, setShowCommitDetails] = useState(false);

  useEffect(() => {
    axios
      .get("http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084/applications")
      .then((response) => {
        setApplications(response.data);
      })
      .catch((error) => {
        console.error("Error fetching application list:", error);
      });
  }, []);

  useEffect(() => {
    if (!selectedApplication) return;

    axios
      .get(`http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084/applications/${selectedApplication}/pipelines`)
      .then((response) => {
        setPipelines(response.data);
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

    const selectedPipelineObj = pipelines.find(pipeline => pipeline.name === selectedPipeline);

    if (!selectedPipelineObj) {
      console.error("Selected pipeline not found");
      return;
    }

    setLoading(true);

    axios
      .post(`http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084/pipelines/${selectedApplication}/${selectedPipelineObj.name}`)
      .then((response) => {
        console.log("Pipeline Triggered:", response.data);
        pollPipelineStatus(response.data.ref);
        setPipelineTriggered(true);
      })
      .catch((error) => {
        console.error("Error triggering pipeline:", error);
        setLoading(false);
      });
  };

  const pollPipelineStatus = (pipelineId) => {
    const intervalId = setInterval(() => {
      if (!selectedPipeline) {
        clearInterval(intervalId);
        return;
      }

      axios
        .get(`http://afea00e0026e7426ebc40b119373ee6f-835370818.us-east-1.elb.amazonaws.com:8084${pipelineId}`)
        .then((response) => {
          console.log("Pipeline Status:", response.data.status);
          const executionStatus = response.data.status;
          setPipelineStatus(executionStatus);
          if (executionStatus === "SUCCEEDED") {
            clearInterval(intervalId);
            setLoading(false);
            setSuccess(true);
          } else if (
            executionStatus === "FAILED" ||
            executionStatus === "CANCELED" ||
            executionStatus === "TERMINAL"
          ) {
            clearInterval(intervalId);
            setLoading(false);
            setSuccess(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching pipeline status:", error);
          setLoading(false);
        });
    }, 5000);
  };

  const getEndpoint = (pipeline) => {
    switch (pipeline) {
      case "dev":
        return "http://a915a80b42c0c4c7eac7a3f5aa619dea-627576352.us-east-1.elb.amazonaws.com";
      case "uat":
        return "http://a4accc2b34f81444fbaf6652837d97cc-1181325399.us-east-1.elb.amazonaws.com";
      case "prod":
        return "http://a57d4da36efd34c56bfcabb3310af27d-196101690.us-east-1.elb.amazonaws.com";
      default:
        return "";
    }
  };

  const getCommitLink = () => {
    const username = '********'; // Replace with your GitHub username
    const repo = 'private-run'; // Replace with your GitHub repository name
    const accessToken = '**token**'; // Replace with your GitHub access token
    
    // Generate the GitHub URL based on the selected pipeline
    return selectedPipeline ? `https://github.com/${username}/${repo}/commits/${selectedPipeline}?access_token=${accessToken}` : "";
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
            <div>
              <button
                className="trigger-button"
                disabled={loading}
                onClick={handlePipelineTrigger}
              >
                Trigger Pipeline
              </button>
            </div>
            <div>
              {pipelineTriggered && success && (
                <button
                  className="view-endpoint-button"
                  onClick={() => window.open(getEndpoint(selectedPipeline), "_blank")}
                >
                  View application page
                </button>
              )}
            </div>
            <div>
              {pipelineTriggered && success && (
                <button
                  className="view-endpoint-button"
                  onClick={() => window.open(getCommitLink(selectedPipeline), "_blank")}
                >
                  View Commit Details
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationPipelineList;
