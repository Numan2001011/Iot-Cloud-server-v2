// SensorGraph.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../URL";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface SensorData {
  project_id: number;
  sensor_name: string;
  sensor_value: number;
  arrival_time: string;
}

interface SensorGraphProps {
  projectId: number;
}

const SensorGraph: React.FC<SensorGraphProps> = ({ projectId }) => {
  const ip = URL();
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensorData = async () => {
    try {
      const response = await axios.get(`${ip}/sensordata/${projectId}`, {
        withCredentials: true,
      });
      setSensorData(response.data);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      if (axios.isAxiosError(err) && err.response) {
        setError("Failed to fetch sensor data.");
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#ff0000",
    "#00ff00",
    "#0000ff",
  ];

  useEffect(() => {
    fetchSensorData(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchSensorData(); // Fetch data every 5 seconds
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [projectId]);

  if (loading) {
    return <div>Loading sensor data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const groupedData: {
    [key: string]: { arrival_time: string; value: number }[];
  } = {};

  sensorData.forEach((data) => {
    const { sensor_name, sensor_value, arrival_time } = data;
    if (!groupedData[sensor_name]) {
      groupedData[sensor_name] = [];
    }
    groupedData[sensor_name].push({ arrival_time, value: sensor_value });
  });

  return (
    <div>
      {Object.keys(groupedData).map((sensorName, index) => (
        <div key={sensorName}>
          <h3 className="text-center">{sensorName}</h3>
          <AreaChart width={1000} height={400} data={groupedData[sensorName]}>
            <XAxis dataKey="arrival_time" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="value"
              // stroke={colors[index % colors.length]}
              stroke="black"
              strokeWidth={2} // Border thickness
              fill={colors[index % colors.length]}
              dot={{ stroke: "#000", strokeWidth: 2, fill: "#fff" }}
            />
          </AreaChart>
        </div>
      ))}
    </div>
  );
};

export default SensorGraph;
