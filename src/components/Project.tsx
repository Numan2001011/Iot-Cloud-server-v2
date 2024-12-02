import React from "react";
import "./Project.css";

interface ProjectProps {
  projectname: string;
  num_of_sensors: number;
  sensor_names: string[];
}

const Project: React.FC<ProjectProps> = ({
  projectname,
  num_of_sensors,
  sensor_names,
}) => {
  return (
    <div className="project card mb-3">
      <h3>{projectname}</h3>
      <p>Number of Sensors: {num_of_sensors}</p>
      <p>Sensors: {sensor_names.join(", ")}</p>
    </div>
  );
};

export default Project;
