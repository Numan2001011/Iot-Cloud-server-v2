import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  // const fetchProject = async () => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:5000/showproject/${id}`
  //     );

  //     console.log("FROM API: ", response.data);
  //     setProject(response.data);
  //     console.log(project);

  //     setLoading(false);
  //   } catch (err) {
  //     setError("Failed to fetch project details.");
  //     setLoading(false);
  //   }
  // };

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/showproject/${id}`
      );
      setProject(response.data.project);
      setSensors(response.data.sensors); // Assuming the API returns project and sensors
      setLoading(false);
      if (response.data.project.project_status == 1) {
        setButtonInvalid(true);
      } else {
        setButtonInvalid(false);
      }
    } catch (err) {
      setError("Failed to fetch project details.");
      setLoading(false);
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

  const [buttonInvalid, setButtonInvalid] = useState(false);
  const handleInitializeProject = async () => {
    console.log("Initialized project: ", project?.project_name);

    const windowresult = window.confirm(
      `Once you initialize the project, you cannot modify sensors. Do you want to proceed?`
    );
    if (!windowresult) return;
    else {
      try {
        const response = await axios.post("http://localhost:5000/initproject", {
          project_id: project?.project_id,
        });
        if (response.status === 200) {
          setButtonInvalid(true);
        }
      } catch (error) {
        console.error("Error initializing project:", error);
      }
    }
  };

  useEffect(() => {
    fetchProject();
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

  return (
    <>
      <div className="project-details">
        <h2 className="text-center text-fuild project-name">
          {project.project_name}
        </h2>
        <p className="text-center">Project ID: {project.project_id}</p>
      </div>
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

      <div className="sensor-div d-flex flex-column container">
        {!buttonInvalid && (
          <button onClick={handleInitializeProject}>Initialize Project</button>
        )}
      </div>

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
