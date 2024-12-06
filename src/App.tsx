import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Registration from "./components/Registration";
import Test from "./components/Test";
import Login from "./components/Login";
import Profile from "./components/Profile";
import ProjectDetails from "./components/ProjectDetails";
import Home from "./components/Home";
import { AuthProvider } from "./components/auth/AuthContext"; // Import AuthProvider
import ProtectedRoute from "./components/auth/ProtectedRoute"; // Import ProtectedRoute

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/test" element={<ProtectedRoute element={<Test />} />} />
          <Route
            path="/profile"
            element={<ProtectedRoute element={<Profile />} />}
          />
          <Route
            path="/project/:id"
            element={<ProtectedRoute element={<ProjectDetails />} />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
