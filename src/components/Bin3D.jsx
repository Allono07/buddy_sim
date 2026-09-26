import { useEffect, useRef, useState } from "react";
import Bin from "./Bin";

export default function Bin3D({ started, reduced, compact, onReady, onMouth }) {
  const host = useRef();
  const controller = useRef();
  const playback = useRef({ started, reduced });
  playback.current = { started, reduced };
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    let active = true;
    const fail = () => {
      if (active) {
        controller.current?.dispose();
        controller.current = null;
        setFallback(true);
        onReady();
      }
    };
    import("./binScene")
      .then(({ createBinScene }) => {
        if (!active) return;
        try {
          controller.current = createBinScene(host.current, {
            onReady: () => active && onReady(),
            onMouth: (p) => active && onMouth(p),
            onError: fail,
          });
          controller.current.setPlayback(
            playback.current.started,
            playback.current.reduced,
          );
        } catch {
          fail();
        }
      })
      .catch(fail);
    return () => {
      active = false;
      controller.current?.dispose();
      controller.current = null;
    };
  }, [onReady, onMouth]);
  useEffect(() => {
    controller.current?.setPlayback(started, reduced);
  }, [started, reduced]);
  return (
    <>
      <div
        ref={host}
        className="bin-3d"
        role="img"
        aria-label="Green two-wheel municipal waste bin with an animated hinged lid"
        hidden={fallback}
      />
      {fallback && (
        <div className="bin-fallback">
          <Bin
            key={started ? "playing" : "waiting"}
            compact={compact}
            started={started}
          />
        </div>
      )}
    </>
  );
}
