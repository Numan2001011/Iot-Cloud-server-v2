import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Registration from "./components/Registration";
import Test from "./components/Test";
import Login from "./components/Login";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/registration" element={<Registration />} />
          <Route path="/test" element={<Test />} />
          <Route path="/login" element={<Login/>} />
          
        </Routes>
      </Router>
    </>
  );
}

export default App;
