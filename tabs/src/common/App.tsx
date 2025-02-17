import React, { useState, useEffect } from 'react';
import { FluentProvider, teamsLightTheme, teamsDarkTheme, teamsHighContrastTheme, Spinner, tokens } from "@fluentui/react-components";
import { HashRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useTeamsUserCredential } from "@microsoft/teamsfx-react";
import Privacy from "./Privacy";
import TermsOfUse from "./TermsOfUse";
import TabConfig from "./TabConfig";
import NewApproval from "../new_approval/NewApproval";
import { MyApprovals } from "../my_approvals/MyApprovals";
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
  const [accessToken, setAccessToken] = useState<string>();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const initialiseUserToken = async () => {
    try {
      if (!teamsUserCredential) {
        console.log("No teams user credential");
        return;
      }

      const token = await teamsUserCredential.getToken(["User.Read"]);
      if (token) {
        console.log('Token retrieved successfully');
        setUserToken(token.token);
      } else {
        console.log('No token returned');
      }
    } catch (err) {
      console.error('Error getting token:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  // const fetchAccessToken = async () => {
  //   console.log('fetchAccessToken called');
  //   try {
  //     const url = `/oauth2/v2.0/token`;
  //     console.log('Fetching access token from URL:', url);

  //     const response = await fetch(url, {
  //       method: 'POST',
  //       headers: { 
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //         'Accept': 'application/json'
  //       },
  //       body: new URLSearchParams({
  //         client_id: '56111f7a-a53e-4939-85ce-bcb647af03ed',
  //         scope: 'https://graph.microsoft.com/.default',
  //         client_secret: 'iIE8Q~qvQTA5c9ahROt-nDMSzJItwR6ly~tmTatg',
  //         grant_type: 'client_credentials'
  //       }).toString()
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log("Access token retrieved successfully");
  //     setAccessToken(data.access_token);
  //   } catch (err) {
  //     console.error('Error fetching access token:', err);
  //     if (err instanceof Error) {
  //       setError(err.message);
  //     } else {
  //       setError('An unknown error occurred while fetching access token');
  //     }
  //   }
  // }

  const fetchAccessToken = async () => {
    const response = await fetch(`${endpoint}/api/connection?upn=dalel@silanna.com`, {
    })

    const data = await response;
    console.log('User photo', data);
  }

  useEffect(() => {
    if (teamsUserCredential) {
      console.log('teamsUserCredential is available, initializing user token and fetching access token');
      console.log('REACT_APP_AAD_APP_TENANT_ID:', process.env.REACT_APP_AAD_APP_TENANT_ID);
      console.log('REACT_APP_AAD_APP_CLIENT_ID:', process.env.REACT_APP_AAD_APP_CLIENT_ID);
      console.log('REACT_APP_AAD_APP_CLIENT_SECRET:', process.env.REACT_APP_AAD_APP_CLIENT_SECRET);
      initialiseUserToken();
      fetchAccessToken();
    } else {
      console.log('teamsUserCredential is not available');
    }
  }, [teamsUserCredential]);

  return (
    <TeamsFxContext.Provider value={{ theme, themeString, teamsUserCredential, userToken, accessToken }}>
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