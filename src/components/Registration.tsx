import "./Registration.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldValues } from "react-hook-form";
import { z } from "zod";
import iotlogo from "../../images/iotlogo.png";
import { BiHide, BiShow } from "react-icons/bi";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { DiVim } from "react-icons/di";

const stringValidationRules = {
  regex: /^[A-Za-z.]+(?: [A-Za-z.]+)*$/,
  refine: (value: string) => {
    const words = value.split(" ");
    return words.every((word) => /^[A-Z][a-z.]*$/.test(word)); // Check if each word starts with an uppercase letter followed by lowercase letters
  },
};

const regSchema = z
  .object({
    name: z
      .string()
      .regex(
        stringValidationRules.regex,
        "Starting of each word must be uppercase letter"
      )
      .refine((value) => stringValidationRules.refine(value)),

    num_of_sensors: z
      .number({ invalid_type_error: "Only digits are accepted" })
      .int(),

    username: z
      .string()
      .min(5, { message: "Username must be at least 5 characters" }),
    email: z.string().email("Must be a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(20, "Password cannot exceed 20 characters."),
    conpassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(20, "Password cannot exceed 20 characters."),
  })
  .refine((data) => data.password === data.conpassword, {
    path: ["conpassword"],
    message: "Passwod doesnot match",
  });

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 characters long" }),
});

type regData = z.infer<typeof regSchema>;
type otpData = z.infer<typeof otpSchema>;

const Registration = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<regData>({ resolver: zodResolver(regSchema), mode: "onChange" });
  // const {
  //   register: otpRegister,
  //   handleSubmit: otpHandleSubmit,
  //   formState: { errors: otpErrors, isValid: isOtpValid },
  // } = useForm<otpData>({ resolver: zodResolver(otpSchema), mode: "onChange" });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConPassword, setConShowPassword] = useState<boolean>(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConPasswordVisibility = () => {
    setConShowPassword(!showConPassword);
  };

  //Signup button clicked
  const [signup, setSignup] = useState(false);

  // const onRegSubmit = async (data: regData) => {
  //   console.log("Data from reg: ", data);

  //   try {
  //     const response = await axios.post(
  //       "http://localhost:5000/signup/registerusers",
  //       data
  //     );
  //     console.log("Hello");
  //     console.log("In frontend: ", response);
  //     // Handle different response statuses
  //     if (response.status === 201) {
  //       alert("Registration successful! Please log in.");
  //     } else if (response.status === 302) {
  //       alert(
  //         "Email already exists but not activated. Redirecting to OTP verification."
  //       );
  //       setSignup(true); // Redirect to OTP page or handle OTP flow
  //     } else if (response.status === 409) {
  //       const message = response.data;
  //       if (message.includes("Email")) {
  //         alert("Account already activated with this email. Please log in.");
  //       } else if (message.includes("Username")) {
  //         alert("Username already exists. Please try another.");
  //       }
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error) && error.response) {
  //       const { status, data } = error.response;

  //       if (status === 500) {
  //         alert("Internal server error. Please try again later.");
  //       } else {
  //         console.error(`Unexpected error [${status}]:`, data);
  //         alert("An unexpected error occurred.");
  //       }
  //     } else {
  //       console.error("Error:", error);
  //       alert("Unable to connect to the server. Please check your network.");
  //     }
  //   }
  // };

  const onRegSubmit = async (data: regData) => {
    console.log("Data from frontend:", data);

    try {
      const response = await axios.post(
        "http://localhost:5000/signup/registerusers",
        data
      );

      if (response.status === 201) {
        alert("Registration successful! Please log in.");
      } else if (response.status === 302) {
        alert(
          "Email already exists but not active. Redirecting to OTP verification."
        );
        setSignup(true); // Redirect to OTP page
      } else if (response.status === 409) {
        alert(response.data); // Display backend's message
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error response from server:", error.response);
        const { status, data } = error.response;

        if (status === 500) {
          alert("Internal server error. Please try again later.");
        } else {
          alert(data || "An unexpected error occurred.");
        }
      } else {
        console.error("Network or unknown error:", error);
        alert("Unable to connect to the server. Please check your network.");
      }
    }
  };

  // console.log("Validation Errors: ", errors);
  // console.log("Is Form Valid? ", isValid);

  return (
    <>
      <section className="custom-bg">
        <div className="container">
          <div
            className="row d-flex mx-auto flex-row justify-content-center card p-2 shadow border-0 rounded-3"
            style={{ maxWidth: "900px" }}
          >
            {/* Right Side: Image */}
            <div className="col-md-6 col-sm-6">
              <h2 className="h2 text-center mb-4">
                Welcome to <br />
                <span className="text-primary">IoT Cloud Server</span>{" "}
              </h2>

              <img
                src={iotlogo}
                alt="IoT Cloud Server Image"
                className="img-fluid rounded-3 shadow"
              />
            </div>

            {/* Left Side: Content */}
            <div className="col-md-6 col-sm-6 shadow left-div">
              <div className="card-body">
                <h3 className="h2 text-center text-nowrap mb-4">
                  Create an Account
                </h3>
                <form onSubmit={handleSubmit(onRegSubmit)}>
                  <div className="mb-2">
                    <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className={
                        errors.name
                          ? "form-control custom-hover-input form-control-md border border-danger"
                          : "form-control custom-hover-input form-control-md border border-info"
                      }
                      {...register("name")}
                      placeholder="Enter your full name"
                      disabled={signup}
                    />
                    {errors.name && (
                      <small className="text-danger">
                        {errors.name.message}
                      </small>
                    )}
                  </div>

                  <div className="mb-2">
                    <label htmlFor="sensor_no" className="form-label">
                      Number of Sensors
                    </label>
                    <input
                      type="number"
                      id="sensor_no"
                      {...register("num_of_sensors", { valueAsNumber: true })}
                      className={
                        errors.num_of_sensors
                          ? "form-control custom-hover-input form-control-md border border-danger"
                          : "form-control custom-hover-input form-control-md border border-info"
                      }
                      placeholder="How many sensors do you have?"
                      disabled={signup}
                    />
                    {errors.num_of_sensors && (
                      <small className="text-danger">
                        {errors.num_of_sensors.message}
                      </small>
                    )}
                  </div>

                  <div className="mb-2">
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      {...register("username")}
                      className={
                        errors.username
                          ? "form-control custom-hover-input form-control-md border border-danger"
                          : "form-control custom-hover-input form-control-md border border-info"
                      }
                      placeholder="Enter your username"
                      disabled={signup}
                    />
                    {errors.username && (
                      <small className="text-danger">
                        {errors.username.message}
                      </small>
                    )}
                  </div>

                  <div className="mb-2">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register("email")}
                      className={
                        errors.email
                          ? "form-control custom-hover-input form-control-md border border-danger"
                          : "form-control custom-hover-input form-control-md border border-info"
                      }
                      placeholder="Enter your email"
                      disabled={signup}
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
                        disabled={signup}
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
                  <div className="mb-2">
                    <label htmlFor="conpwd" className="form-label">
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={
                          errors.password
                            ? "form-control custom-hover-input form-control-md border border-danger"
                            : "form-control custom-hover-input form-control-md border border-info"
                        }
                        id="conpwd"
                        {...register("conpassword")}
                        placeholder="Re-enter your password"
                        disabled={signup}
                      />
                      <button
                        className="btn btn-outline-secondary border border-info"
                        type="button"
                        onClick={toggleConPasswordVisibility}
                      >
                        {showConPassword ? <BiHide /> : <BiShow />}
                      </button>
                    </div>
                    {errors.conpassword && (
                      <small className="text-danger">
                        {errors.conpassword.message}
                      </small>
                    )}
                  </div>

                  {/* <div className="mb-2">
                    <label htmlFor="conpwd" className="form-label">
                      Confirm Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showConPassword ? "text" : "password"}
                        className={
                          errors.conpassword
                            ? "form-control custom-hover-input form-control-md border border-danger is-invalid"
                            : "form-control custom-hover-input form-control-md border border-info is-valid"
                        }
                        id="conpwd"
                        {...register("conpassword")}
                        placeholder="Re-enter your password"
                        disabled={signup}
                      />
                      {errors.conpassword && (
                        <div className="text-danger">
                          {errors.conpassword.message}
                        </div>
                      )}

                      <button
                        className="btn btn-light border position-absolute top-0 end-0 border-dark"
                        style={{
                          zIndex: 9999,
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                        }}
                        type="button"
                        onClick={toggleConPasswordVisibility}
                      >
                        {showConPassword ? <BiHide /> : <BiShow />}
                      </button>
                    </div>
                    {errors.conpassword && (
                      <small className="">
                        {errors.conpassword.message}
                      </small>
                    )}
                  </div> */}

                  <div className="d-flex flex-column justify-content-center align-items-center">
                    <button
                      type="submit"
                      className="btn btn-primary reg-btn mb-2"
                      disabled={!isValid}
                    >
                      REGISTER
                    </button>
                    <button type="button" className="reg-btn-2">
                      Already have an Account? Login here
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Registration;
