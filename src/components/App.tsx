// https://fluentsite.z22.web.core.windows.net/quick-start
import {
  FluentProvider,
  teamsLightTheme,
  teamsDarkTheme,
  teamsHighContrastTheme,
  Spinner,
  tokens,
} from "@fluentui/react-components";
import { HashRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useTeamsUserCredential } from "@microsoft/teamsfx-react";
import { useEffect, useState } from "react";
import Privacy from "./Privacy";
import TermsOfUse from "./TermsOfUse";
import Tab from "./Tab";
import { TeamsFxContext } from "./Context";
import config from "./sample/lib/config";
import Login from "./Login";

/**
 * The main app which handles the initialization and routing
 * of the app.
 */
export default function App() {
  // Define auth config
  const authConfig = {
    clientId: config.clientId!,
    initiateLoginEndpoint: config.initiateLoginEndpoint!,
  };

  // Use the hook with auth config
  const { loading, theme, themeString, teamsUserCredential } = useTeamsUserCredential(authConfig);

  // Handle authentication loading state
  if (loading) {
    return (
      <FluentProvider theme={teamsLightTheme}>
        <div>
          <Spinner />
          <span>Authenticating...</span>
        </div>
      </FluentProvider>
    );
  }

  // If no credential, redirect to auth start page
  if (!teamsUserCredential) {
    window.location.href = config.initiateLoginEndpoint!;
    return null;
  }

  function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { loading, teamsUserCredential } = useTeamsUserCredential(authConfig);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    useEffect(() => {
      if (!loading && teamsUserCredential) {
        setIsAuthenticated(true);
      }
    }, [loading, teamsUserCredential]);
  
    if (loading) {
      return (
        <FluentProvider theme={teamsLightTheme}>
          <div>
            <Spinner />
            <span>Authenticating...</span>
          </div>
        </FluentProvider>
      );
    }
  
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
  
    return children;
  }

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
        <Routes>
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/termsofuse" element={<TermsOfUse />} />
          <Route path="/tab" element={<ProtectedRoute><Tab /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth-start" element={<Navigate to={config.initiateLoginEndpoint!} />} />
          <Route path="/auth-end" element={<Navigate to="/tab" />} />
          <Route path="*" element={<Navigate to="/tab" />} />
        </Routes>
      </FluentProvider>
    </TeamsFxContext.Provider>
  );
}