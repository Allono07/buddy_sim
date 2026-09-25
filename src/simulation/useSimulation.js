import { useEffect, useReducer, useRef } from "react";
import { initialState, reducer, delay, metrics } from "./engine";
export function useSimulation() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audio = useRef(null);
  useEffect(() => {
    if (!state.moving) return;
    const id = setInterval(
      () => dispatch({ type: "tick" }),
      delay(state.speed),
    );
    return () => clearInterval(id);
  }, [state.moving, state.speed]);
  useEffect(() => {
    if (!state.notice) return;
    audio.current = new Audio("/assets/sounds/truck_alert.mp3");
    audio.current.play().catch(() => {});
    return () => {
      audio.current?.pause();
    };
  }, [state.notice, state.notifications]);
  useEffect(() => {
    if (!state.call) return;
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance(
            "Trash Buddy alert: waste truck is getting close to your location.",
          ),
        );
      }
    } catch {
      /* The visual call remains available when speech is unsupported. */
    }
    const id = setTimeout(() => dispatch({ type: "close", key: "call" }), 4500);
    return () => {
      clearTimeout(id);
      window.speechSynthesis?.cancel();
    };
  }, [state.call, state.calls]);
  return { state, dispatch, ...metrics(state) };
}
