import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { MapPin } from "lucide-react-native";

const ML_CSS = "https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.css";
const ML_JS = "https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.js";

interface Location { lat: number; lng: number; name: string; description?: string; }

interface Props {
  locations: Location[];
  onLocationPress?: (loc: Location) => void;
  focusLocation?: { lat: number; lng: number; zoom?: number } | null;
  isGenerating?: boolean;
  animateRoute?: boolean;
}

function injectCSS(href: string) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href;
    document.head.appendChild(l);
  }
}
function injectScript(src: string): Promise<void> {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement("script"); s.src = src;
    s.onload = () => res(); s.onerror = () => rej(new Error(`CDN fail: ${src}`));
    document.head.appendChild(s);
  });
}

function WebGlobe({ locations, onLocationPress, animateRoute }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // ===== BOOT MAP =====
  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    async function boot() {
      try {
        injectCSS(ML_CSS);
        await injectScript(ML_JS);
        if (cancelled) return;
        const maplibregl = (window as any).maplibregl;
        if (!maplibregl) throw new Error("MapLibre not loaded");

        const isDark = (window as any).__tripapp_theme === "dark";

        // True 3D globe that transitions to flat + 3D buildings at high zoom
        // Inspired by 高德地图: expandZoomRange + viewMode:3D + pitch + buildingAnimation
        const map = new maplibregl.Map({
          container,
          style: {
            version: 8,
            sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, maxzoom: 19, attribution: "© OSM" } },
            layers: [{ id: "osm", type: "raster", source: "osm" }],
          },
          center: [104.07, 35.5],
          zoom: 3,                    // Start at globe view
          minZoom: 2,                 // Wide zoom range like 高德 zooms:[3,20]
          maxZoom: 18,
          projection: "globe",        // Auto-transitions: globe(<5) → flat(>5) → 3D tilt
          pitch: 0,                   // Initially flat, user tilts for 3D buildings
          attributionControl: false,
        });

        // Navigation: zoom buttons + tilt/rotate
        map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), "bottom-right");

        map.on("style.load", () => {
          try {
            map.setFog({
              color: isDark ? "#050510" : "#d8e4f0",
              "high-color": isDark ? "#101830" : "#c0d4e8",
              "horizon-blend": 0.25,
              "space-color": "#050510",
              "star-intensity": 0.35,
            });
          } catch {}
          // Markers
          locations.forEach((loc) => {
            if (!loc.lat || !loc.lng || isNaN(loc.lat) || isNaN(loc.lng)) return;
            const el = document.createElement("div");
            el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer">
              <div style="width:14px;height:14px;border-radius:50%;background:#1A2744;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15)"></div>
              <div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(10px);border-radius:10px;padding:3px 8px;white-space:nowrap;border:0.5px solid rgba(0,0,0,0.08)">
                <span style="color:#1C1C1E;font-size:11px;font-weight:600;font-family:system-ui">${loc.name}</span>
              </div></div>`;
            new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat([loc.lng, loc.lat]).addTo(map);
            el.onclick = () => onLocationPress?.(loc);
          });
          setStatus("ready");
        });

        mapRef.current = map;
      } catch (e: any) { if (!cancelled) { setErrorMsg(e.message); setStatus("error"); } }
    }
    boot();
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // ===== ROUTE LINE + AIRPLANE ANIMATION — only on AI generation =====
  useEffect(() => {
    if (!animateRoute || !mapRef.current || locations.length < 2) return;
    const map = mapRef.current;
    const maplibregl = (window as any).maplibregl;
    if (!maplibregl) return;

    const validLocs = locations.filter((l) => l.lat && l.lng && !isNaN(l.lat) && !isNaN(l.lng));
    if (validLocs.length < 2) return;
    const coords = validLocs.map((l) => [l.lng, l.lat]);

    let cancelled = false;
    const cleanup: (() => void)[] = [];

    // ----- Add arc route line to map -----
    const sampleArc = (s: number[], e: number[], n: number) => {
      const pts: number[][] = [];
      for (let i = 0; i <= n; i++) {
        const f = i / n;
        const lat1 = s[1]*Math.PI/180, lng1 = s[0]*Math.PI/180, lat2 = e[1]*Math.PI/180, lng2 = e[0]*Math.PI/180;
        const d = 2*Math.asin(Math.sqrt(Math.pow(Math.sin((lat2-lat1)/2),2)+Math.cos(lat1)*Math.cos(lat2)*Math.pow(Math.sin((lng2-lng1)/2),2)));
        const A=Math.sin((1-f)*d)/Math.sin(d), B=Math.sin(f*d)/Math.sin(d);
        const x=A*Math.cos(lat1)*Math.cos(lng1)+B*Math.cos(lat2)*Math.cos(lng2);
        const y=A*Math.cos(lat1)*Math.sin(lng1)+B*Math.cos(lat2)*Math.sin(lng2);
        const z=A*Math.sin(lat1)+B*Math.sin(lat2);
        pts.push([Math.atan2(y,x)*180/Math.PI, Math.atan2(z,Math.sqrt(x*x+y*y))*180/Math.PI]);
      }
      return pts;
    };

    const arcCoords = sampleArc([coords[0][0], coords[0][1]], [coords[coords.length-1][0], coords[coords.length-1][1]], 80);
    const routeId = "ai-route-" + Date.now();

    map.addSource(routeId, { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: arcCoords } } });
    map.addLayer({ id: routeId + "-glow", type: "line", source: routeId, paint: { "line-color": "#C9A96E", "line-width": 2.5, "line-opacity": 0.9 } });
    map.addLayer({ id: routeId + "-outer", type: "line", source: routeId, paint: { "line-color": "#C9A96E", "line-width": 6, "line-opacity": 0.15, "line-blur": 3 } });
    cleanup.push(() => { try { map.removeLayer(routeId+"-glow"); map.removeLayer(routeId+"-outer"); map.removeSource(routeId); } catch {} });

    // ----- Vehicle animation along great circle -----
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@turf/turf@7/turf.min.js";
    script.onload = () => {
      const turf = (window as any).turf;
      if (!turf || cancelled) return;
      const start = turf.point([coords[0][0], coords[0][1]]);
      const end = turf.point([coords[coords.length-1][0], coords[coords.length-1][1]]);
      const arc = turf.greatCircle(start, end, { npoints: 100 });
      const line = turf.lineString(arc.geometry.coordinates);
      const totalLen = turf.length(line, { units: "kilometers" });
      const firstPt = turf.along(line, 0, { units: "kilometers" });
      const startCoord = firstPt?.geometry?.coordinates;
      if (!startCoord || startCoord.length < 2 || isNaN(startCoord[0])) return;

      const planeSVG = `<svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 4L28 24H20L16 16L12 24H4L16 4Z" fill="white" stroke="#C9A96E" stroke-width="1.2"/><path d="M16 16L20 24H28L20 12L16 16Z" fill="#C9A96E" opacity="0.7"/><circle cx="16" cy="8" r="2" fill="#1A2744"/></svg>`;
      const ve = document.createElement("div");
      ve.innerHTML = `<div style="opacity:0;transition:opacity 0.6s;transform-style:preserve-3d;perspective:80px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5))">${planeSVG}</div>`;
      const inner = ve.firstChild as HTMLElement;
      if (inner) inner.style.transform = "rotateX(20deg) scale(1.15)";

      const vm = new maplibregl.Marker({ element: ve, anchor: "center" }).setLngLat(startCoord).addTo(map);
      requestAnimationFrame(() => { if (inner) { inner.style.opacity = "1"; inner.style.transform = "rotateX(12deg) scale(1.1)"; } });

      let progress = 0;
      const animate = () => {
        if (cancelled) { vm.remove(); return; }
        progress += 0.0015;
        if (progress > 1) progress = 0;
        const pt = turf.along(line, progress * totalLen, { units: "kilometers" });
        const c = pt?.geometry?.coordinates;
        if (!c || isNaN(c[0])) { requestAnimationFrame(animate); return; }
        vm.setLngLat(c);
        if (progress + 0.0015 <= 1) {
          const nxt = turf.along(line, (progress + 0.0015) * totalLen, { units: "kilometers" });
          const nc = nxt?.geometry?.coordinates;
          if (nc && !isNaN(nc[0])) {
            const angle = Math.atan2(nc[0] - c[0], nc[1] - c[1]) * (180 / Math.PI);
            const bank = Math.sin(progress * Math.PI * 2) * 6;
            if (inner) inner.style.transform = `rotateX(12deg) rotateY(${bank}deg) rotateZ(${-angle}deg) scale(1.1)`;
          }
        }
        requestAnimationFrame(animate);
      };
      animate();
    };
    document.head.appendChild(script);
    cleanup.push(() => { cancelled = true; });

    return () => { cleanup.forEach((fn) => fn()); };
  }, [animateRoute, locations.length]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      {status === "loading" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#050510", zIndex: 1 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "system-ui" }}>加载 3D 地球...</div>
          </div>
        </div>
      )}
      {status === "error" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#050510", zIndex: 1 }}>
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600 }}>加载失败</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 8, maxWidth: 280, fontFamily: "monospace" }}>{errorMsg}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function NativePlaceholder({ locations }: { locations: Location[] }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0a1020" }}>
      <Text style={{ fontSize: 64, marginBottom: 16 }}>🌍</Text>
      <Text style={{ fontSize: 18, fontWeight: "700", color: "#FFF" }}>3D 地球</Text>
      <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8, textAlign: "center", paddingHorizontal: 40 }}>npx expo prebuild 后启用原生</Text>
    </View>
  );
}

export function TripMapView(props: Props) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {Platform.OS === "web" ? <WebGlobe {...props} /> : <NativePlaceholder locations={props.locations} />}
      </View>
      {props.locations.length > 0 && (
        <View style={{ position: "absolute", bottom: 20, left: 0, right: 0 }}>
          <BlurView intensity={70} tint="dark" style={{ marginHorizontal: 16, borderRadius: 20, overflow: "hidden", backgroundColor: "rgba(0,0,0,0.4)", padding: 16, maxHeight: 140 }}>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, marginBottom: 8 }}>目的地 · {props.locations.length} 个</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {props.locations.map((loc, i) => (
                <Pressable key={i} onPress={() => props.onLocationPress?.(loc)} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20 }}>
                  <MapPin size={12} color="#FFF" /><Text style={{ color: "#FFF", fontSize: 12, fontWeight: "500" }}>{loc.name}</Text>
                </Pressable>
              ))}
            </View>
          </BlurView>
        </View>
      )}
    </View>
  );
}
