import { useContext, useState } from "react";
import { TeamsFxContext } from "./Context";
import { Menu } from "./menu/Menu";
import { ShimmerApplicationExample } from "./table/Table";
import "./Tab.css";

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
      <ShimmerApplicationExample />
    </div>
  );
}