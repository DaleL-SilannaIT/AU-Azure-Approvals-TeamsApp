import React, { useState } from 'react';
import { FluentProvider, teamsLightTheme, teamsDarkTheme, teamsHighContrastTheme, Spinner, tokens } from "@fluentui/react-components";
import { HashRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useTeamsUserCredential } from "@microsoft/teamsfx-react";
import Privacy from "./Privacy";
import TermsOfUse from "./TermsOfUse";
import TabConfig from "./TabConfig";
import NewApproval from "../new_approval/NewApproval";
import MyApprovals from "../my_approvals/MyApprovals";
import PastApprovals from "../past_approvals/PastApprovals";
import Admin from "../admin/Admin";
import { TeamsFxContext } from "./Context";
import config from "./lib/config";
import { Menu } from "./components/menu/Menu";
import "./Tab.css";

export default function App() {
  const { loading, theme, themeString, teamsUserCredential } = useTeamsUserCredential({
    initiateLoginEndpoint: config.initiateLoginEndpoint!,
    clientId: config.clientId!,
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endpoint = process.env.REACT_APP_API_FUNCTION_ENDPOINT || 'http://localhost:7071';
  const [userToken, setUserToken] = useState<string>();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const initialiseUserToken = async () => {
    try {
      const token = await teamsUserCredential?.getToken(["User.Read"]);
      setUserToken(token?.token); // Store token in state

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  }

  initialiseUserToken()
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