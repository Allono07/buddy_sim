import { useState } from "react";
import {
  LayoutDashboard,
  SlidersHorizontal,
  Activity,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { useSimulation } from "../simulation/useSimulation";
import ResidentAppPanel from "../components/ResidentAppPanel";
import OpsMap from "../components/OpsMap";
import {
  Card,
  Status,
  TruckControls,
  LiveMetrics,
  EventsFeed,
  ScenariosPanel,
  AlertsPanel,
  DashboardSettings,
} from "../components/DashboardPanels";
export default function Dashboard() {
  const sim = useSimulation();
  const [tab, setTab] = useState("Overview");
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <span className="small-label">WORKSPACE</span>
        <nav aria-label="Simulation navigation">
          {[
            [LayoutDashboard, "Overview"],
            [SlidersHorizontal, "Controls"],
            [Activity, "Events"],
            [Settings, "Settings"],
          ].map(([Icon, name]) => (
            <button
              key={name}
              aria-current={tab === name ? "page" : undefined}
              className={tab === name ? "active" : ""}
              onClick={() => setTab(name)}
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="live-dot" /> Bengaluru, India
          <p>
            Small actions.
            <br />
            Cleaner cities.
          </p>
          <a href="https://allenthomson.com" target="_blank" rel="noreferrer">
            Meet the founding engineer <ArrowUpRight size={14} />
          </a>
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-heading">
          <div>
            <span className="eyebrow">LIVE SIMULATION</span>
            <h1>Trash Buddy Simulation Dashboard</h1>
            <p>
              Monitor the resident experience, vehicle route, and alert workflow
              from one proper dashboard.
            </p>
          </div>
          <Status sim={sim} />
        </header>
        <div className="dashboard-grid">
          <ResidentAppPanel sim={sim} />
          <div className="operations">
            {tab === "Overview" ? (
              <>
                <div className="panel-grid">
                  <TruckControls sim={sim} />
                  <LiveMetrics sim={sim} />
                </div>
                <div className="panel-grid">
                  <Card title="Ops Map" sub="Resident and truck view">
                    <OpsMap sim={sim} />
                    <div className="map-legend">
                      <span>● Resident</span>
                      <span>● BBMP truck</span>
                    </div>
                  </Card>
                  <EventsFeed sim={sim} />
                </div>
              </>
            ) : tab === "Controls" ? (
              <>
                <ScenariosPanel sim={sim} />
                <AlertsPanel sim={sim} />
              </>
            ) : tab === "Events" ? (
              <EventsFeed sim={sim} />
            ) : (
              <DashboardSettings sim={sim} />
            )}
            <div className="demo-note">
              <span className="live-dot" /> Simulation environment{" "}
              <span>No real vehicles or calls</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
