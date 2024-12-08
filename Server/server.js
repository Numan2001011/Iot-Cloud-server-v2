import express from "express";
import cors from "cors";
import db from "./database.js";
import "dotenv/config";
import transporter from "./Transporter.js";
import jwt from "jsonwebtoken";
import session from "express-session";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT;

// Session middleware configuration
app.use(
  session({
    secret: process.env.SECRET_KEY, // Store your secret key in .env
    resave: false, // Prevents resaving session data unless modified
    saveUninitialized: false, // Prevents saving empty sessions
    cookie: {
      maxAge: 3600000, // Session expires in 1 hour (in milliseconds)
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    },
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost/phpmyadmin/index.php/",
    ],
    credentials: true, // Allow sending credentials with requestss
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser()); // Make sure this is before any route handling

db.connect();

app.post("/loginuser", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt: ", req.body);

  const checkUserSql = "SELECT * FROM user_table WHERE email = ?";

  try {
    // Check if the user exists by email
    const userResult = await new Promise((resolve, reject) => {
      db.query(checkUserSql, [email], (error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    if (userResult.length === 0) {
      // User does not exist
      return res
        .status(404)
        .json({ auth: false, message: "Invalid credentials." });
    }

    const user = userResult[0];
    if (user.password !== password) {
      return res
        .status(401)
        .json({ auth: false, message: "Invalid credentials." });
    }
    // Save user data in session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    };

    const id = user.id;
    const token = jwt.sign({ id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    // Check if the user is active
    // if (user.is_active === 0) {
    //     return res.status(403).send("User  account is not active. Please verify your email.");
    // }

    // Validate password (assuming you store hashed passwords, you should use a hashing library like bcrypt)
    // Here, you should compare the stored hashed password with the provided password
    // For demonstration, let's assume the password is stored in plain text (not recommended)

    // Set the token in the HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Ensure JavaScript cannot access the cookie
      secure: process.env.NODE_ENV === "production", // Use 'secure' in production
      maxAge: 3600000, // 1 hour
    });
    // Successful login
    res.status(200).json({
      message: "Login successful",
      auth: true,
      token: token,
      user: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ auth: false, message: "Error logging in." });
  }
});

const verifyJWT = (req, res, next) => {
  const token = req.cookies.token; // Access the token from the cookie

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ auth: false, message: "Token expired." });
      }
      return res.status(401).json({ auth: false, message: "Invalid token." });
    }
    req.user_id = decoded.id;
    next();
  });
};

app.get("/checkauth", verifyJWT, (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ auth: false, message: "No active session." });
  }

  res.status(200).json({
    auth: true,
    message: "User is authenticated.",
    user: req.session.user,
  });
});

//when user will call the api, it will call the verifyJWT middleware first
app.get("/getuser", verifyJWT, (req, res) => {
  if (!req.session.user) {
    return res.status(404).json({ message: "User session not found." });
  }
  res.status(200).json(req.session.user);
});

app.post("/signup/registerusers", async (req, res) => {
  const { email, username, name, password } = req.body;
  console.log("from backend: ", req.body);

  const is_active = 0;
  const project_count = 0;

  const checkEmailSql = "SELECT is_active FROM user_table WHERE email = ?";
  const checkUsernameSql = "SELECT * FROM user_table WHERE username = ?";
  const insertUserSql =
    "INSERT INTO user_table (email, username, name, password, is_active, project_count) VALUES(?,?,?,?,?,?)";

  // Insert new user if validations pass
  const uservalues = [
    email,
    username,
    name,
    password,
    is_active,
    project_count,
  ];
  try {
    // Check if the email exists
    const emailResult = await new Promise((resolve, reject) => {
      db.query(checkEmailSql, [email], (error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    if (emailResult.length > 0) {
      // Email exists
      if (emailResult[0].is_active === 0) {
        // User is not active
        return res
          .status(302)
          .send(
            "Email already exists but not active. Verify your email using OTP."
          );
      } else {
        // User is active
        return res
          .status(409)
          .send("Email already exists and active. Please login.");
      }
    }

    // Check if the username exists
    const usernameResult = await new Promise((resolve, reject) => {
      db.query(checkUsernameSql, [username], (error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    if (usernameResult.length > 0) {
      // Username exists
      return res.status(409).send("Username already exists.");
    }

    await new Promise((resolve, reject) => {
      db.query(insertUserSql, uservalues, (error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    res.status(201).send("User successfully saved.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user.");
  }
});

app.post("/createproject", verifyJWT, async (req, res) => {
  console.log("Creating project with body:", req.body);
  console.log("Session user:", req.session.user);

  if (!req.session.user) {
    return res
      .status(403)
      .json({ message: "User is not authorized to create a project." });
  }

  console.log("Request body:", req.body);
  console.log("Session user:", req.session.user);

  const project_status = 0;
  const { project_name } = req.body;
  const username = req.session.user.username; // Use the logged-in user's username
  const createUrl =
    "INSERT into project_table(username, project_name, project_status) VALUES(?,?,?)";
  const projectValues = [username, project_name, project_status];
  try {
    const projectResult = await new Promise((resolve, reject) => {
      db.query(createUrl, projectValues, (error, data) => {
        if (error) {
          console.error("Database error:", error);
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
    res.status(201).json({ message: "Project created successfully." });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).send("Error creating project.");
  }
});

//project get method
app.get("/getprojects", verifyJWT, async (req, res) => {
  // console.log("Getting projects for user:", req.session.user.username);
  if (!req.session.user) {
    return res
      .status(401)
      .json({ message: "User is not authorized to create a project." });
  }
  const username = req.session.user.username;

  const fetchProjectsSql = "SELECT * FROM project_table WHERE username = ?";
  try {
    const projects = await new Promise((resolve, reject) => {
      db.query(fetchProjectsSql, [username], (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
    if (!projects) {
      return res
        .status(404)
        .json({ auth: false, message: "No projects found." });
    }
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ auth: false, message: "Error retrieving projects." });
  }
});

const baseUrl = " http://192.168.1.104:5000/sendespdata/"; //change this when changing the network

app.get("/showproject/:id", verifyJWT, async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "401 Unauthorized" });
  }
  const projectId = req.params.id;
  console.log("pid:", typeof projectId);
  const username = req.session.user.username;
  const findprojectuser =
    "SELECT username from project_table WHERE project_id = ?";

  try {
    const projectuser = await new Promise((resolve, reject) => {
      db.query(findprojectuser, [projectId], (error, results) => {
        if (error) reject(error);
        else resolve(results[0]);
      });
    });
    if (!projectuser || projectuser.username !== username) {
      return res.status(403).json({ message: "403 Forbidden: Access denied." });
    }
    const project = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM project_table WHERE username = ? AND project_id = ?",
        [username, projectId],
        (error, results) => {
          if (error) reject(error);
          else resolve(results[0]);
        }
      );
    });

    if (!project) {
      return res
        .status(404)
        .json({ auth: false, message: "Project not found." });
    }

    const sensors = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM sensor_table WHERE project_id = ?",
        [projectId],
        (error, results) => {
          if (error) reject(error);
          else resolve(results);
        }
      );
    });

    const project_status = await new Promise((resolve, reject) => {
      db.query(
        "SELECT project_status from project_table WHERE project_id=?",
        [projectId],
        (error, results) => {
          if (error) reject(error);
          else resolve(results[0].project_status);
        }
      );
    });

    if (sensors.length !== 0 && project_status == 1) {
      const espUrl =
        baseUrl +
        sensors
          .map(
            (sensor, index) =>
              `${sensor.sensor_key}=${sensor.sensor_name.replace(
                /\s+/g,
                ""
              )}_value_field`
          )
          .join("&&");
      console.log("Number of sensors : ", sensors.length);
      console.log("espurl: ", espUrl);

      res.json({ auth: true, project, sensors, espUrl });
    } else {
      res.json({
        auth: true,
        project,
        sensors,
        espUrl: "No sensors found in the project.",
      });
    }
  } catch (error) {
    console.error("Error fetching project details:", error);
    res
      .status(500)
      .json({ auth: false, message: "Error fetching project details." });
  }
});

app.delete("/deleteproject/:project_id", verifyJWT, async (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ message: "User is not authorized to create a project." });
  }
  const project_id = parseInt(req.params.project_id);
  const username = req.session.user.username;
  const findprojectuser =
    "SELECT username from project_table WHERE project_id = ?";

  const deleteprojectQuery =
    "DELETE from project_table where username = ? AND project_id = ?";

  try {
    const projectuser = await new Promise((resolve, reject) => {
      db.query(findprojectuser, [project_id], (error, results) => {
        if (error) reject(error);
        else resolve(results[0]);
      });
    });
    if (!projectuser || projectuser.username !== username) {
      return res.status(403).json({ message: "403 Forbidden: Access denied." });
    }
    const result = await new Promise((resolve, reject) => {
      db.query(deleteprojectQuery, [username, project_id], (error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ auth: true, message: "Project successfully deleted." });
    } else {
      res.status(404).json({ auth: false, message: "Project not found." });
    }
  } catch (error) {
    console.error("Project deleting error:", error);
    res
      .status(500)
      .json({ auth: false, message: "Failed to delete the project." });
  }
});

app.post("/addsensor", verifyJWT, async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unathorized to add sensor." });
  }
  const { project_id, sensor_name } = req.body;

  if (!project_id || !sensor_name) {
    return res
      .status(400)
      .json({ message: "Project ID and Sensor Name are required." });
  }
  const firstWord = sensor_name.split(" ")[0];

  const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
  const sensor_key = `${firstWord}${project_id}${randomString}`;

  const insertSensorQuery =
    "INSERT INTO sensor_table (project_id, sensor_name, sensor_key) VALUES (?, ?, ?)";
  const sensorValues = [project_id, sensor_name, sensor_key];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSensorQuery, sensorValues, (error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    const sensor = {
      sensor_id: result.insertId,
      sensor_name,
      sensor_key,
    };

    res.status(201).json({ message: "Sensor added successfully.", sensor });
  } catch (error) {
    console.error("Error adding sensor:", error);
    res.status(500).json({ message: "Error adding sensor." });
  }
});

// DELETE request to remove a sensor
app.delete("/removesensor/:sensor_id", verifyJWT, async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "401 Unauthorized." });
  }
  const sensor_id = parseInt(req.params.sensor_id);
  console.log("Sensorid:", typeof sensor_id);
  const username = req.session.user.username;

  const findsensorUser =
    "SELECT username FROM project_table WHERE project_id = ( SELECT project_id FROM sensor_table WHERE sensor_id = ?)";

  const deleteSensorQuery = "DELETE from sensor_table WHERE sensor_id = ?";
  try {
    const sensorUser = await new Promise((resolve, reject) => {
      db.query(findsensorUser, [sensor_id], (error, results) => {
        if (error) reject(error);
        else resolve(results[0]);
      });
    });
    console.log("Sensoruser: ", sensorUser);
    if (!sensorUser || sensorUser.username !== username) {
      return res.status(403).json({ message: "403 Forbidden: Access denied." });
    }
    //if valid user, delete sensor here
    const result = await new Promise((resolve, reject) => {
      db.query(deleteSensorQuery, [sensor_id], (error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
    if (result.affectedRows > 0) {
      res
        .status(200)
        .send({ auth: true, message: "Sensor removed successfully" });
    } else {
      res.status(403).send({ auth: false, message: "403 Forbidden" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ auth: false, message: "Failed to remove sensor" });
  }
});

app.post("/initproject", verifyJWT, async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "401 Unauthorized." });
  }
  const { project_id } = req.body;

  console.log("Project Id:", project_id);
  const changeProjectStatus =
    "UPDATE project_table SET project_status = 1 WHERE project_id = ?";
  const projectValues = [project_id];

  try {
    // Update the project status
    const project_status = await new Promise((resolve, reject) => {
      db.query(changeProjectStatus, projectValues, (error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    // Retrieve sensor keys
    const sensorKeyQuery =
      "SELECT sensor_name, sensor_key FROM sensor_table WHERE project_id = ?";
    const get_sensor_key = await new Promise((resolve, reject) => {
      db.query(sensorKeyQuery, projectValues, (error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    if (project_status.affectedRows > 0 && get_sensor_key.length > 0) {
      const espUrl =
        baseUrl +
        get_sensor_key
          .map(
            (sensor, index) =>
              `${sensor.sensor_key}=${sensor.sensor_name.replace(
                /\s+/g,
                ""
              )}_value_field`
          )
          .join("&&");

      res.status(200).json({ auth: true, espUrl });
    } else if (get_sensor_key.length == 0) {
      res
        .status(200)
        .json({ auth: true, espUrl: "No sensor found in the project." });
    } else {
      res.status(404).json({
        auth: true,
        message: "Project not found or no sensors available",
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ auth: false, message: "Failed to initialize project" });
  }
});

app.get("/sendespdata/:datastring", async (req, res) => {
  try {
    const data_string = req.params.datastring;
    console.log("ESP String:", data_string);
    const sensorvaluepairs = data_string.split("&&");
    console.log("value pair:", sensorvaluepairs);

    const sensorData = sensorvaluepairs.map((pair) => {
      const [sensor_key, sensor_value] = pair.split("=");
      return { sensor_key, sensor_value };
    });
    console.log(sensorData);
    for (const { sensor_key, sensor_value } of sensorData) {
      const sensorId = await new Promise((resolve, reject) => {
        db.query(
          "SELECT sensor_id from sensor_table where sensor_key = ?",
          [sensor_key],
          (error, data) => {
            if (error) reject(error);
            if (data.length === 0) return resolve(null);
            resolve(data[0].sensor_id);
          }
        );
      });
      if (!sensorId) {
        console.error(`Sensor not found with ${sensor_key}`);
        continue;
      }
      await new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO sensordata_table (sensor_id, sensor_value, arrival_time) VALUES (?,?,?)",
          [sensorId, sensor_value, new Date()],
          (error, data) => {
            if (error) reject(error);
            resolve(data);
          }
        );
      });
      console.log(`Data saved: sensor id ${sensorId}, Value ${sensor_value}`);
    }
    res.status(200).json({ message: "Sensor data saved successfully." });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Failed to save sensor data" });
  }
});

app.get("/sensordata/:project_id", verifyJWT, async (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ message: "User is not authorized to create a project." });
  }
  const project_id = parseInt(req.params.project_id);

  if (!project_id) {
    return res.status(400).json({ error: "Project_id is required" });
  }

  const username = req.session.user.username;
  const findprojectuser =
    "SELECT username from project_table WHERE project_id = ?";

  const fetchSensorDataSql =
    "WITH RankedData AS ( SELECT project_table.project_id, sensor_table.sensor_id, sensor_table.sensor_name, sensordata_table.sensor_value, sensordata_table.arrival_time, ROW_NUMBER() OVER (PARTITION BY sensor_table.sensor_id ORDER BY sensordata_table.arrival_time ASC) AS rn FROM project_table INNER JOIN sensor_table ON sensor_table.project_id = project_table.project_id INNER JOIN sensordata_table ON sensor_table.sensor_id = sensordata_table.sensor_id WHERE project_table.project_id = ?) SELECT project_id, sensor_id, sensor_name, sensor_value, arrival_time FROM RankedData WHERE rn <= 10 ORDER BY sensor_id, arrival_time ASC";
  try {
    const projectuser = await new Promise((resolve, reject) => {
      db.query(findprojectuser, [project_id], (error, results) => {
        if (error) reject(error);
        else resolve(results[0]);
      });
    });
    if (!projectuser || projectuser.username !== username) {
      return res.status(403).json({ message: "403 Forbidden: Access denied." });
    }

    const sensorData = await new Promise((resolve, reject) => {
      db.query(fetchSensorDataSql, [project_id], (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
    console.log("SensorData:", sensorData);

    if (sensorData.length === 0) {
      return res
        .status(404)
        .json({ error: "No data found for this sensor_id" });
    }

    res.status(200).json(sensorData);
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    res.status(500).json({ error: "Error fetching sensor data." });
  }
});

app.get("/logout", verifyJWT, (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ message: "User is not authorized to create a project." });
  }
  res.clearCookie("token"); // Clear the JWT cookie
  res.status(200).json({ message: "Logged out successfully." });
});

app.get("/", (req, res) => {
  return res.json({ msg: "Hello world" });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
