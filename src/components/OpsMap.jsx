import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed } from "lucide-react";
export default function OpsMap({ sim, compact = false }) {
  const node = useRef();
  const map = useRef();
  const layers = useRef();
  const [ready, setReady] = useState(false);
  const { state } = sim;
  useEffect(() => {
    const m = L.map(node.current, {
      zoomControl: !compact,
      scrollWheelZoom: false,
    }).setView(state.home, 14);
    map.current = m;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(m);
    layers.current = L.layerGroup().addTo(m);
    const observer = new ResizeObserver(() => m.invalidateSize());
    observer.observe(node.current);
    setReady(true);
    return () => {
      observer.disconnect();
      m.remove();
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const group = layers.current;
    group.clearLayers();
    L.circleMarker(state.home, {
      radius: 8,
      color: "#fff",
      weight: 3,
      fillColor: "#d17640",
      fillOpacity: 1,
    })
      .bindPopup("Resident")
      .addTo(group);
    if (state.online) {
      L.polyline(state.route, {
        color: "#559450",
        weight: 3,
        dashArray: "5 7",
      }).addTo(group);
      L.marker(state.truck, {
        icon: L.divIcon({
          className: "truck-marker",
          html: '<span aria-label="BBMP truck">➜</span>',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
      })
        .bindPopup("BBMP Truck")
        .addTo(group);
    }
  }, [ready, state.home, state.truck, state.online, state.route]);
  function center() {
    map.current?.fitBounds(
      L.latLngBounds(
        state.online ? [state.home, state.truck] : [state.home],
      ).pad(0.3),
      { maxZoom: 16 },
    );
  }
  return (
    <div className={`map-shell ${compact ? "compact" : ""}`}>
      <div
        ref={node}
        className="map"
        aria-label="Resident and BBMP truck map"
      />
      <button
        className="map-center icon-button"
        aria-label="Center map"
        onClick={center}
      >
        <LocateFixed size={17} />
      </button>
    </div>
  );
}
