import { useEffect, useState } from "react";
import profileixon from "../../images/profileicon.png";
import "./Profile.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";
import { z } from "zod";
import axios from "axios";
import Project from "./Projectlist";
import { Link, useNavigate } from "react-router-dom";

interface Userinfo {
  name: string;
  username: string;
  email: string;
}

const schema = z.object({
  projectName: z.string().min(1, "Project name is required"),
});

const Profile = () => {
  const [togglebar, setTogglebar] = useState(false);
  const ShowHeader = () => {
    setTogglebar(!togglebar);
  };
  const [userinfo, setuserinfo] = useState<Userinfo | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const navigate = useNavigate();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getUserInfo = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getuser", {
        withCredentials: true,
      });
      setuserinfo(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  // const goToHome = () => {
  //   const result = window.confirm("Are you sure you want to leave?");
  //   if (!result) return;
  //   else {
  //     navigate("/");
  //   }
  // };

  const goToHome = async () => {
    const res = window.confirm("Are you sure you want to leave?");
    if (!res) return;
    else {
      try {
        const response = await axios.get("http://localhost:5000/logout", {
          withCredentials: true,
        });

        if (response.status === 200) {
          navigate("/");
        }
      } catch (error) {
        console.error("Error going home:", error);
      }
    }
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setProjectName("");
    setErrors({});
  };

  const formData = {
    project_name: projectName,
  };

  const submitProject = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/createproject",
        formData,
        { withCredentials: true }
      );

      if (response.status === 201) {
        alert(response.data.message || "Project created successfully.");
        await fetchProjects();
      } else {
        console.error("Unexpected response:", response);
        alert("Unexpected response from the server.");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Server error response:", error.response);
        alert(error.response.data.message || "Failed to create project.");
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
    });

    if (!result.success) {
      const validationErrors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        validationErrors[err.path[0]] = err.message;
      });
      setErrors(validationErrors);
      return;
    }
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
      const response = await axios.get("http://localhost:5000/getprojects", {
        withCredentials: true,
      });
      console.log("response code: ", response.status);
      if (response.status == 401) {
        alert("You are not authorized to view project.");
      } else if (response.status == 404) {
        alert("No projects found. Please create a new project.");
      }
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
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
  const checkAuthentication = async () => {
    try {
      const response = await axios.get("http://localhost:5000/checkauth", {
        withCredentials: true,
      });
      if (response.data.auth) {
        console.log("Authentication verified:", response.data);
      } else {
        // alert("You are not authenticated. Redirecting to login.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      // alert("Unable to verify authentication. Redirecting to login.");
      navigate("/login");
    }
  };

  useEffect(() => {
    const initializeProfile = async () => {
      await checkAuthentication();
      await getUserInfo();
      await fetchProjects();
    };

    initializeProfile();
  }, [navigate]);

  const handleProjectClick = (project: { project_id: number }) => {
    alert("Entering into project");
    navigate(`/project/${project.project_id}`);
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
                <a href="#projects" className="nav-menu-link">
                  Projects
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
            <div>
              <p className="">Name : {userinfo?.name || "YOUR NAME"}</p>
              <p className="">
                Username : {userinfo?.username || "YOUR USERNAME"}
              </p>
              <p>Email: {userinfo?.email || "youremail@gmail.com"}</p>
            </div>
          </div>
          <div className="col-md-8 project-section container" id="projects">
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
                    // project_id={project.project_id}
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
