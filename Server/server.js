import express from "express";
import cors from "cors";
import db from "./database.js";
import transporter from "./Transporter.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
      return res.status(404).json({ message: "Invalid credentials." });
    }

    const user = userResult[0];

    // Check if the user is active
    // if (user.is_active === 0) {
    //     return res.status(403).send("User  account is not active. Please verify your email.");
    // }

    // Validate password (assuming you store hashed passwords, you should use a hashing library like bcrypt)
    // Here, you should compare the stored hashed password with the provided password
    // For demonstration, let's assume the password is stored in plain text (not recommended)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Successful login
    res.status(200).send({
      message: "Login successful",
      email: user.email,
      name: user.name,
      username: user.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in." });
  }
});

// // Login route
// app.post("/loginuser", async (req, res) => {
//   const { email, password } = req.body;

//   // SQL query to find the user by email, selecting only email and password
//   const query = "SELECT email, password FROM users WHERE email = ?";

//   try {
//     // Use a promise-based approach for the database query
//     const [results] = await db.promise().query(query, [email]);

//     // Check if the user exists
//     if (results.length === 0) {
//       return res.status(404).json({ message: "Email doesn't exist." });
//     }

//     const user = results[0];

//     // Check if the password matches (assuming passwords are stored in plain text, which is not recommended)
//     if (user.password !== password) {
//       return res.status(400).json({ message: "Incorrect password." });
//     }

//     // Successful login
//     res.status(200).json({ message: "Login successful" });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

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

app.post("/createproject", async (req, res) => {
  console.log("Req body:", req.body);
  const { projectname, num_of_sensors, sensor_names } = req.body;

  const username = "noman011";
  const createUrl =
    "INSERT into project_table(username, projectname, num_of_sensors, sensor_names) VALUES(?,?,?,?)";
  const projectValues = [username, projectname, num_of_sensors, sensor_names];
  try {
    const projectResult = await new Promise((resolve, reject) => {
      db.query(createUrl, projectValues, (error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
    res.status(201).json({ message: "Project created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating project.");
  }
});

//project get method
app.get("/getprojects", async (req, res) => {
  const username = "noman011"; // Replace with dynamic authentication logic
  const fetchProjectsSql = "SELECT * FROM project_table WHERE username = ?";
  try {
    const projects = await new Promise((resolve, reject) => {
      db.query(fetchProjectsSql, [username], (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving projects." });
  }
});

app.get("/", (req, res) => {
  return res.json({ msg: "Hello world" });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
