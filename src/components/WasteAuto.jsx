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
      <img
        className="waste-auto"
        src="/assets/images/bbmp-auto-tipper.svg"
        alt=""
        aria-hidden="true"
      />
    </motion.div>
  );
}
