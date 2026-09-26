import { AnimatePresence, motion } from "framer-motion";
import { BatteryFull, Bell, House, MapPin, Signal, X } from "lucide-react";

export default function NearbyPhone({ visible, reduced }) {
  return (
    <motion.section
      className="nearby-phone-wrap"
      aria-label="Resident app preview"
      initial={reduced ? false : { x: -300, opacity: 0 }}
      animate={{ x: visible ? 0 : -300, opacity: visible ? 1 : 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : {
              type: "tween",
              duration: 1.05,
              ease: [0.22, 1, 0.36, 1],
            }
      }
    >
      <span className="nearby-eyebrow">THE RESIDENT APP</span>
      <div className="phone nearby-phone">
        <div className="phone-status">
          <span>9:41</span>
          <span className="island" />
          <span className="flex gap-1">
            <Signal size={12} />
            <BatteryFull size={16} />
          </span>
        </div>
        <div className="nearby-phone-content">
          <div className="nearby-app-head">
            <span className="nearby-mini-logo">
              <House size={13} />
            </span>
            <strong>Trash Buddy</strong>
            <span>•••</span>
          </div>
          <div className="nearby-greeting">
            <small>Good morning,</small>
            <strong>Bob!</strong>
          </div>
          <div
            className="nearby-map"
            aria-label="Map showing a waste truck close to your home"
          >
            <svg
              viewBox="0 0 220 130"
              role="img"
              aria-label="Waste truck near resident on a neighborhood map"
            >
              <rect width="220" height="130" fill="#e8eee5" />
              <path
                d="M-10 31 235 90M24-14 102 150M158-8 88 143M-12 111 226 26M-6 70 223 122"
                fill="none"
                stroke="#fff"
                strokeWidth="12"
              />
              <path
                d="M-10 31 235 90M24-14 102 150M158-8 88 143M-12 111 226 26M-6 70 223 122"
                fill="none"
                stroke="#c8d2c2"
                strokeWidth="1.4"
              />
              <path
                d="M18 100h43v22H18zm114-89h41v16h-41zM152 95h55v24h-55z"
                fill="#d8e3d1"
              />
              <path d="M32 17h42v20H32zm120 36h40v20h-40z" fill="#d7e0d2" />
              <path
                d="M42 74 94 56l49 20"
                fill="none"
                stroke="#80aa72"
                strokeWidth="3"
                strokeDasharray="5 5"
              />
              <circle cx="47" cy="76" r="12" fill="#fff" />
              <circle cx="47" cy="76" r="8" fill="#cf8158" />
              <path d="M43 76h8m-4-4v8" stroke="#fff" strokeWidth="1.5" />
              <circle cx="137" cy="75" r="14" fill="#579153" opacity=".16" />
              <circle
                cx="137"
                cy="75"
                r="9"
                fill="#579153"
                stroke="#fff"
                strokeWidth="3"
              />
              <path d="M132 75h10l-2-4h-5z" fill="#fff" />
              <circle cx="170" cy="43" r="3" fill="#fff" />
              <text x="20" y="119" fontSize="7" fill="#5e7060">
                YOUR HOME
              </text>
              <text x="121" y="61" fontSize="7" fill="#5e7060">
                BBMP TRUCK
              </text>
            </svg>
          </div>
          <div className="nearby-distance">
            <span>
              <MapPin size={13} /> Truck nearby
            </span>
            <strong>2 min away</strong>
          </div>
          <div className="nearby-pickup">
            <span className="small-label">YOUR NEXT COLLECTION</span>
            <strong>Collection is on the way</strong>
          </div>
        </div>
        <AnimatePresence>
          {visible && (
            <motion.div
              className="phone-alert nearby-alert"
              role="status"
              initial={reduced ? false : { opacity: 0, y: -22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      type: "tween",
                      delay: 1.08,
                      duration: 0.38,
                      ease: [0.22, 1, 0.36, 1],
                    }
              }
            >
              <Bell size={17} />
              <div>
                <strong>Waste truck nearby!</strong>
                <p>Your collection truck is approaching.</p>
              </div>
              <X size={13} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="home-indicator" />
      </div>
    </motion.section>
  );
}
