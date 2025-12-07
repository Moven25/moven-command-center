import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// App shell pieces
import TopNav from "./components/TopNav";
import Sidebar from "./components/Sidebar";

// Import pages
import Dashboard from "./pages/Dashboard"; // Mission Control
import LoadCommand from "./pages/LoadCommand";
import CarrierCommand from "./pages/CarrierCommandClean";
import BrokerCommand from "./pages/BrokerCommand";
import Routing from "./pages/Routing";
import Finance from "./pages/Finance";
import Weather from "./pages/Weather";
import DTL from "./pages/DTL";
import LearningCommand from "./pages/LearningCommand";
import Settings from "./pages/Settings";
import AdminCommand from "./pages/AdminCommand";

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Sidebar />
        <div className="app-main">
          <TopNav />
          <main className="app-content" style={{ padding: 24 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/load" element={<LoadCommand />} />
              <Route path="/carrier" element={<CarrierCommand />} />
              <Route path="/broker" element={<BrokerCommand />} />
              <Route path="/routing" element={<Routing />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/dtl" element={<DTL />} />
              <Route path="/learning" element={<LearningCommand />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminCommand />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
