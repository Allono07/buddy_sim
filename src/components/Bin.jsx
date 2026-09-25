import { motion, useReducedMotion } from "framer-motion";

// Resting pose: the bin leans right around the centre of its base.
const LEAN = 12;
const BASE = "122px 325px";
// Lid hinge sits on the back-left edge of the rim.
const HINGE = "48px 106px";
const LID_OPEN = -42;

// Stamped ribs: [y, rx, ry] of the front arc at each band.
const RIBS = [
  [152, 67.6, 14.4],
  [196, 65.1, 13.8],
  [240, 62.6, 13.1],
  [284, 60.1, 12.5],
];

export default function Bin() {
  const reduced = useReducedMotion();
  const rise = window.matchMedia("(max-width: 640px)").matches ? 140 : 260;
  const settle = { delay: 0.25, duration: 0.85, ease: [0.22, 1, 0.36, 1] };
  return (
    <motion.svg
      className="hero-bin"
      viewBox="0 0 300 380"
      role="img"
      aria-label="A silver TrashBuddy dustbin with its lid closing"
      initial={reduced ? { opacity: 0 } : { y: rise, opacity: 0 }}
      animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
      transition={
        reduced
          ? { duration: 0.4 }
          : { ...settle, opacity: { delay: 0.25, duration: 0.3 } }
      }
    >
      <defs>
        <linearGradient id="tb-steel" x1="0" x2="1">
          <stop stopColor="#6f777e" />
          <stop offset=".14" stopColor="#aab1b7" />
          <stop offset=".3" stopColor="#eef1f3" />
          <stop offset=".42" stopColor="#d3d8dc" />
          <stop offset=".7" stopColor="#9aa2a9" />
          <stop offset=".9" stopColor="#737b82" />
          <stop offset="1" stopColor="#5b6269" />
        </linearGradient>
        <linearGradient id="tb-lid-top" x1="0" y1="0" x2=".35" y2="1">
          <stop stopColor="#f7f9fa" />
          <stop offset=".55" stopColor="#c9ced3" />
          <stop offset="1" stopColor="#8f979e" />
        </linearGradient>
        <linearGradient id="tb-occlusion" x2="0" y2="1">
          <stop offset=".72" stopColor="#1d2226" stopOpacity="0" />
          <stop offset="1" stopColor="#1d2226" stopOpacity=".38" />
        </linearGradient>
        <linearGradient id="tb-inside" x2="0" y2="1">
          <stop stopColor="#23282c" />
          <stop offset="1" stopColor="#4a5157" />
        </linearGradient>
        <pattern
          id="tb-brushed"
          width="6"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 .5h6" stroke="#fff" strokeOpacity=".16" />
          <path d="M0 2h6" stroke="#1d2226" strokeOpacity=".06" />
        </pattern>
        <filter id="tb-soft" x="-30%" y="-100%" width="160%" height="300%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <motion.ellipse
        cx="126"
        cy="346"
        rx="70"
        ry="9"
        fill="#1d2a22"
        filter="url(#tb-soft)"
        initial={{ opacity: 0, scale: reduced ? 1 : 0.55 }}
        animate={{ opacity: 0.32, scale: 1 }}
        transition={reduced ? { duration: 0.4 } : settle}
      />
      <motion.g
        style={{ transformBox: "view-box", transformOrigin: BASE }}
        initial={{ rotate: reduced ? LEAN : 3 }}
        animate={{ rotate: LEAN }}
        transition={reduced ? { duration: 0 } : settle}
      >
        <g id="bin-body">
          <ellipse cx="122" cy="110" rx="68" ry="13.5" fill="url(#tb-inside)" />
          <path
            d="M52 110 64 320a58 12 0 0 0 116 0l12-210a70 15 0 0 0-140 0Z"
            fill="url(#tb-steel)"
          />
          <path
            d="M52 110 64 320a58 12 0 0 0 116 0l12-210a70 15 0 0 0-140 0Z"
            fill="url(#tb-brushed)"
          />
          {RIBS.map(([y, rx, ry]) => (
            <g key={y} fill="none">
              <path
                d={`M${122 - rx} ${y - 5}a${rx} ${ry} 0 0 0 ${rx * 2} 0`}
                stroke="#1d2226"
                strokeOpacity=".06"
                strokeWidth="5"
              />
              <path
                d={`M${122 - rx} ${y}a${rx} ${ry} 0 0 0 ${rx * 2} 0`}
                stroke="#2b3136"
                strokeOpacity=".28"
                strokeWidth="1.6"
              />
              <path
                d={`M${122 - rx} ${y + 3}a${rx} ${ry} 0 0 0 ${rx * 2} 0`}
                stroke="#fff"
                strokeOpacity=".45"
                strokeWidth="1.5"
              />
            </g>
          ))}
          <path
            d="M52 110 64 320a58 12 0 0 0 116 0l12-210a70 15 0 0 0-140 0Z"
            fill="url(#tb-occlusion)"
          />
          <path
            d="M64 314a58 12 0 0 0 116 0v7a58 12 0 0 1-116 0Z"
            fill="#5d656c"
          />
          <path
            d="M64 321a58 12 0 0 0 116 0"
            fill="none"
            stroke="#c2c8cd"
            strokeOpacity=".7"
          />
          <ellipse
            cx="122"
            cy="110"
            rx="70.5"
            ry="15"
            fill="none"
            stroke="#b8bec3"
            strokeWidth="5"
          />
          <path
            d="M52 112a70 15 0 0 0 140 0"
            fill="none"
            stroke="#f4f6f7"
            strokeOpacity=".8"
            strokeWidth="1.5"
          />
          <rect x="42" y="102" width="10" height="12" rx="2" fill="#5b6269" />
        </g>
        <motion.g
          id="bin-lid"
          style={{ transformBox: "view-box", transformOrigin: HINGE }}
          initial={{ rotate: reduced ? 0 : LID_OPEN }}
          animate={{ rotate: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { delay: 1, duration: 0.5, ease: "easeInOut" }
          }
        >
          <path d="M48 103v8a74 16 0 0 0 148 0v-8Z" fill="url(#tb-steel)" />
          <path
            d="M48 111a74 16 0 0 0 148 0"
            fill="none"
            stroke="#3d4449"
            strokeOpacity=".45"
          />
          <ellipse cx="122" cy="103" rx="74" ry="16" fill="url(#tb-lid-top)" />
          <ellipse cx="122" cy="103" rx="74" ry="16" fill="url(#tb-brushed)" />
          <ellipse
            cx="122"
            cy="103.5"
            rx="54"
            ry="11"
            fill="none"
            stroke="#6f777e"
            strokeOpacity=".35"
            strokeWidth="1.5"
          />
          <path d="M115 102v-8h14v8Z" fill="#6c747b" />
          <ellipse
            cx="122"
            cy="102"
            rx="9"
            ry="2.6"
            fill="#1d2226"
            opacity=".2"
          />
          <ellipse cx="122" cy="93" rx="11" ry="3.6" fill="#dfe3e6" />
          <path
            d="M111 93a11 3.6 0 0 0 22 0"
            fill="none"
            stroke="#6f777e"
            strokeWidth="1.2"
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}
