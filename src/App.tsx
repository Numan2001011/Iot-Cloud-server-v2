import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Registration from "./components/Registration";
import Test from "./components/Test";
import Login from "./components/Login";
import Profile from "./components/Profile";
import ProjectDetails from "./components/ProjectDetails";
import Home from "./components/Home";
function App() {
  return (
    <>
      <Router>
        <Routes>
          {/*Public Route */}
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />

          {/*Protected Routes */}
          <Route path="/test" element={<Test />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
