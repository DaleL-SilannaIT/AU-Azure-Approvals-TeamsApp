import { useContext, useState } from "react";
import { TeamsFxContext } from "../common/Context";
import { MyApprovalsTable } from "./components/table/MyApprovalsTable";
import { MyApprovalsFilters } from "./components/filters/MyApprovalsFilters";
import "./MyApprovals.css";

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
      <div className="my-approvals-filters-container">
        <MyApprovalsFilters />
      </div>
      <MyApprovalsTable />
    </div>
  );
}