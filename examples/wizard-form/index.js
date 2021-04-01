import { render } from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Wizard from "./Wizard";
import Step1 from "./Step1";
import Step2 from "./Step2";

import "./styles.scss";

render(
  <Router>
    <Routes>
      <Route path="/" element={<Wizard />}>
        <Route element={<Step1 />} />
        <Route path="step-2" element={<Step2 />} />
      </Route>
    </Routes>
  </Router>,
  document.getElementById("root")
);
