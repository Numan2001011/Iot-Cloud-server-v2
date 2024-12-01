import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import iotlogo from "../../images/iotlogo.png";
import { BiHide, BiShow } from "react-icons/bi";
import { useState } from "react";
import "./Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define the schema for validation
const loginSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(20, "Password cannot exceed 20 characters."),
});

type loginData = z.infer<typeof loginSchema>;

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<loginData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // Hook to programmatically navigate

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  //Axios only takes 2xx codes in the try block, else codes are handled inside catch.
  const onLoginSubmit = async (data: loginData) => {
    console.log("Form submitted successfully:", data);

    try {
      const response = await axios.post(
        "http://localhost:5000/loginuser",
        data
      );
      // console.log("Response data: ", response.data);

      // Handle successful login
      alert("Login successful.");
      navigate("/profile");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Extract response details
        const { status, data } = error.response;

        console.error("Error response from server:", error.response);

        if (status === 404) {
          setMessage(data.message || "User not found.");
        } else if (status === 401) {
          setMessage(data.message || "Incorrect password.");
        } else if (status === 500) {
          alert("500 Internal server error. Please try again later.");
        } else {
          alert(data.message || "An unexpected error occurred.");
        }
      } else {
        // Network or unknown error
        console.error("Network or unknown error:", error);
        alert("Unable to connect to the server. Please check your network.");
      }
    }
  };

  //   console.log("Validation Errors: ", errors);
  //   console.log("Is Form Valid? ", isValid);

  return (
    <>
      <section className="custom-bg">
        <div className="container">
          <div
            className="row d-flex mx-auto flex-row justify-content-center align-items-center card p-2 shadow border-0 rounded-3"
            style={{ maxWidth: "900px" }}
          >
            {/* Left Side: Content */}
            <div className="col-md-6 col-sm-6 shadow right-div">
              <div className="card-body">
                <h3 className="h2 text-center text-nowrap mb-4">LOG IN</h3>
                <form onSubmit={handleSubmit(onLoginSubmit)}>
                  <div className="mb-2">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="text"
                      id="email"
                      {...register("email")}
                      className={
                        errors.email
                          ? "form-control custom-hover-input form-control-md border border-danger"
                          : "form-control custom-hover-input form-control-md border border-info"
                      }
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <small className="text-danger">
                        {errors.email.message}
                      </small>
                    )}
                  </div>

                  <div className="mb-2">
                    <label htmlFor="pwd" className="form-label">
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={
                          errors.password
                            ? "form-control custom-hover-input form-control-md border border-danger"
                            : "form-control custom-hover-input form-control-md border border-info"
                        }
                        id="pwd"
                        {...register("password")}
                        placeholder="Enter your password"
                      />
                      <button
                        className="btn btn-outline-secondary border border-info"
                        type="button"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <BiHide /> : <BiShow />}
                      </button>
                    </div>
                    {errors.password && (
                      <small className="text-danger">
                        {errors.password.message}
                      </small>
                    )}
                  </div>

                  <div className="d-flex flex-column justify-content-center align-items-center">
                    {message && (
                      <p className="text-center text-danger">{message}</p>
                    )}
                    <button
                      type="submit"
                      className="btn btn-success reg-btn m-0"
                      disabled={!isValid}
                    >
                      LOG IN
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Side: Image */}
            <div className="col-md-6 col-sm-6">
              <h2 className="h2 text-center mb-4">
                Welcome to <br />
                <span className="text-primary">IoT Cloud Server</span>
              </h2>

              <img
                src={iotlogo}
                alt="IoT Cloud Server Image"
                className="img-fluid rounded-3 shadow"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
