import React from "react";
import { createRoot } from "react-dom/client";
//import App from "./components/App";
import App from "../tabs/src/common/App";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { TeamsFxContext } from "../tabs/src/common/Context";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <TeamsFxContext.Provider value={{ themeString: "default" }}>
    <Router>
      <App />
    </Router>
  </TeamsFxContext.Provider>
);
