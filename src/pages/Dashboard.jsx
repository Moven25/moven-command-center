import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";

export default function Dashboard() {
  return (
    <div className="dashboard-root">
      <TopNav />

      <div className="dashboard-body">
        <Sidebar />

        <main className="dashboard-main">
          <h1>MOVEN Command Dashboard</h1>
          <p>Dashboard loaded successfully.</p>
        </main>
      </div>
    </div>
  );
}
