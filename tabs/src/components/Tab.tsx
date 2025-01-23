import { useContext, useState } from "react";
import { TeamsFxContext } from "./Context";
import { Menu } from "./menu/Menu";
import { ShimmerApplicationExample } from "./table/Table";
import "./Tab.css";

export default function Tab() {
  const { themeString } = useContext(TeamsFxContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    // <div
    //   className={
    //     themeString === "default"
    //       ? "light"
    //       : themeString === "dark"
    //         ? "dark"
    //         : "contrast"
    //   }
    // >
    //   <div className="tab-container">
    //     {/* <div className="nav-section" style={{ width: isCollapsed ? 15 : 120 }}>
    //       <Menu isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
    //     </div> */}
    //     <div className="content-section" >
    //       <ShimmerApplicationExample />
    //     </div>
    //   </div>
    // </div>
    <div>Tab</div>
  );
}