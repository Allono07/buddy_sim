import { motion, useReducedMotion } from "framer-motion";
export default function Bin() {
  const reduced = useReducedMotion();
  const rise = window.matchMedia("(max-width: 640px)").matches ? 120 : 240;
  return (
    <motion.svg
      className="hero-bin"
      viewBox="0 0 280 320"
      role="img"
      aria-label="A friendly Trash Buddy bin with a leaf on its lid"
      initial={reduced ? { opacity: 0 } : { y: rise, scale: 0.75, rotate: -8 }}
      animate={
        reduced
          ? { opacity: 1 }
          : {
              y: [rise, -6, 0],
              scale: [0.75, 1.02, 1],
              rotate: [-8, 2, 0],
              opacity: 1,
            }
      }
      transition={{ duration: reduced ? 0.3 : 0.95, ease: [0.16, 1, 0.3, 1] }}
    >
      <defs>
        <linearGradient id="body" x1="0" x2="1">
          <stop stopColor="#c6d2c5" />
          <stop offset=".3" stopColor="#fff" />
          <stop offset=".7" stopColor="#f6faf2" />
          <stop offset="1" stopColor="#a1b59d" />
        </linearGradient>
        <linearGradient id="lid" x2="0" y2="1">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#d6dfd0" />
        </linearGradient>
      </defs>
      <ellipse cx="140" cy="301" rx="92" ry="12" fill="#193a21" opacity=".12" />
      <g id="bin-body">
        <path
          d="M83 269v21q-26 4-25 14h64v-35M164 269v35h62q-2-14-29-14v-21"
          fill="url(#body)"
          stroke="#91a58c"
        />
        <path
          d="M53 123Q23 128 21 165l20 12 28-29M224 167q28 8 30 51l-22 3-22-29"
          fill="url(#body)"
          stroke="#91a58c"
        />
        <path
          d="M52 108h178l-19 151q-2 23-31 24H96q-27-1-29-24Z"
          fill="url(#body)"
          stroke="#91a58c"
          strokeWidth="2"
        />
        <path
          d="M50 108q91-15 182 0v19q-91-13-182 0Z"
          fill="url(#lid)"
          stroke="#91a58c"
        />
        <ellipse
          cx="105"
          cy="167"
          rx="21"
          ry="26"
          fill="white"
          stroke="#91a58c"
        />
        <ellipse
          cx="179"
          cy="167"
          rx="21"
          ry="26"
          fill="white"
          stroke="#91a58c"
        />
        <ellipse cx="110" cy="170" rx="14" ry="20" fill="#5c942f" />
        <ellipse cx="175" cy="170" rx="14" ry="20" fill="#5c942f" />
        <ellipse cx="113" cy="168" rx="10" ry="15" fill="#17291b" />
        <ellipse cx="172" cy="168" rx="10" ry="15" fill="#17291b" />
        <circle cx="108" cy="160" r="6" fill="white" />
        <circle cx="168" cy="160" r="6" fill="white" />
        <path d="M128 192q15 9 29 0q-3 27-15 24t-14-24" fill="#193621" />
        <path d="M130 205q13-8 24 0-12 18-24 0" fill="#f78275" />
        <text x="141" y="260" textAnchor="middle" fill="#759d61" fontSize="41">
          ♻
        </text>
      </g>
      <motion.g
        id="bin-lid"
        style={{ transformOrigin: "53px 107px" }}
        initial={{ rotate: reduced ? 0 : -32 }}
        animate={{ rotate: reduced ? 0 : [-32, -32, 3, -2, 0] }}
        transition={{
          delay: 0.6,
          duration: 0.8,
          times: [0, 0.25, 0.7, 0.85, 1],
          ease: "easeOut",
        }}
      >
        <path
          d="M153 87q0-35 16-54"
          fill="none"
          stroke="#7cad3f"
          strokeWidth="6"
        />
        <path
          d="M168 51q-5-38 30-40 5 32-30 40M163 66q-37-5-32-32 32 0 32 32"
          fill="#b9dc58"
          stroke="#86b33d"
        />
        <path d="M119 86v-9q23-12 45 0v9" fill="url(#lid)" stroke="#91a58c" />
        <path
          d="M45 99q92-28 192 0v17q-100-19-192 0Z"
          fill="url(#lid)"
          stroke="#91a58c"
          strokeWidth="2"
        />
      </motion.g>
    </motion.svg>
  );
}
