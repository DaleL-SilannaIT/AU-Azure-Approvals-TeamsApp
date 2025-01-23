import React, { useState } from 'react';
import { FluentProvider, teamsLightTheme, teamsDarkTheme, teamsHighContrastTheme, Spinner, tokens } from "@fluentui/react-components";
import { HashRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useTeamsUserCredential } from "@microsoft/teamsfx-react";
import Privacy from "./Privacy";
import TermsOfUse from "./TermsOfUse";
import Tab from "./Tab";
import TabConfig from "./TabConfig";
import NewApproval from "./NewApproval";
import MyApprovals from "./MyApprovals";
import PastApprovals from "./PastApprovals";
import Admin from "./Admin";
import { TeamsFxContext } from "./Context";
import config from "./sample/lib/config";
import { Menu } from "./menu/Menu";
import "./Tab.css";

export default function App() {
  const { loading, theme, themeString, teamsUserCredential } = useTeamsUserCredential({
    initiateLoginEndpoint: config.initiateLoginEndpoint!,
    clientId: config.clientId!,
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <TeamsFxContext.Provider value={{ theme, themeString, teamsUserCredential }}>
      <FluentProvider
        theme={
          themeString === "dark"
            ? teamsDarkTheme
            : themeString === "contrast"
            ? teamsHighContrastTheme
            : {
                ...teamsLightTheme,
                colorNeutralBackground3: "#eeeeee",
              }
        }
        style={{ background: tokens.colorNeutralBackground3 }}
      >
        <Router>
          {loading ? (
            <Spinner style={{ margin: 100 }} />
          ) : (
            <div className="tab-container">
              <div className="nav-section" style={{ width: isCollapsed ? 15 : 120 }}>
                <Menu isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
              </div>
              <div className="content-section">
                <Routes>
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/termsofuse" element={<TermsOfUse />} />
                  {/* <Route path="/tab" element={<Tab />} /> */}
                  <Route path="/config" element={<TabConfig />} />
                  <Route path="/tab/new_approval" element={<NewApproval />} />
                  <Route path="/tab/my_approvals" element={<MyApprovals />} />
                  <Route path="/tab/past_approvals" element={<PastApprovals />} />
                  <Route path="/tab/admin" element={<Admin />} />
                  <Route path="*" element={<Navigate to="/tab/my_approvals" />} />
                </Routes>
              </div>
            </div>
          )}
        </Router>
      </FluentProvider>
    </TeamsFxContext.Provider>
  );
}