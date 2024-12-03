import React from "react";
import "./Projectlist.css";

interface ProjectProps {
  project_name: string;
  project_id: number;
  // num_of_sensors: number;
  // sensor_names: string[];
  onClick: () => void;
}

const Projectlist: React.FC<ProjectProps> = ({
  project_name,
  project_id,
  // num_of_sensors,
  // sensor_names,
  onClick,
}) => {
  return (
    <div className="project card mb-3" onClick={onClick}>
      <h4>{project_name}</h4>
      <p>Project ID: {project_id}</p>
      {/* <p>Number of Sensors: {num_of_sensors}</p>
      <p>Sensors: {sensor_names.join(", ")}</p> */}
    </div>
  );
};

export default Projectlist;
