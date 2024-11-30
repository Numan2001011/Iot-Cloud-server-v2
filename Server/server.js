import express from "express";
import cors from "cors";
import db from "./database.js";
import transporter from "./Transporter.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

db.connect();

app.post("/signup/registerusers", async (req, res) => {
  const { email, username, name, password, num_of_sensors } = req.body;
  console.log("from backend: ", req.body);

  const is_active = 0;

  const checkEmailSql = "SELECT is_active FROM user_table WHERE email = ?";
  const checkUsernameSql = "SELECT * FROM user_table WHERE username = ?";
  const insertUserSql =
    "INSERT INTO user_table (email, username, name, password, num_of_sensors, is_active) VALUES(?,?,?,?,?,?)";

  // Insert new user if validations pass
  const uservalues = [
    email,
    username,
    name,
    password,
    num_of_sensors,
    is_active,
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

app.get("/", (req, res) => {
  return res.json({ msg: "Hello world" });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
