import { useContext, useState, useEffect } from "react";
import { TeamsFxContext } from "../common/Context";
import { MyApprovalsTable } from "./components/table/MyApprovalsTable";
import { MyApprovalsFilters } from "./components/filters/MyApprovalsFilters";
import { useTeamsUserCredential } from "@microsoft/teamsfx-react";
import config from "../common/lib/config";
import "./MyApprovals.css";

export default function MyApprovals() {
  const { themeString } = useContext(TeamsFxContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  const endpoint = process.env.REACT_APP_API_FUNCTION_ENDPOINT || 'http://localhost:7071';
  const [userData, setUserData] = useState<string | null>(null);
  const { loading, theme, teamsUserCredential } = useTeamsUserCredential({
    initiateLoginEndpoint: config.initiateLoginEndpoint!,
    clientId: config.clientId!,
  });
// const fetchUserData = async () => {
//   try {
//     const formData = new FormData();
//     const userInfo = await teamsUserCredential?.getUserInfo();
//     const userToken = await teamsUserCredential?.getToken(["User.Read"]);

//     formData.append('TeamsCredential', userInfo ? JSON.stringify(userInfo) : '');
//     formData.append('UserToken', userToken ? JSON.stringify(userToken) : '');
//     console.log('User info:', userInfo); // Debugging log
//     console.log('User token:', userToken); // Debugging log
//     const response = await fetch(`${endpoint}/api/data`, {
//       method: 'POST',
//       body: formData,
//     });

//     return userToken ? JSON.stringify(userToken) : '';
//     // if (!response.ok) {
//     //   throw new Error(`HTTP error! status: ${response.status}`);
//     // }
//   } catch (err) {
//     if (err instanceof Error) {
//       setError(err.message);
//     } else {
//       setError('An unknown error occurred');
//     }
//   }
// }

//console.log(fetchUserData());

// useEffect(() => {
//   fetchUserData();
// }, []);
  return (
    <div
      className={
        themeString === "default"
          ? "light"
          : themeString === "dark"
            ? "dark"
            : "contrast"
      }
    >
      {/* <div>
        {error ? (
          <p>Error: {error}</p>
        ) : (
          <p>Data: {userData}</p>
        )}
      </div> */}
      <div className="my-approvals-filters-container">
        <MyApprovalsFilters onApplyFilters={(filters) => console.log(filters)} />
      </div>
      <MyApprovalsTable />
    </div>
  );
}