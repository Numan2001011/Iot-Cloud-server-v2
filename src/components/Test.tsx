import { useState } from "react";
import profileixon from "../../images/profileicon.png";
import "./Profile.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";
import { z } from "zod";

interface Userinfo {
  name: string;
  username: string;
}

const sensorSchema = z
  .string()
  .min(1, "Sensor name is required")
  .regex(/[a-zA-Z]/, "Use a valid sensor name.");

const schema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  numSensors: z.number().min(1, "At least one sensor is required"),
  sensorNames: z
    .array(sensorSchema)
    .min(1, "At least one sensor name is required"),
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

  const handleNumSensorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setNumSensors(value);
    setSensorNames(Array(value).fill("")); // Reset sensor names based on new number
  };

  const handleSensorNameChange = (index: number, value: string) => {
    const updatedSensorNames = [...sensorNames];
    updatedSensorNames[index] = value;
    setSensorNames(updatedSensorNames);
  };

  const resetForm = () => {
    setProjectName("");
    setNumSensors(0);
    setSensorNames([]);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form data
    const result = schema.safeParse({
      projectName,
      numSensors,
      sensorNames,
    });

    if (!result.success) {
      const validationErrors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        validationErrors[err.path[0]] = err.message;
      });
      setErrors(validationErrors);
      return;
    }

    // Handle form submission logic here
    console.log("Project Name:", projectName);
    console.log("Number of Sensors:", numSensors);
    console.log("Sensor Names:", sensorNames);
    handleClose(); // Close modal after submission
  };

  return (
    <>
      <section className="d-flex justify-content-center align-items-center mx-auto p-5">
        <div className="row col-12">
          <div className="col-md-3 col-12 card profile-section mb-5 d-flex align-items-center">
            <h4 className="h4">Profile Info</h4>
            <img
              src={profileixon}
              alt="Profile Icon"
              height="100px"
              width="100px"
            />
            <p>Name: {userinfo?.name || "Md. Numanur Rahman"}</p>
            <p>Username: {userinfo?.username || "noman011"}</p>
          </div>
          <div className="col-md-9 col-12 project-section">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="h4">Your Projects</h4>
              <button className="create-project-button" onClick={handleShow}>
                Create New Project
              </button>
            </div>
            <div className="text-center mt-5">
              <p>No Project available.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal for Creating New Project */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="projectName">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                isInvalid={!!errors.projectName}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.projectName}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="numSensors">
              <Form.Label>Number of Sensors</Form.Label>
              <Form.Control
                type="number"
                value={numSensors}
                onChange={handleNumSensorsChange}
                min={1}
                isInvalid={!!errors.numSensors}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.numSensors}
              </Form.Control.Feedback>
            </Form.Group>
            {Array.from({ length: numSensors }).map((_, index) => (
              <Form.Group key={index} controlId={`sensorName${index}`}>
                <Form.Label>Sensor Name {index + 1}</Form.Label>
                <Form.Control
                  type="text"
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
            ))}
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
