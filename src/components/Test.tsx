import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import iotlogo from "../../images/iotlogo.png";
import { BiHide, BiShow } from "react-icons/bi";
import { useState } from "react";
import "./Login.css";

// Define the schema for validation
const loginSchema = z.object({
  username: z
    .string()
    .min(5, { message: "Username must be at least 5 characters" }),
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
  } = useForm<loginData>({ resolver: zodResolver(loginSchema), mode: "onChange" });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission
  const onLoginSubmit = (data: loginData) => {
    console.log("Form submitted successfully:", data);
    // alert("Form submitted successfully!");
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
                    />
                    {errors.username && (
                      <small className="invalid-feedback">
                        {errors.username.message}
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
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <BiHide /> : <BiShow />}
                      </button>
                    </div>
                    {errors.password && (
                      <small className="invalid-feedback">
                        {errors.password.message}
                      </small>
                    )}
                  </div>

                  <div className="d-flex flex-column justify-content-center align-items-center">
                    <button
                      type="submit"
                      className="btn btn-success reg-btn m-0"
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
