import { motion } from "framer-motion";

export default function WasteAuto({ visible, reduced }) {
  return (
    <motion.div
      className="waste-auto-wrap"
      role="img"
      aria-label="Illustration of a BBMP municipal waste collection auto"
      initial={reduced ? false : { x: 300, opacity: 0 }}
      animate={{ x: visible ? 0 : 300, opacity: visible ? 1 : 0 }}
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
      <span className="nearby-eyebrow">THE COLLECTION TRUCK</span>
      <svg className="waste-auto" viewBox="0 0 260 190" aria-hidden="true">
        <ellipse
          cx="134"
          cy="169"
          rx="103"
          ry="10"
          fill="#25342a"
          opacity=".1"
        />
        <path
          d="M47 60Q49 47 63 47h107q10 0 14 11l11 33H47Z"
          fill="#e6b94d"
          stroke="#52624f"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M48 60h135v10H48z" fill="#52834a" />
        <path
          d="M66 55h90q8 0 10 8v22H63V62q0-7 3-7"
          fill="#eff3e9"
          stroke="#52624f"
          strokeWidth="2"
        />
        <path
          d="M69 60h38v21H66V63q0-3 3-3m44 0h38q3 0 4 4v17h-42Z"
          fill="#bfd5d4"
          stroke="#7b8d82"
          strokeWidth="1.5"
        />
        <path
          d="M72 64h31M116 64h32"
          stroke="#fff"
          strokeWidth="2"
          opacity=".8"
        />
        <path
          d="M48 87h143l14 18H41Z"
          fill="#4d8250"
          stroke="#52624f"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="m44 108 11-3h135l17 7v11H37v-9q0-4 7-6"
          fill="#e6b94d"
          stroke="#52624f"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M54 119h154v13H54z"
          fill="#dee3d9"
          stroke="#52624f"
          strokeWidth="2"
        />
        <path d="M63 124h134" stroke="#fff" strokeWidth="2" />
        <path
          d="M187 94h15l11 12h-26Z"
          fill="#f4e4a6"
          stroke="#52624f"
          strokeWidth="2"
        />
        <path
          d="M48 92h-9v10h10"
          fill="#d5e3d0"
          stroke="#52624f"
          strokeWidth="2"
        />
        <circle cx="76" cy="139" r="19" fill="#33433c" />
        <circle
          cx="76"
          cy="139"
          r="9"
          fill="#cbd0c8"
          stroke="#eff2eb"
          strokeWidth="3"
        />
        <circle cx="178" cy="139" r="19" fill="#33433c" />
        <circle
          cx="178"
          cy="139"
          r="9"
          fill="#cbd0c8"
          stroke="#eff2eb"
          strokeWidth="3"
        />
        <path d="M87 91h32v20H87z" fill="#f2f0e3" />
        <text x="91" y="100" fontSize="6" fontWeight="700" fill="#426d43">
          BBMP
        </text>
        <text x="91" y="107" fontSize="5" fill="#426d43">
          SWM
        </text>
        <path
          d="M50 49q5-8 13-8h105q8 0 13 8"
          fill="none"
          stroke="#789274"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="auto-caption">
        <i /> Nearby in your neighbourhood
      </span>
    </motion.div>
  );
}
