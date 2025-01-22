import React, { useEffect } from "react";
import { FluentProvider, teamsLightTheme, Spinner } from "@fluentui/react-components";
import config from "./sample/lib/config";
import { app, authentication } from "@microsoft/teams-js";

const Login = () => {
  useEffect(() => {
    const clientId = config.clientId!;
    const scope = "User.Read"; // Example scope, adjust as needed
    const loginHint = "user1@example.com"; // Example login hint, adjust as needed

    app.initialize().then(() => {
      app.getContext().then((context) => {
        if (context.page.frameContext === "authentication") {
          const authenticateConfig: authentication.AuthenticateParameters = {
            url: window.location.origin + `/auth-start.html?clientId=${clientId}&scope=${scope}&loginHint=${loginHint}`,
            width: 600,
            height: 535,
            successCallback: (result: string) => {
              window.location.href = window.location.origin + `/auth-end.html?clientId=${clientId}`;
            },
            failureCallback: (reason: string) => {
              console.error("Login popup failed: ", reason);
            },
          };

          authentication.authenticate(authenticateConfig);
        } else {
          console.error("Authentication can only be initiated in the authentication context.");
        }
      });
    });
  }, []);

  return (
    <FluentProvider theme={teamsLightTheme}>
      <div>
        <Spinner />
        <span>Redirecting to login...</span>
      </div>
    </FluentProvider>
  );
};

export default Login;
