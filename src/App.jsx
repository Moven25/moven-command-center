import "./App.css";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

// Import pages
import Dashboard from "./pages/Dashboard";
import LoadCommand from "./pages/LoadCommand";
import CarrierCommand from "./pages/CarrierCommand";
import BrokerCommand from "./pages/BrokerCommand";
import DTL from "./pages/DTL";
import LearningCommand from "./pages/LearningCommand";
import Settings from "./pages/Settings";
import AdminCommand from "./pages/AdminCommand";

function App() {
  return (
    <Router>
      <div className="app-container">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <h2 className="logo">MOVEN</h2>

          <nav className="nav-links">

            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              to="/"
            >
              Dashboard
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              to="/load"
            >
              Load Command
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              to="/carrier"
            >
              Carrier Command
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              to="/broker"
            >
              Broker Command
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              to="/dtl"
            >
              DTL
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              to="/learning"
            >
              Learning Command
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              to="/settings"
            >
              Settings
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              to="/admin"
            >
              Admin Command
            </NavLink>

          </nav>
        </aside>

        {/* MAIN PANEL */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/load" element={<LoadCommand />} />
            <Route path="/carrier" element={<CarrierCommand />} />
            <Route path="/broker" element={<BrokerCommand />} />
            <Route path="/dtl" element={<DTL />} />
            <Route path="/learning" element={<LearningCommand />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminCommand />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;
