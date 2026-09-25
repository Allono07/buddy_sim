import { motion, useReducedMotion } from "framer-motion";
export default function Bin() {
  const reduced = useReducedMotion();
  return (
    <div className="hero-bin-stage">
      <motion.div
        className="hero-bin-shadow"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0.3 : 0.9, ease: "easeInOut" }}
      />
      <motion.div
        className="hero-bin-pose"
        initial={
          reduced
            ? { opacity: 0 }
            : { opacity: 0, y: "85%", rotateZ: 0, rotateY: 0 }
        }
        animate={
          reduced
            ? { opacity: 1, y: 0, rotateZ: 0, rotateY: 0 }
            : { opacity: 1, y: "-6%", rotateZ: 11, rotateY: -12 }
        }
        transition={{
          type: "tween",
          delay: reduced ? 0 : 0.05,
          duration: reduced ? 0.3 : 0.9,
          ease: "easeInOut",
        }}
        style={{ transformPerspective: reduced ? undefined : 800 }}
      >
        <svg
          className="hero-bin"
          viewBox="0 0 280 320"
          role="img"
          aria-label="A silver Trash Buddy bin leaning gently to the right, with a closed lid"
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
          <g id="bin-body">
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
            <text
              x="141"
              y="260"
              textAnchor="middle"
              fill="#759d61"
              fontSize="41"
            >
              ♻
            </text>
          </g>
          <motion.g
            id="bin-lid"
            style={{ transformOrigin: "53px 107px", transformBox: "view-box" }}
            initial={{ rotate: reduced ? 0 : -22 }}
            animate={{ rotate: reduced ? 0 : [-22, -58, -58, 0] }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    type: "tween",
                    delay: 0.05,
                    duration: 1.45,
                    // Open with energy, hold through arrival, then close in exactly 0.55s.
                    times: [0, 0.35 / 1.45, 0.9 / 1.45, 1],
                    ease: "easeInOut",
                  }
            }
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
            <path
              d="M119 86v-9q23-12 45 0v9"
              fill="url(#lid)"
              stroke="#91a58c"
            />
            <path
              d="M45 99q92-28 192 0v17q-100-19-192 0Z"
              fill="url(#lid)"
              stroke="#91a58c"
              strokeWidth="2"
            />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
