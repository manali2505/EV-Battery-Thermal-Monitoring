
import React from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">▣</span>
        EV Battery Monitoring
      </div>

      <div className="navbar-links">
        <NavLink to="/" end>
          Dashboard
        </NavLink>

        <NavLink to="/batteries">
          Battery Management
        </NavLink>

        <NavLink to="/readings/new">
          Sensor Readings
        </NavLink>

        <NavLink to="/readings/history">
          Reading History
        </NavLink>

        <NavLink to="/alerts">
          Alerts
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;








// import React from "react";
// import { NavLink } from "react-router-dom";

// function Navbar() {
//   return (
//     <nav className="navbar">
//       <div className="navbar-brand">
//         EV Battery Monitoring
//       </div>

//       <div className="navbar-links">
//         <NavLink to="/" end>
//           Dashboard
//         </NavLink>

//         <NavLink to="/batteries">
//           Battery Management
//         </NavLink>

//         <NavLink to="/readings/new">
//           Sensor Readings
//         </NavLink>

//         <NavLink to="/readings/history">
//           Reading History
//         </NavLink>

//         <NavLink to="/alerts">
//           Alerts
//         </NavLink>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;