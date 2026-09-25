import { motion } from "framer-motion";
import {
  Power,
  Play,
  Pause,
  RotateCcw,
  Bell,
  Phone,
  Download,
  Trash2,
  Zap,
  Activity,
  Truck,
  SlidersHorizontal,
} from "lucide-react";
import { useTheme } from "../Theme";
export function Card({ title, sub, children, actions, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-header">
        <div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
export function Status({ sim }) {
  return (
    <motion.span
      key={sim.status}
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      className={`status ${sim.state.online ? "online" : ""}`}
    >
      <span />
      {sim.status}
    </motion.span>
  );
}
export function TruckControls({ sim }) {
  const { state: s, dispatch: d } = sim;
  return (
    <Card title="Truck Controls" sub="Status, movement, and speed">
      <div className="control-line">
        <span className="small-label">01 / TRUCK STATUS</span>
        <Status sim={sim} />
      </div>
      <button className="button full" onClick={() => d({ type: "online" })}>
        <Power size={16} />
        {s.online ? "Take Truck Offline" : "Bring Trucks Online"}
      </button>
      <div className="control-line">
        <span className="small-label">02 / TRUCK MOVEMENT</span>
        <span className="mono">
          {s.online ? `${Math.round(sim.distance)} m` : "--"}
        </span>
      </div>
      <p className="muted text-sm">
        Simulate the truck moving toward the resident home location.
      </p>
      <div className="progress">
        <motion.div animate={{ width: `${sim.progress}%` }} />
      </div>
      <label className="speed">
        Speed{" "}
        <input
          aria-label="Route speed"
          type="range"
          min=".5"
          max="3"
          step=".1"
          value={s.speed}
          onChange={(e) => d({ type: "speed", value: +e.target.value })}
        />
        <span className="mono">{s.speed.toFixed(1)}x</span>
      </label>
      <div className="flex gap-2">
        <button
          className="button primary grow"
          disabled={s.moving || s.paused}
          onClick={() => d({ type: "start" })}
        >
          <Play size={15} />
          Start Truck
        </button>
        <button
          className="icon-button"
          aria-label={s.paused ? "Resume" : "Pause"}
          disabled={!s.moving && !s.paused}
          onClick={() => d({ type: "pause" })}
        >
          {s.paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button
          className="icon-button"
          aria-label="Reset route"
          onClick={() => d({ type: "reset" })}
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </Card>
  );
}
export function LiveMetrics({ sim }) {
  return (
    <Card title="Live Metrics" sub="Your collection, at a glance">
      <div className="metrics">
        {[
          ["Truck Status", sim.status, "BBMP waste truck"],
          ["ETA to You", sim.eta, "min:sec"],
          ["Route Progress", `${sim.progress}%`, "current route"],
          [
            "Alerts Sent",
            sim.state.notifications,
            `${sim.state.calls} voice calls`,
          ],
        ].map(([label, value, sub]) => (
          <div key={label}>
            <span className="small-label">{label}</span>
            <strong>{value}</strong>
            <small>{sub}</small>
          </div>
        ))}
      </div>
    </Card>
  );
}
export function EventsFeed({ sim }) {
  function download() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { generatedAt: new Date().toISOString(), events: sim.state.events },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `trashbuddy-sim-events-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <Card
      title="Events"
      sub="Live activity feed"
      actions={
        <div className="flex gap-2">
          <button
            className="icon-button"
            aria-label="Export events"
            onClick={download}
          >
            <Download size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="Clear events"
            onClick={() => sim.dispatch({ type: "clear" })}
          >
            <Trash2 size={16} />
          </button>
        </div>
      }
    >
      <div className="events" role="log" aria-live="polite">
        {sim.state.events.length ? (
          sim.state.events.toReversed().map((e, i) => (
            <div className={`event ${e.type}`} key={e.ts + i}>
              <span className="event-dot" />
              <div>
                {e.msg}
                <time>{e.time}</time>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">
            <Activity size={28} />
            <strong>A cleaner journey starts here.</strong>
            <p>Bring the truck online and watch the story unfold.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
export function ScenariosPanel({ sim }) {
  return (
    <Card title="Scenarios" sub="Quick demo shortcuts">
      <div className="scenarios">
        {[
          [Zap, "Full demo", "Online to route to alerts", "demo"],
          [Bell, "Nearby alert", "Jump near the resident", "nearby"],
          [Phone, "Voice call", "Simulate the call now", "voice"],
        ].map(([Icon, title, sub, type]) => (
          <button key={type} onClick={() => sim.dispatch({ type })}>
            <Icon size={20} />
            <strong>{title}</strong>
            <small>{sub}</small>
          </button>
        ))}
      </div>
    </Card>
  );
}
export function AlertsPanel({ sim }) {
  return (
    <Card title="Alerts" sub="Notification and voice call">
      <div className="flex flex-wrap gap-2">
        <button
          className="button"
          onClick={() => sim.dispatch({ type: "notify" })}
        >
          <Bell size={16} />
          Force Notification
        </button>
        <button
          className="button"
          onClick={() => sim.dispatch({ type: "voice" })}
        >
          <Phone size={16} />
          Voice Call
        </button>
      </div>
      <label className="check">
        <input
          type="checkbox"
          checked={sim.state.autoVoice}
          onChange={(e) =>
            sim.dispatch({
              type: "setting",
              key: "autoVoice",
              value: e.target.checked,
            })
          }
        />
        Auto voice call when the notification trigger fires
      </label>
    </Card>
  );
}
export function DashboardSettings({ sim }) {
  const { theme, toggle } = useTheme();
  return (
    <Card title="Dashboard Settings" sub="Theme and UX notes">
      <button className="button" onClick={toggle}>
        Switch to {theme === "dark" ? "light" : "dark"} theme
      </button>
      <label className="check">
        <input
          type="checkbox"
          checked={sim.state.push}
          onChange={(e) =>
            sim.dispatch({
              type: "setting",
              key: "push",
              value: e.target.checked,
            })
          }
        />
        Enable push notifications
      </label>
      <label className="field">
        Call mode
        <select
          value={sim.state.callMode}
          onChange={(e) =>
            sim.dispatch({
              type: "setting",
              key: "callMode",
              value: e.target.value,
            })
          }
        >
          {["manual-selection", "voice-only", "sms-only", "none"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <p className="muted">
        Call mode is a demo preference; calls are simulated in your browser.
      </p>
      <h3>Mobile behavior</h3>
      <p className="muted">
        On mobile, only the resident app and the two simulation FABs remain
        visible.
      </p>
      <h3>Founder access</h3>
      <p className="muted">
        The founding engineer link is available from the dashboard header.
      </p>
    </Card>
  );
}
