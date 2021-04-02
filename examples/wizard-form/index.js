import { render } from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

import "./styles.scss";

render(
  <Router>
    <Routes>
      <Route path="/" element={<Step1 />} />
      <Route path="step-2" element={<Step2 />} />
      <Route path="step-3" element={<Step3 />} />
    </Routes>
  </Router>,
  document.getElementById("root")
);
