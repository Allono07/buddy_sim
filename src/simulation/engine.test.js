import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  reducer,
  metrics,
  routeTo,
  HOME,
  START,
  delay,
  distance,
} from "./engine.js";
test("route preserves eleven points, endpoints, timing and distance", () => {
  const route = routeTo(START, HOME);
  assert.equal(route.length, 11);
  assert.deepEqual(route[0], START);
  assert.deepEqual(route[10], HOME);
  assert.equal(delay(3), 400);
  assert.equal(delay(0.5), 2400);
  assert.ok(distance(START, HOME) > 500);
});
test("offline start is blocked; pause resumes without restarting progress", () => {
  let s = reducer(initialState, { type: "start" });
  assert.equal(s.moving, false);
  s = reducer(s, { type: "online" });
  s = reducer(s, { type: "start" });
  s = reducer(s, { type: "tick" });
  s = reducer(s, { type: "pause" });
  assert.equal(s.paused, true);
  assert.equal(reducer(s, { type: "tick" }).step, 1);
  s = reducer(s, { type: "pause" });
  assert.equal(s.moving, true);
  s = reducer(s, { type: "tick" });
  assert.equal(s.step, 2);
});
test("full route triggers one nearby notification, optional voice, then arrives", () => {
  let s = reducer({ ...initialState, autoVoice: true }, { type: "demo" });
  for (let i = 0; i < 12; i++) s = reducer(s, { type: "tick" });
  assert.equal(s.notifications, 1);
  assert.equal(s.calls, 1);
  assert.equal(s.arrived, true);
  assert.deepEqual(s.truck, HOME);
  assert.equal(metrics(s).progress, 100);
  assert.equal(metrics(s).eta, "0:00");
  assert.equal(s.moving, false);
});
test("reset and offline stop movement, clear resets counters and events", () => {
  let s = reducer(initialState, { type: "demo" });
  s = reducer(s, { type: "tick" });
  s = reducer(s, { type: "notify" });
  s = reducer(s, { type: "reset" });
  assert.deepEqual(s.truck, START);
  assert.equal(s.step, 0);
  assert.equal(s.notice, false);
  s = reducer(s, { type: "online" });
  assert.equal(s.online, false);
  s = reducer(s, { type: "clear" });
  assert.deepEqual(s.events, []);
  assert.equal(s.notifications, 0);
});
test("disabled push suppresses automatic notifications and location reroutes", () => {
  let s = reducer({ ...initialState, push: false }, { type: "demo" });
  for (let i = 0; i < 12; i++) s = reducer(s, { type: "tick" });
  assert.equal(s.notifications, 0);
  const home = [13, 78];
  s = reducer(s, { type: "location", value: home });
  assert.deepEqual(s.route.at(-1), home);
  assert.equal(s.step, 0);
});
