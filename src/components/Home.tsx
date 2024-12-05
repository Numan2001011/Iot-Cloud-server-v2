import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import iot from "../../images/iot.jpg";
import "./Home.css";
import { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [togglebar, setTogglebar] = useState(false);
  const ShowHeader = () => {
    setTogglebar(!togglebar);
  };
  gsap.registerPlugin(useGSAP);
  useGSAP(() => {
    gsap.from(".h-nav-div", {
      opacity: 0,
      y: -10,
      delay: 0.1,
      duration: 0.1,
    });
    // Navigation Menu //
    gsap.from(".nav-menu-list .nav-menu-item", {
      opacity: 0,
      y: -10,
      delay: 0.2,
      duration: 0.2,
      stagger: 0.1,
    });
  }, {});

  return (
    <div>
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
                <a href="#" className="nav-menu-link">
                  Home
                </a>
              </li>
              <li className="nav-menu-item">
                <a href="#features" className="nav-menu-link">
                  Features
                </a>
              </li>
              <li className="nav-menu-item">
                <a href="#contact" className="nav-menu-link">
                  Contact
                </a>
              </li>
              <li className="nav-menu-item">
                <Link
                  to="/Registration"
                  id="home-login-btn"
                  className="nav-menu-link text-decoration-none text-white"
                >
                  Sign up/Login
                </Link>
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

      <section className="wrapper">
        <div className="w-div container">
          <div className="w-div-div grid-cols-2">
            {/* Text item to the left */}
            <div className="w-div-div-div grid-item-1">
              <h1 className="main-heading">
                Welcome to <span>SKySync IoT</span>
                <br />
                <span id="main-heading-p2">
                  A comprehensive IoT Cloud Solution
                </span>
              </h1>
              <p className="wrapper-info-text">
                A beautiful, user-friendly cloud platform for IoT connectivity,
                data storage, and real-time project management."
              </p>
              <div className="wrapper-btn">
                {/* <button className="mybtn get-started-btn"></button> */}
                <Link
                  to="/Login"
                  className="mybtn get-started-btn text-decoration-none text-white"
                >
                  Get Started
                </Link>
                <Link
                  to="/documentation"
                  className="mybtn get-started-btn text-decoration-none documentation-btn"
                >
                  documentation
                </Link>
              </div>
            </div>

            {/* Images to the right side */}
            <div className="grid-item-2">
              <div className="wrapper-project-img">
                <img src={iot} alt="team-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wrapper" id="features">
        <div className="container">
          <div className="grid-cols-4">
            <div className="grid-cols-item">
              <div className="grid-icon">
                <i
                  className="fa fa-cloud"
                  style={{ fontSize: "48px", color: "rgb(0, 75, 161)" }}
                ></i>
              </div>
              <div className="featured-info">
                <span>Centralized Device Management</span>
                <p>
                  Seamlessly connect and control all your IoT devices through a
                  unified platform, ensuring real-time monitoring and enhanced
                  accessibility for users across the globe.
                </p>
              </div>
            </div>

            <div className="grid-cols-item">
              <div className="grid-icon">
                <i
                  className="fa fa-database"
                  style={{ fontSize: "48px", color: "rgb(0, 75, 161)" }}
                ></i>
              </div>
              <div className="featured-info">
                <span>Scalable Data Storage</span>
                <p>
                  Effortlessly store, manage, and retrieve vast amounts of IoT
                  data with high reliability and scalability to meet the demands
                  of modern IoT ecosystems.
                </p>
              </div>
            </div>
            <div className="grid-cols-item">
              <div className="grid-icon">
                <i
                  className="fa fa-lock"
                  style={{ fontSize: "48px", color: "rgb(0, 75, 161)" }}
                ></i>
              </div>
              <div className="featured-info">
                <span>Advanced Security Features</span>
                <p>
                  Ensure the safety of your IoT ecosystem with encryption,
                  secure communication protocols, and robust authentication
                  mechanisms to protect sensitive data and devices.
                </p>
              </div>
            </div>
            <div className="grid-cols-item">
              <div className="grid-icon">
                <i
                  className="fa fa-chart-line"
                  style={{ fontSize: "48px", color: "rgb(0, 75, 161)" }}
                ></i>
              </div>
              <div className="featured-info">
                <span>Real-Time Analytics</span>
                <p>
                  Gain actionable insights with powerful analytics tools to
                  monitor device performance, detect anomalies, and optimize IoT
                  operations in real time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="footer-content container">
          <h3>SkySync IoT: Transforming the Future with IoT Cloud Solutions</h3>
          <p>
            Designed as a cutting-edge IoT cloud server, this platform caters to
            innovative solutions for seamless device connectivity and data
            management. Developed by some passionate minds, SkySync IoT is ready
            to redefine efficiency and scalability in the IoT ecosystem.
          </p>
        </div>
        <div className="contact">
          <p>Phone no: 01641578822</p>
          <p>Email: 2001011@bdu.ac.bd</p>
        </div>
        <div className="footer-bottom">
          <p>
            copyright &copy;2024 <a href="#">SkySync IoT</a>{" "}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
