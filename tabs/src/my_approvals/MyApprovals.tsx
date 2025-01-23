import { useContext, useState } from "react";
import { TeamsFxContext } from "../common/Context";
import { MyApprovalsTable } from "./components/table/Table";

export default function MyApprovals() {
  const { themeString } = useContext(TeamsFxContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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
      <MyApprovalsTable />
    </div>
  );
}