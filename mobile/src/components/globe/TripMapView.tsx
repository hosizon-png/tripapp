import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { MapPin } from "lucide-react-native";

const TIANDITU_TOKEN = "b3a9e6486cea01c01b6dc7650d5ee03a";

// MapLibre CDN URLs (jsdelivr, China-accessible)
const ML_CSS = "https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.css";
const ML_JS = "https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.js";

interface Location {
  lat: number; lng: number;
  name: string; description?: string;
}

interface Props {
  locations: Location[];
  onLocationPress?: (loc: Location) => void;
  focusLocation?: { lat: number; lng: number; zoom?: number } | null;
  isGenerating?: boolean;
}

// Script tag injection — bypasses Metro bundler entirely
function injectCSS(href: string) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = href;
    document.head.appendChild(link);
  }
}

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`CDN load failed: ${src}`));
    document.head.appendChild(s);
  });
}

// ====== Web: MapLibre GL 4 with globe projection ======
function WebGlobe({ locations, onLocationPress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    async function boot() {
      try {
        // Step 1: Inject CSS + JS into page
        injectCSS(ML_CSS);
        await injectScript(ML_JS);
        if (cancelled) return;

        // Step 2: Access global maplibregl
        const maplibregl = (window as any).maplibregl;
        if (!maplibregl) throw new Error("MapLibre GL not loaded");

        // Step 3: Build style based on current theme
        const isDark = (window as any).__tripapp_theme === "dark";
        const sources: any = {};
        const layers: any[] = [];

        // Day: CartoDB Light / Night: CartoDB Dark
        const tileBase = isDark
          ? "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
        sources.basemap = { type: "raster", tiles: [tileBase], tileSize: 256, maxzoom: 19 };
        layers.push({ id: "basemap", type: "raster", source: "basemap" });

        // Route lines — use great circle arc between first and last destination
        const validLocs = locations.filter((l) => l.lat && l.lng && !isNaN(l.lat) && !isNaN(l.lng));
        if (validLocs.length >= 2) {
          const f = validLocs[0]; const l = validLocs[validLocs.length - 1];
          // Quick great circle approximation: sample intermediate points along the arc
          const sampleArc = (start: number[], end: number[], n: number) => {
            const pts: number[][] = [];
            for (let i = 0; i <= n; i++) {
              const frac = i / n;
              // Simple spherical interpolation for arc
              const lat1 = start[1] * Math.PI / 180, lng1 = start[0] * Math.PI / 180;
              const lat2 = end[1] * Math.PI / 180, lng2 = end[0] * Math.PI / 180;
              const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat2 - lat1) / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng2 - lng1) / 2), 2)));
              const A = Math.sin((1 - frac) * d) / Math.sin(d);
              const B = Math.sin(frac * d) / Math.sin(d);
              const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
              const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
              const z = A * Math.sin(lat1) + B * Math.sin(lat2);
              const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
              const lng = Math.atan2(y, x) * 180 / Math.PI;
              pts.push([lng, lat]);
            }
            return pts;
          };
          sources.route = {
            type: "geojson",
            data: { type: "Feature", geometry: { type: "LineString", coordinates: sampleArc([f.lng, f.lat], [l.lng, l.lat], 80) } },
          };
          layers.push({ id: "route-glow", type: "line", source: "route",
            paint: { "line-color": "#007AFF", "line-width": 3, "line-opacity": 0.7 } });
        }

        const map = new maplibregl.Map({
          container,
          style: { version: 8, sources, layers },
          center: [104.07, 35.5],
          zoom: 4,
          // NO globe projection, NO rotation — stable 2D plane
          attributionControl: false,
        });

        // ===== NO rotation. Map stays as stable 2D plane =====

        map.on("style.load", () => {
          // Markers for each valid location
          locations.forEach((loc) => {
            if (!loc.lat || !loc.lng || isNaN(loc.lat) || isNaN(loc.lng)) return;
            const el = document.createElement("div");
            el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer">
              <div style="width:14px;height:14px;border-radius:50%;background:#007AFF;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2)"></div>
              <div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-radius:10px;padding:3px 8px;white-space:nowrap;border:0.5px solid rgba(0,0,0,0.08)">
                <span style="color:#1C1C1E;font-size:11px;font-weight:600;font-family:system-ui,sans-serif">${loc.name}</span>
              </div></div>`;
            new maplibregl.Marker({ element: el, anchor: "bottom" })
              .setLngLat([loc.lng, loc.lat]).addTo(map);
            el.onclick = () => onLocationPress?.(loc);
          });

          // ===== Vehicle on great circle arc =====
          const validLocs = locations.filter((l) => l.lat && l.lng && !isNaN(l.lat) && !isNaN(l.lng));
          if (validLocs.length >= 2) {
            const routeCoords = validLocs.map((l) => [l.lng, l.lat]);
            const turfScript = document.createElement("script");
            turfScript.src = "https://cdn.jsdelivr.net/npm/@turf/turf@7/turf.min.js";
            turfScript.onload = () => {
              const turf = (window as any).turf;
              if (!turf) return;
              // Great circle arc between first and last destination
              const start = turf.point(routeCoords[0]);
              const end = turf.point(routeCoords[routeCoords.length - 1]);
              const arc = turf.greatCircle(start, end, { npoints: 100 });
              const arcCoords = arc.geometry.coordinates;
              const line = turf.lineString(arcCoords);
              const totalLen = turf.length(line, { units: "kilometers" });

              // Strict guard: verify first point is valid
              const startPt = turf.along(line, 0, { units: "kilometers" });
              const startCoord = startPt?.geometry?.coordinates;
              if (!startCoord || startCoord.length < 2 || isNaN(startCoord[0]) || isNaN(startCoord[1])) return;

              // Luxury SVG airplane — white body + gold tailfin
              const planeSVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5))">
                <path d="M16 4L28 24H20L16 16L12 24H4L16 4Z" fill="white" stroke="#C9A96E" stroke-width="1.2"/>
                <path d="M16 16L20 24H28L20 12L16 16Z" fill="#C9A96E" opacity="0.7"/>
                <circle cx="16" cy="8" r="2" fill="#1A2744"/>
                <line x1="8" y1="24" x2="24" y2="24" stroke="#C9A96E" stroke-width="1"/>
              </svg>`;
              const vehicleEl = document.createElement("div");
              vehicleEl.innerHTML = `<div style="opacity:0;transition:opacity 0.8s ease-in,transform 0.1s linear;transform-style:preserve-3d;perspective:80px">${planeSVG}</div>`;
              const inner = vehicleEl.firstChild as HTMLElement;

              // Set initial 3D transform
              if (inner) {
                inner.style.transform = "rotateX(25deg) rotateZ(-5deg) scale(1.2)";
              }

              const vehicleMarker = new maplibregl.Marker({ element: vehicleEl, anchor: "center" })
                .setLngLat(startCoord as [number, number]).addTo(map);

              // Fade in + 3D entrance animation
              requestAnimationFrame(() => {
                if (inner) {
                  inner.style.opacity = "1";
                  inner.style.transform = "rotateX(15deg) rotateZ(0deg) scale(1.1)";
                }
              });

              let progress = 0;
              const speed = 0.001;
              const animate = () => {
                if (cancelled) return;
                progress += speed;
                if (progress > 1) progress = 0;
                const pt = turf.along(line, progress * totalLen, { units: "kilometers" });
                const coord = pt?.geometry?.coordinates;
                if (!coord || isNaN(coord[0]) || isNaN(coord[1])) { requestAnimationFrame(animate); return; }
                vehicleMarker.setLngLat(coord as [number, number]);
                // Tilt
                if (progress + speed <= 1) {
                  const next = turf.along(line, (progress + speed) * totalLen, { units: "kilometers" });
                  const nc = next?.geometry?.coordinates;
                  if (nc && !isNaN(nc[0]) && !isNaN(nc[1])) {
                    const dx = nc[0] - coord[0], dy = nc[1] - coord[1];
                    const angle = Math.atan2(dx, dy) * (180 / Math.PI);
                    // 3D flight: rotateZ for heading + subtle rotateY for banking + constant rotateX for depth
                    const bankAngle = Math.sin(progress * Math.PI * 2) * 8;
                    inner.style.transform = `rotateX(15deg) rotateY(${bankAngle}deg) rotateZ(${-angle}deg) scale(1.1)`;
                  }
                }
                requestAnimationFrame(animate);
              };
              animate();
            };
            document.head.appendChild(turfScript);
          }

          // NO rotation — map stays fixed
          setStatus("ready");
        });

        mapRef.current = map;
      } catch (e: any) {
        if (!cancelled) {
          setErrorMsg(e.message || "Unknown");
          setStatus("error");
        }
      }
    }

    boot();
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      {status === "loading" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000010", zIndex: 1 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12, animation: "pulse 2s infinite" }}>🌍</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "system-ui" }}>加载 3D 地球...</div>
          </div>
        </div>
      )}
      {status === "error" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000010", zIndex: 1 }}>
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600 }}>3D 地球加载失败</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 8, maxWidth: 280, fontFamily: "monospace" }}>{errorMsg}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ====== Native: placeholder ======
function NativePlaceholder({ locations }: { locations: Location[] }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000010" }}>
      <Text style={{ fontSize: 64, marginBottom: 16 }}>🌍</Text>
      <Text style={{ fontSize: 18, fontWeight: "700", color: "#FFF" }}>3D 地球</Text>
      <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8, textAlign: "center", paddingHorizontal: 40 }}>
        运行 npx expo prebuild 后启用原生 3D 地球
      </Text>
      <View style={{ marginTop: 20, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#007AFF" }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFF" }}>{locations.length} 个目的地</Text>
      </View>
    </View>
  );
}

// ====== Main ======
export function TripMapView(props: Props) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {Platform.OS === "web" ? (
          <WebGlobe {...props} />
        ) : (
          <NativePlaceholder locations={props.locations} />
        )}
      </View>

      {props.locations.length > 0 && (
        <View style={{ position: "absolute", bottom: 20, left: 0, right: 0 }}>
          <BlurView intensity={70} tint="dark"
            style={{ marginHorizontal: 16, borderRadius: 20, overflow: "hidden", backgroundColor: "rgba(0,0,0,0.4)", padding: 16, maxHeight: 140 }}>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, marginBottom: 8 }}>
              行程目的地 · {props.locations.length} 个
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {props.locations.map((loc, i) => (
                <Pressable key={i} onPress={() => props.onLocationPress?.(loc)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20 }}>
                  <MapPin size={12} color="#FFF" />
                  <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "500" }}>{loc.name}</Text>
                </Pressable>
              ))}
            </View>
          </BlurView>
        </View>
      )}
    </View>
  );
}
