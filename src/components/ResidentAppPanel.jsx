import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Truck,
  LogOut,
  Moon,
  Bell,
  Phone,
  X,
  Power,
  Play,
  Pause,
  Home,
  Signal,
  BatteryFull,
} from "lucide-react";
import { Link } from "react-router-dom";
import OpsMap from "./OpsMap";
import { Status } from "./DashboardPanels";
import { useTheme } from "../Theme";
export default function ResidentAppPanel({ sim }) {
  const { state: s, dispatch: d } = sim;
  const [screen, setScreen] = useState(() =>
    localStorage.getItem("isLoggedIn") === "true" ? "home" : "login",
  );
  const [disclaimer, setDisclaimer] = useState(false);
  const [error, setError] = useState("");
  const { toggle } = useTheme();
  function login() {
    localStorage.setItem("isLoggedIn", "true");
    setScreen("home");
    setDisclaimer(true);
    d({ type: "log", msg: "User logged in.", level: "success" });
  }
  function save(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const lat = Number(data.get("lat")),
      lng = Number(data.get("lng"));
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    ) {
      setError("Please enter valid coordinates.");
      return;
    }
    d({ type: "location", value: [lat, lng], address: data.get("address") });
    setScreen("home");
  }
  return (
    <section className="resident">
      <div className="resident-label">
        <span className="small-label">RESIDENT APP</span>
        <span>LIVE PREVIEW</span>
      </div>
      <div className="phone">
        <div className="phone-status">
          <span>9:41</span>
          <span className="island" />
          <span className="flex gap-1">
            <Signal size={13} />
            <BatteryFull size={17} />
          </span>
        </div>
        <div className="phone-content">
          <div className="phone-nav">
            <Link to="/" aria-label="Home">
              <Home size={18} />
            </Link>
            <span>Trash Buddy</span>
            <button aria-label="Toggle resident theme" onClick={toggle}>
              <Moon size={17} />
            </button>
          </div>
          {screen === "login" ? (
            <div className="login">
              <img
                src="/assets/images/trash_buddy.png"
                alt="Trash Buddy mascot"
              />
              <h2>Trash Buddy</h2>
              <p>Be a smarter citizen</p>
              <button className="button primary full" onClick={login}>
                Get Started <ArrowLeft className="rotate-180" size={17} />
              </button>
              <small>A little heads-up. A better everyday.</small>
            </div>
          ) : (
            <>
              {screen === "home" ? (
                <>
                  <div className="resident-welcome">
                    <div>
                      <small>Welcome back,</small>
                      <h2>Bob!</h2>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="Logout"
                      onClick={() => {
                        localStorage.removeItem("isLoggedIn");
                        setScreen("login");
                      }}
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                  <div className="pickup">
                    <span className="small-label">YOUR NEXT COLLECTION</span>
                    <div className="flex justify-between items-center">
                      <h3>
                        {s.arrived
                          ? "Your truck is here."
                          : s.online
                            ? "On the way to a cleaner day."
                            : "A cleaner day starts with you."}
                      </h3>
                      <img
                        src="/assets/images/rider_app.png"
                        alt="Waste truck"
                      />
                    </div>
                    <Status sim={sim} />
                  </div>
                  <div className="phone-section">
                    <div className="flex justify-between">
                      <h3>Your Location</h3>
                      <MapPin size={16} />
                    </div>
                    <OpsMap sim={sim} compact />
                    <small className="registered">
                      <span className="live-dot" /> Location Registered
                    </small>
                    <h3>Quick Actions</h3>
                    <div className="quick-actions">
                      <button onClick={() => setScreen("location")}>
                        <MapPin size={21} />
                        <strong>Update Location</strong>
                        <small>Set your home</small>
                      </button>
                      <button onClick={() => setScreen("tracking")}>
                        <Truck size={21} />
                        <strong>Track Vehicle</strong>
                        <small>Live status</small>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="phone-section">
                  <button className="back" onClick={() => setScreen("home")}>
                    <ArrowLeft size={16} />{" "}
                    {screen === "location"
                      ? "Update Location"
                      : "Live Tracking"}
                  </button>
                  <OpsMap sim={sim} compact />
                  {screen === "location" ? (
                    <form onSubmit={save} className="location-form">
                      <label className="field">
                        Address
                        <input
                          name="address"
                          defaultValue="123, Green Street, Bangalore"
                        />
                      </label>
                      <label className="field">
                        Latitude
                        <input
                          name="lat"
                          type="number"
                          step="any"
                          min="-90"
                          max="90"
                          defaultValue={s.home[0]}
                          required
                        />
                      </label>
                      <label className="field">
                        Longitude
                        <input
                          name="lng"
                          type="number"
                          step="any"
                          min="-180"
                          max="180"
                          defaultValue={s.home[1]}
                          required
                        />
                      </label>
                      <p role="alert">{error}</p>
                      <button className="button primary full">
                        Confirm Location
                      </button>
                    </form>
                  ) : (
                    <div className="driver">
                      <Truck />
                      <strong>Rider: Allen Thomson</strong>
                      <small>Vehicle: KA-01-1234</small>
                      <Status sim={sim} />
                      <p>
                        {s.online
                          ? sim.distance < 30
                            ? "Arrived"
                            : `${Math.round(sim.distance)}m away`
                          : "Rider Offline"}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="mobile-fabs">
                <button
                  aria-label="Toggle Driver Online"
                  className={`icon-button ${s.online ? "primary" : ""}`}
                  onClick={() => d({ type: "online" })}
                >
                  <Power size={20} />
                </button>
                <button
                  aria-label={
                    s.moving
                      ? "Pause route"
                      : s.paused
                        ? "Resume route"
                        : "Start route"
                  }
                  className="icon-button primary"
                  onClick={() =>
                    d({ type: s.moving || s.paused ? "pause" : "start" })
                  }
                >
                  {s.moving ? <Pause size={20} /> : <Play size={20} />}
                </button>
              </div>
            </>
          )}
          <AnimatePresence>
            {disclaimer && (
              <motion.div
                className="phone-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div role="dialog" aria-label="Simulation Mode">
                  <span className="eyebrow">JUST A LITTLE DEMO</span>
                  <h3>Simulation Mode</h3>
                  <p>
                    This is a demo dashboard. No real user data is tracked or
                    stored.
                  </p>
                  <button
                    autoFocus
                    className="button primary full"
                    onClick={() => setDisclaimer(false)}
                  >
                    Got it!
                  </button>
                </div>
              </motion.div>
            )}
            {(s.notice || s.call) && (
              <motion.div
                className="phone-alert"
                role="status"
                initial={{ opacity: 0, y: -25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                {s.call ? <Phone size={20} /> : <Bell size={20} />}
                <div>
                  <strong>
                    {s.call ? "Voice Call (Simulated)" : "Waste Truck Nearby!"}
                  </strong>
                  <p>
                    {s.call
                      ? "Trash Buddy alert: waste truck is getting close to your location."
                      : "The collection truck is approaching your location."}
                  </p>
                </div>
                <button
                  aria-label="Dismiss alert"
                  onClick={() =>
                    d({ type: "close", key: s.call ? "call" : "notice" })
                  }
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="home-indicator" />
      </div>
      <p className="phone-footnote">
        A smarter citizen. A cleaner neighbourhood.
      </p>
    </section>
  );
}
