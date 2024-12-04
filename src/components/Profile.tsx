import { useEffect, useState } from "react";
import profileixon from "../../images/profileicon.png";
import "./Profile.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";
import { z } from "zod";
import axios from "axios";
import Project from "./Projectlist";
import { useNavigate } from "react-router-dom";

interface Userinfo {
  name: string;
  username: string;
}

// const sensorSchema = z
//   .string()
//   .min(1, "Sensor name is required")
//   .regex(/[a-zA-Z]/, "Use a valid sensor name.");

const schema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  // numSensors: z.number().min(1, "At least one sensor is required"),
  // sensorNames: z
  //   .array(sensorSchema)
  //   .min(1, "At least one sensor name is required"),
});

const Profile = () => {
  const [userinfo, setuserinfo] = useState<Userinfo | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [numSensors, setNumSensors] = useState(0);
  const [sensorNames, setSensorNames] = useState<string[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  // const handleNumSensorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = parseInt(e.target.value);
  //   setNumSensors(value);
  //   setSensorNames(Array(value).fill("")); // Reset sensor names based on new number
  // };

  // const handleSensorNameChange = (index: number, value: string) => {
  //   const updatedSensorNames = [...sensorNames];
  //   updatedSensorNames[index] = value;
  //   setSensorNames(updatedSensorNames);
  // };

  const resetForm = () => {
    setProjectName("");
    // setNumSensors(0);
    // setSensorNames([]);
    setErrors({});
  };

  const formData = {
    project_name: projectName,
    // num_of_sensors: numSensors,
    // sensor_names: sensorNames.toString(),
  };

  const submitProject = async () => {
    try {
      console.log("project data: ", formData);
      // Send POST request
      const response = await axios.post(
        "http://localhost:5000/createproject",
        formData
      );

      if (response.status === 201) {
        alert(response.data.message || "Project created successfully.");
        await fetchProjects();
      } else {
        alert("Unexpected response from the server.");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Server error response:", error.response);
        alert(error.response.data || "Failed to create project.");
      } else {
        console.error("Network or unknown error:", error);
        alert("Unable to connect to the server.");
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form data
    const result = schema.safeParse({
      projectName,
      // numSensors,
      // sensorNames,
    });

    if (!result.success) {
      const validationErrors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        validationErrors[err.path[0]] = err.message;
      });
      setErrors(validationErrors);
      return;
    }

    console.log("Sensors:", sensorNames);
    try {
      await submitProject(); // Call the API
      handleClose(); // Close modal after successful submission
    } catch (error) {
      console.error("Error submitting project:", error);
    }
  };

  const [projects, setProjects] = useState<any[]>([]); // State for projects

  // Fetch projects from the server
  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getprojects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      alert("Failed to fetch projects.");
    }
  };

  useEffect(() => {
    fetchProjects(); // Fetch projects when the component mounts
  }, []);

  const navigate = useNavigate();

  const handleProjectClick = (project: { project_id: number }) => {
    alert("Entering into project");
    navigate(`/project/${project.project_id}`);
  };

  return (
    <>
      <section className="d-flex justify-content-center align-items-center mx-auto p-5">
        <div className="row col-12">
          <div className="profile-section col-md-3 card d-flex align-items-center">
            <h4 className="h4">Profile Info</h4>
            <img
              src={profileixon}
              alt="Profile Icon"
              height="100px"
              width="100px"
            />
            <p className="">Name : {userinfo?.name || "Md. Numanur Rahman"}</p>
            <p>Username : {userinfo?.username || "noman011"}</p>
          </div>
          <div className="col-md-8 project-section container">
            <div className="d-flex justify-content-around align-items-center">
              <h4 className="h4">Your Projects</h4>
              <button className="create-project-button" onClick={handleShow}>
                Create New Project
              </button>
            </div>
            <div className="text-center mt-2">
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <Project
                    key={index}
                    project_name={project.project_name}
                    project_id={project.project_id}
                    // num_of_sensors={project.num_of_sensors}
                    // sensor_names={project.sensor_names.split(",")}
                    onClick={() => handleProjectClick(project)}
                  />
                ))
              ) : (
                <p>No Project available.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal for Creating New Project */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="text-center">Create New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="projectName">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                className="custom-hover-input border border-info"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                isInvalid={!!errors.projectName}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.projectName}
              </Form.Control.Feedback>
            </Form.Group>
            {/* <Form.Group controlId="numSensors"> */}
            {/* <Form.Label>Number of Sensors</Form.Label>
              <Form.Control
                type="number"
                className="custom-hover-input border border-info"
                value={numSensors}
                onChange={handleNumSensorsChange}
                min={1}
                isInvalid={!!errors.numSensors}
                required
              />

              <Form.Control.Feedback type="invalid">
                {errors.numSensors}
              </Form.Control.Feedback>
            </Form.Group> */}
            {/* {Array.from({ length: numSensors }).map((_, index) => (
              <Form.Group key={index} controlId={`sensorName${index}`}>
                <Form.Label>Sensor Name {index + 1}</Form.Label>
                <Form.Control
                  type="text"
                  className="custom-hover-input border border-info"
                  value={sensorNames[index]}
                  onChange={(e) =>
                    handleSensorNameChange(index, e.target.value)
                  }
                  isInvalid={!!errors.sensorNames}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.sensorNames}
                </Form.Control.Feedback>
              </Form.Group>
            ))} */}
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Profile;
