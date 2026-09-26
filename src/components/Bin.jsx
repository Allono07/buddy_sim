import { motion, useReducedMotion } from "framer-motion";

export default function Bin({ compact = false, started = true }) {
  const reduced = useReducedMotion();
  return (
    <svg
      className="hero-bin"
      viewBox={compact ? "-138 -50 520 415" : "-428 -50 1100 415"}
      role="img"
      aria-label="Green two-wheel municipal waste bin with hinged lid"
    >
      <defs>
        <linearGradient id="tb-green-bin" x1="0" x2="1">
          <stop stopColor="#07521a" />
          <stop offset=".24" stopColor="#13822b" />
          <stop offset=".52" stopColor="#0d6c22" />
          <stop offset=".78" stopColor="#07551b" />
          <stop offset="1" stopColor="#043e15" />
        </linearGradient>
        <linearGradient id="tb-green-lid" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#18852d" />
          <stop offset=".6" stopColor="#0b641e" />
          <stop offset="1" stopColor="#064918" />
        </linearGradient>
        <filter id="tb-bin-shadow" x="-35%" y="-120%" width="170%" height="340%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <ellipse
        cx="122"
        cy="340"
        rx="93"
        ry="10"
        fill="#17221a"
        opacity=".28"
        filter="url(#tb-bin-shadow)"
      />
      <g aria-hidden="true">
        <circle cx="72" cy="303" r="20" fill="#16191a" />
        <circle cx="72" cy="303" r="9" fill="#555b57" />
        <circle cx="179" cy="303" r="22" fill="#121516" />
        <circle cx="179" cy="303" r="10" fill="#525a54" />
        <path
          d="M57 92 Q57 83 67 82 L178 82 Q189 84 189 94 L177 304 Q176 319 160 322 L88 322 Q72 319 70 304Z"
          fill="url(#tb-green-bin)"
          stroke="#064518"
          strokeWidth="3"
        />
        {[82, 107, 137, 164].map((x) => (
          <g key={x} fill="none" strokeLinecap="round">
            <path d={`M${x - 3} 120v171`} stroke="#034417" strokeOpacity=".42" strokeWidth="4" />
            <path d={`M${x} 119v171`} stroke="#55a760" strokeOpacity=".45" strokeWidth="2" />
          </g>
        ))}
        <path
          d="M54 78 Q54 74 60 74 L190 74 Q196 76 196 81 L193 94 L58 91Z"
          fill="#07511a"
          stroke="#064518"
          strokeWidth="2"
        />
        <path d="M61 94h129" stroke="#3a9848" strokeOpacity=".7" strokeWidth="2" />
        <image
          href="/assets/dustbinpackage/municipal_reference_decal.png"
          x="103"
          y="178"
          width="38"
          height="38"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
      <motion.g
        initial={reduced ? false : { rotate: -32 }}
        animate={{ rotate: reduced || started ? 0 : -32 }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: "tween", delay: 2, duration: 0.5, ease: "easeInOut" }
        }
        style={{ transformBox: "view-box", originX: 201, originY: 82 }}
      >
        <path
          d="M48 68 Q48 60 57 58 L194 58 Q204 60 204 69 L200 90 Q199 96 190 97 L57 91 Q49 89 48 82Z"
          fill="url(#tb-green-lid)"
          stroke="#064518"
          strokeWidth="3"
        />
        <path d="M107 60v-8q0-5 6-5h24q6 0 6 5v8" fill="#0a531b" />
      </motion.g>
    </svg>
  );
}
