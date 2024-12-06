import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ProjectDetails.css";
import { Button, Form, Modal } from "react-bootstrap";

interface Project {
  project_id: number;
  project_name: string;
  project_status: number;
  // num_of_sensors: number;
  // sensor_names: string;
}
interface Sensor {
  sensor_id: number;
  sensor_name: string;
  sensor_key: string;
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [sensorName, setSensorName] = useState<string>("");
  const [modalError, setModalError] = useState<string | null>(null);

  const [esp_url, setEsp_url] = useState<string>(
    "Initialize your project first."
  );

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/showproject/${id}`,
        {
          withCredentials: true,
        }
      );
      if (response.data.espUrl) {
        setEsp_url(response.data.espUrl);
      }
      setProject(response.data.project);
      setSensors(response.data.sensors); // Assuming the API returns project and sensors

      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      // Check the error response and set an appropriate error message
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        switch (status) {
          case 401:
            setError("401 Unauthorized. Please login again.");
            break;
          case 403:
            setError("403 Forbidden.");
            break;
          case 404:
            setError("Project not found.");
            break;
          case 500:
            setError(
              "Server error: Unable to fetch project details. Please try again later."
            );
            break;
          default:
            setError("An unexpected error occurred. Please try again.");
        }
      } else if (err.request) {
        setError(
          "Network error: Unable to connect to the server. Please check your internet connection."
        );
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  const navigate = useNavigate();
  const handleDeleteProject = async () => {
    const deleteproject = window.confirm(
      `Are you sure you want to delete ${project?.project_name} project?`
    );
    if (!deleteproject) return;

    try {
      await axios.delete(`http://localhost:5000/deleteproject/${id}`, {
        withCredentials: true,
      });
      navigate("/profile");
    } catch (error) {
      alert("Failed to delete project");
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setSensorName("");
    setModalError(null);
  };

  const handleSubmitSensor = async () => {
    if (!sensorName.trim()) {
      setModalError("Sensor name is required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/addsensor", {
        project_id: project?.project_id,
        sensor_name: sensorName,
      });

      if (response.status === 201) {
        alert(response.data.message || "Sensor added successfully.");
        setSensors([...sensors, response.data.sensor]); // Add the new sensor to the list
        handleCloseModal();
      } else {
        alert("Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error adding sensor:", error);
      alert("Failed to add sensor.");
    }
  };

  const handleRemoveSensor = async (sensorId: number) => {
    const sensor = sensors.find((sensor) => sensor.sensor_id === sensorId);
    const deletesensor = window.confirm(
      `Are you sure you want to delete ${sensor?.sensor_name} ?`
    );
    if (!deletesensor) return;

    try {
      await axios.delete(`http://localhost:5000/removesensor/${sensorId}`);
      setSensors((prevSensors) =>
        prevSensors.filter((sensor) => sensor.sensor_id !== sensorId)
      );
    } catch (err) {
      alert("Failed to remove sensor.");
    }
  };

  const [togglebar, setTogglebar] = useState(false);
  const ShowHeader = () => {
    setTogglebar(!togglebar);
  };

  const [buttonInvalid, setButtonInvalid] = useState(false);
  const handleInitializeProject = async () => {
    console.log("Initialized project: ", project?.project_name);
    const windowresult = window.confirm(`Do you want to get the WRITE URL?`);

    if (!windowresult) return;
    else {
      try {
        const response = await axios.post("http://localhost:5000/initproject", {
          project_id: project?.project_id,
        });
        if (response.status === 200) {
          console.log("init res:", response.data.espUrl);
          setEsp_url(response.data.espUrl);

          setButtonInvalid(true);
        }
      } catch (error) {
        console.error("Error initializing project:", error);
      }
    }
  };
  const handleLogout = async () => {
    const res = window.confirm("Do you want to LOGOUT?");
    if (!res) return;
    else {
      try {
        const response = await axios.get("http://localhost:5000/logout", {
          withCredentials: true,
        });

        if (response.status === 200) {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return <div>Loading project details...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!project) {
    return <div>Project not found!</div>;
  }
  const goToHome = () => {
    const result = window.confirm("Are you sure you want to leave?");
    if (!result) return;
    else {
      navigate("/");
    }
  };
  return (
    <>
      <header className="header">
        <nav className="h-nav">
          <div className="h-nav-div">
            <h2 className="h-nav-div-h2">SkySync IoT</h2>
          </div>
          <div
            className={togglebar ? "nav-menu show" : "nav-menu"}
            id="nav-menu"
          >
            <button
              className="nav-menu-close-btn"
              id="nav-menu-close-btn"
              onClick={ShowHeader}
            >
              <i className="fa fa-window-close"></i>
            </button>
            <ul className="nav-menu-list">
              <li className="nav-menu-item">
                <button onClick={goToHome} className="nav-menu-link">
                  Home
                </button>
              </li>
              <li className="nav-menu-item">
                <Link to="/profile" className="nav-menu-link">
                  PROFILE
                </Link>
              </li>
              <li className="nav-menu-item">
                <a href="#apikey" className="nav-menu-link text-nowrap">
                  API KEYS
                </a>
              </li>
              <li className="nav-menu-item">
                <Link to="/documentation" className="nav-menu-link">
                  Documentation
                </Link>
              </li>
              <li className="nav-menu-item">
                <button
                  id="home-login-btn"
                  className="nav-menu-link text-decoration-none text-white"
                  onClick={handleLogout}
                >
                  LOG OUT
                </button>
              </li>
            </ul>
          </div>
          <button
            className="nav-menu-toggle-btn"
            id="toggle-btn"
            onClick={ShowHeader}
          >
            <i className="fa fa-bars" aria-hidden="true"></i>
          </button>
        </nav>
      </header>
      <div className="project-details">
        <h2 className="text-center text-fuild project-name">
          {project.project_name}
        </h2>
        {/* <p className="text-center">Project ID: {project.project_id}</p> */}
      </div>
      <div className="d-flex justify-content-center mt-3">
        <button onClick={handleDeleteProject} className="btn btn-danger">
          DELETE PROJECT
        </button>
      </div>
      <hr style={{ border: "1px solid black", margin: "10px 0" }} />
      <div className="text-center mt-4 d-flex justify-content-around">
        <button
          className="btn btn-primary"
          onClick={handleShowModal}
          disabled={buttonInvalid}
        >
          Add Sensor
        </button>
      </div>

      {/* List of Sensors */}
      <div className="sensor-div d-flex flex-column container">
        <h3 className="text-center mt-4">Sensors</h3>
        {sensors.length > 0 ? (
          <ul className="">
            {sensors.map((sensor) => (
              <div
                className="col-12 d-flex justify-content-around align-items-center"
                key={sensor.sensor_id}
              >
                {/* Sensor Name and Key */}
                <div className="col-md-8 col-sm-9 d-flex align-items-center sensor-list my-1">
                  <li className="">
                    <strong>{sensor.sensor_name}:</strong> {sensor.sensor_key}
                  </li>
                </div>
                <div className="col-md-4 col-sm-3 d-flex justify-content-center">
                  <button
                    className="btn remove-btn"
                    onClick={() => handleRemoveSensor(sensor.sensor_id)}
                    disabled={buttonInvalid}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </ul>
        ) : (
          <p>No sensors added yet.</p>
        )}
      </div>

      {/* {!buttonInvalid && (
        <>
          <div className="init-btn-div d-flex flex-column  align-items-center container mb-4">
            <h4 className="h4 text-success text-center">NOTE</h4>
            <p>
              After finalizing your sensors, you have to click{" "}
              <strong>VIEW WRITE URL</strong> to get the ESP URL Link. Use this
              link to send data to the IoT Cloud Server.{" "}
            </p>
            <p>Click below to generate Write URL for your project.</p>

            <button onClick={handleInitializeProject} className="btn init-btn">
              VIEW WRITE URL
            </button>
          </div>
        </>
      )} */}

      <hr style={{ border: "1px solid black", margin: "10px 0" }} />

      <div className="init-btn-div d-flex flex-column  align-items-center container mb-4">
        <h4 className="h4 text-success text-center">NOTE</h4>
        <p>
          After finalizing your sensors, you have to click{" "}
          <strong>VIEW WRITE URL</strong> to get the ESP URL Link. Use this link
          to send data to the IoT Cloud Server.{" "}
          <span className="text-danger">
            <i>
              After adding or deleting any sensor, you must click the button or
              refresh the page to get updated URL
            </i>
          </span>
        </p>
        <p>Click below to generate Write URL for your project.</p>

        <button onClick={handleInitializeProject} className="btn init-btn">
          VIEW WRITE URL
        </button>

        <p className="mt-3">
          <strong>ESP_WRITE_URL: </strong>
          <span className="text-success">
            <i>{esp_url}</i>
          </span>
        </p>
      </div>

      <div className=" border rounded p-3" id="apikey">
        <h3 className="h3 text-center">Follow the Instructions:</h3>
        <p>Use this ESP_URL to send data to the IOT Cloud Server.</p>
        <p>
          <strong>ESP_WRITE_URL: </strong>
          <span className="text-success">
            <i>{esp_url}</i>
          </span>
        </p>
        <p>To use this, you need to go through some changes:</p>
        <ul>
          <li>Copy the whole URL and paste it into your ESP32 code.</li>
          <li>
            When sending data, replace the{" "}
            <strong>Sensor_name_value_field</strong> with actual sensor
            value(numerical sensor data)
          </li>
          <li>
            Use delay 15 seconds so that the data is properly handled by the
            cloud server.
          </li>
        </ul>
      </div>

      {/* {buttonInvalid && (
        <div className=" border rounded p-3">
          <h3 className="h3 text-center">Follow the Instructions:</h3>
          <p>Use this ESP_URL to send data to the IOT Cloud Server.</p>
          <p>
            <strong>ESP_URL: </strong>
            <span className="text-success">
              <i>{esp_url}</i>
            </span>
          </p>
          <p>To use this, you need to go through some changes:</p>
          <ul>
            <li>Copy the whole URL and paste it into your ESP32 code.</li>
            <li>
              When sending data, replace the{" "}
              <strong>Sensor_name_value_field</strong> with actual sensor
              value(numerical sensor data)
            </li>
            <li>
              Use delay 15 seconds so that the data is properly handled by the
              cloud server.
            </li>
          </ul>
        </div>
      )} */}

      {/* Modal for Adding Sensor */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Sensor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="sensorName">
              <Form.Label>Sensor Name</Form.Label>
              <Form.Control
                type="text"
                className="custom-hover-input border border-info"
                value={sensorName}
                onChange={(e) => setSensorName(e.target.value)}
                isInvalid={!!modalError}
              />
              <Form.Control.Feedback type="invalid">
                {modalError}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitSensor}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProjectDetails;
