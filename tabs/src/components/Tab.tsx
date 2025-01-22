import { useContext } from "react";
import { TeamsFxContext } from "./Context";
import { NavWrappedExample } from "./menu/Menu";
import { ShimmerApplicationExample } from "./table/Table";
import "./Tab.css";

export default function Tab() {
  const { themeString } = useContext(TeamsFxContext);
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
      <div className="tab-container">
        <div className="nav-section">
          <NavWrappedExample />
        </div>
        <div className="content-section">
          <ShimmerApplicationExample />
        </div>
      </div>
    </div>
  );
}