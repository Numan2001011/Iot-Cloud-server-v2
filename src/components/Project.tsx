import React from "react";
import "./Project.css";

interface ProjectProps {
  projectname: string;
  project_id: number;
  num_of_sensors: number;
  sensor_names: string[];
}

const Project: React.FC<ProjectProps> = ({
  projectname,
  project_id,
  num_of_sensors,
  sensor_names,
}) => {
  return (
    <div className="project card mb-3">
      <h4>{projectname}</h4>
      <p>Project ID: {project_id}</p>
      <p>Number of Sensors: {num_of_sensors}</p>
      <p>Sensors: {sensor_names.join(", ")}</p>
    </div>
  );
};

export default Project;
