import { useCallback, useEffect, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import Bin3D from "./Bin3D";

// Add future images here; only the four supplied photographs are used today.
const ITEMS = [
  ["waste1.png", -330, -35, -20, 126],
  ["waste2.png", 305, 40, 15, 140],
  ["waste3.png", -260, 155, 24, 130],
  ["waste4.png", 280, 175, -18, 126],
];
const cubic = (a, b, c, d, t) =>
  (1 - t) ** 3 * a +
  3 * (1 - t) ** 2 * t * b +
  3 * (1 - t) * t * t * c +
  t ** 3 * d;
function position(t, x, y) {
  const side = Math.sign(x);
  if (t < 0.7) {
    const u = t / 0.7;
    return [
      cubic(x, x + side * 100, side * 160, side * 65, u),
      cubic(y, y - 100, -140, -65, u),
    ];
  }
  const u = (t - 0.7) / 0.3;
  return [cubic(side * 65, side * 45, 0, 0, u), cubic(-65, -92, -26, 0, u)];
}
function LitterItem({ item, index, compact, mouth }) {
  const [name, offsetX, offsetY, rotation, size] = item;
  const progress = useMotionValue(0);
  const x = offsetX * (compact ? 0.45 : 1);
  const y = offsetY;
  const translateX = useTransform(
    progress,
    (t) => mouth.x + position(t, x, y)[0],
  );
  const translateY = useTransform(
    progress,
    (t) => mouth.y + position(t, x, y)[1],
  );
  const rotate = useTransform(
    progress,
    [0, 1],
    [rotation, rotation + Math.sign(x) * 150],
  );
  const scale = useTransform(progress, [0, 0.7, 0.92, 1], [1, 0.8, 0.24, 0.02]);
  const opacity = useTransform(progress, [0, 0.84, 1], [1, 1, 0]);
  useEffect(() => {
    const controls = animate(progress, 1, {
      delay: 0.28 + index * 0.045,
      duration: 1.05 + (index % 3) * 0.07,
      ease: [0.42, 0, 0.58, 1],
    });
    return () => controls.stop();
  }, [progress, index]);
  return (
    <motion.g
      className="litter-item"
      data-item={name}
      aria-hidden="true"
      style={{
        x: translateX,
        y: translateY,
        opacity,
        transformBox: "view-box",
        originX: 0,
        originY: 0,
      }}
    >
      <motion.g
        style={{
          rotate,
          scale,
          transformBox: "fill-box",
          originX: 0.5,
          originY: 0.5,
        }}
      >
        <image
          href={`/assets/images/waste/${name}`}
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
        />
      </motion.g>
    </motion.g>
  );
}
export default function CleanupHero() {
  const reduced = useReducedMotion();
  const [compact, setCompact] = useState(
    () => window.matchMedia("(max-width: 640px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const [imagesReady, setImagesReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [mouth, setMouth] = useState({ x: 0.5, y: 155 / 415 });
  const onModelReady = useCallback(() => setModelReady(true), []);
  const onMouth = useCallback((point) => setMouth(point), []);
  useEffect(() => {
    let active = true;
    Promise.all(
      ITEMS.map(
        ([name]) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = image.onerror = resolve;
            image.src = `/assets/images/waste/${name}`;
          }),
      ),
    ).then(() => {
      if (active) setImagesReady(true);
    });
    return () => {
      active = false;
    };
  }, []);
  const started = modelReady && imagesReady;
  const viewWidth = compact ? 520 : 1100;
  const target = { x: mouth.x * viewWidth, y: mouth.y * 415 };
  return (
    <div className="wordmark cleanup-reveal" data-ready={started}>
      <div className="cleanup-stage">
        <Bin3D
          started={started}
          reduced={!!reduced}
          compact={compact}
          onReady={onModelReady}
          onMouth={onMouth}
        />
        <svg
          className="litter-overlay"
          viewBox={`0 0 ${viewWidth} 415`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {started &&
            !reduced &&
            ITEMS.map((item, index) => (
              <LitterItem
                key={item[0]}
                item={item}
                index={index}
                compact={compact}
                mouth={target}
              />
            ))}
        </svg>
      </div>
      <h1 aria-label="trashbuddy" className="premium-wordmark">
        {(started || reduced) && (
          <motion.span
            className="wordmark-mask"
            aria-hidden="true"
            initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{
              type: "tween",
              delay: reduced ? 0 : 2.53,
              duration: reduced ? 0 : 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {["trash", "buddy"].map((group, index) => (
              <motion.span
                key={group}
                className="wordmark-group"
                initial={
                  reduced
                    ? false
                    : { opacity: 0, y: "45%", filter: "blur(9px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  type: "tween",
                  delay: reduced ? 0 : 2.53 + index * 0.02,
                  duration: reduced ? 0 : 0.72,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {group}
              </motion.span>
            ))}
          </motion.span>
        )}
      </h1>
    </div>
  );
}
