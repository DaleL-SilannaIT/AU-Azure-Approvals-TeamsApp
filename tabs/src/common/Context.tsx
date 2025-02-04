import { TeamsUserCredential } from "@microsoft/teamsfx";
import { createContext } from "react";
import { Theme } from "@fluentui/react-components";

export const TeamsFxContext = createContext<{
  theme?: Theme;
  themeString: string;
  teamsUserCredential?: TeamsUserCredential;
  userToken?: string;
}>({
  theme: undefined,
  themeString: "",
  teamsUserCredential: undefined,
  userToken: undefined
});
