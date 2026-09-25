export const START = [12.975, 77.598];
export const HOME = [12.9716, 77.5946];
export const routeTo = (start, end) =>
  Array.from({ length: 11 }, (_, i) =>
    start.map((v, j) => v + ((end[j] - v) * i) / 10),
  );
export const delay = (speed) => 1200 / Math.max(0.5, speed);
export function distance(a, b) {
  const rad = (n) => (n * Math.PI) / 180;
  const x =
    Math.sin(rad(b[0] - a[0]) / 2) ** 2 +
    Math.cos(rad(a[0])) *
      Math.cos(rad(b[0])) *
      Math.sin(rad(b[1] - a[1]) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
export const initialState = {
  online: false,
  moving: false,
  paused: false,
  arrived: false,
  speed: 1,
  home: HOME,
  truck: START,
  route: routeTo(START, HOME),
  step: 0,
  notifications: 0,
  calls: 0,
  push: true,
  autoVoice: false,
  callMode: "manual-selection",
  events: [],
  notice: false,
  call: false,
};
function log(s, msg, type = "info") {
  return {
    ...s,
    events: [
      ...s.events,
      {
        ts: new Date().toISOString(),
        time: new Date().toLocaleTimeString("en-GB"),
        msg,
        type,
      },
    ],
  };
}
function notify(s) {
  s = s.push
    ? log(
        { ...s, notice: true, notifications: s.notifications + 1 },
        "Waste Truck Nearby!",
        "warn",
      )
    : log(s, "Push notifications disabled; alert skipped.");
  return s.autoVoice ? voice(s) : s;
}
function voice(s) {
  return log(
    { ...s, calls: s.calls + 1, call: true },
    "Voice call triggered (simulated).",
    "warn",
  );
}
function reset(s) {
  return {
    ...s,
    truck: START,
    route: routeTo(START, s.home),
    step: 0,
    moving: false,
    paused: false,
    arrived: false,
    notice: false,
    call: false,
  };
}
export function reducer(s, a) {
  switch (a.type) {
    case "online":
      return log(
        { ...reset(s), online: !s.online },
        s.online
          ? "Truck went OFFLINE."
          : "Truck is now ONLINE at start position.",
        s.online ? "warn" : "success",
      );
    case "start":
      if (!s.online) return log(s, "Bring truck online first!", "error");
      if (s.moving) return s;
      return log(
        {
          ...s,
          moving: true,
          paused: false,
          arrived: false,
          step: 0,
          route: routeTo(s.truck, s.home),
        },
        "Truck started route towards user.",
        "success",
      );
    case "pause":
      return s.moving || s.paused
        ? log(
            { ...s, moving: !s.moving, paused: !s.paused },
            s.paused ? "Route resumed." : "Route paused.",
          )
        : s;
    case "reset":
      return log(reset(s), "Route reset to start position.");
    case "tick": {
      if (!s.moving) return s;
      if (s.step >= s.route.length)
        return log(
          { ...s, moving: false, arrived: true },
          "Truck arrived at resident location!",
          "success",
        );
      let next = { ...s, truck: s.route[s.step], step: s.step + 1 };
      if (s.step === s.route.length - 3) next = notify(next);
      return next;
    }
    case "speed":
      return { ...s, speed: a.value };
    case "location":
      return log(
        {
          ...s,
          home: a.value,
          route: routeTo(s.truck, a.value),
          step: 0,
          arrived: false,
        },
        `Location updated → ${a.address || "Custom coordinates"} (${a.value.join(", ")})`,
        "success",
      );
    case "notify":
      return notify(s);
    case "voice":
      return voice(s);
    case "close":
      return { ...s, [a.key]: false };
    case "setting":
      return log({ ...s, [a.key]: a.value }, `${a.key} changed to ${a.value}.`);
    case "clear":
      return {
        ...s,
        events: [],
        notifications: 0,
        calls: 0,
        notice: false,
        call: false,
      };
    case "log":
      return log(s, a.msg, a.level);
    case "demo":
      return log(
        { ...reset(s), online: true, moving: true },
        "Full demo started.",
        "success",
      );
    case "nearby":
      return notify({
        ...s,
        online: true,
        moving: false,
        paused: false,
        arrived: false,
        truck: s.home.map((v) => v + 0.00045),
      });
    default:
      return s;
  }
}
export function metrics(s) {
  const progress = Math.round((s.step / s.route.length) * 100);
  const seconds = Math.floor(
    ((s.route.length - s.step) * delay(s.speed)) / 1000,
  );
  return {
    progress,
    status: !s.online
      ? "Offline"
      : s.arrived
        ? "Arrived"
        : s.paused
          ? "Paused"
          : s.moving
            ? "En Route"
            : "Online",
    eta:
      s.moving || s.paused || s.arrived
        ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
        : "--",
    distance: distance(s.truck, s.home),
  };
}
