import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { MapPin } from "lucide-react-native";

const ML_CSS = "https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.css";
const ML_JS = "https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.js";
const TIANDITU_TOKEN = process.env.EXPO_PUBLIC_TIANDITU_TOKEN || "";

interface Location { lat: number; lng: number; name: string; description?: string; }

interface Props {
  locations: Location[];
  onLocationPress?: (loc: Location) => void;
  focusLocation?: { lat: number; lng: number; zoom?: number } | null;
  isGenerating?: boolean;
  animateRoute?: boolean;
}

// Major tourist cities for labels
const CITY_LABELS = [
  { name:"北京", lat:39.9, lng:116.4 }, { name:"上海", lat:31.2, lng:121.5 },
  { name:"广州", lat:23.1, lng:113.3 }, { name:"深圳", lat:22.5, lng:114.1 },
  { name:"成都", lat:30.6, lng:104.1 }, { name:"杭州", lat:30.3, lng:120.2 },
  { name:"西安", lat:34.3, lng:108.9 }, { name:"重庆", lat:29.4, lng:106.9 },
  { name:"南京", lat:32.1, lng:118.8 }, { name:"武汉", lat:30.6, lng:114.3 },
  { name:"厦门", lat:24.5, lng:118.1 }, { name:"三亚", lat:18.3, lng:109.5 },
  { name:"拉萨", lat:29.7, lng:91.1 }, { name:"昆明", lat:25.0, lng:102.7 },
  { name:"东京", lat:35.7, lng:139.7 }, { name:"大阪", lat:34.7, lng:135.5 },
  { name:"首尔", lat:37.6, lng:127.0 }, { name:"曼谷", lat:13.8, lng:100.5 },
  { name:"新加坡", lat:1.35, lng:103.8 }, { name:"巴黎", lat:48.9, lng:2.35 },
  { name:"伦敦", lat:51.5, lng:-0.13 }, { name:"纽约", lat:40.7, lng:-74.0 },
  { name:"悉尼", lat:-33.9, lng:151.2 }, { name:"迪拜", lat:25.2, lng:55.3 },
  { name:"罗马", lat:41.9, lng:12.5 }, { name:"巴厘岛", lat:-8.3, lng:115.1 },
];

function injectCSS(h: string) { if(!document.querySelector(`link[href="${h}"]`)){const l=document.createElement("link");l.rel="stylesheet";l.href=h;document.head.appendChild(l);} }
function injectScript(src: string): Promise<void> { return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement("script");s.src=src;s.onload=()=>res();s.onerror=()=>rej(new Error(`CDN: ${src}`));document.head.appendChild(s);}); }

// ===== suncalc terminator =====
function computeTerminator(): number[][][] {
  const now = new Date();
  const jd = (now.getTime() / 86400000) + 2440587.5;
  const n = jd - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = (357.528 + 0.9856003 * n) % 360;
  const lambda = L + 1.915 * Math.sin(g * Math.PI/180) + 0.020 * Math.sin(2*g*Math.PI/180);
  const epsilon = 23.439 - 0.0000004 * n;
  const ra = Math.atan2(Math.cos(epsilon*Math.PI/180)*Math.sin(lambda*Math.PI/180), Math.cos(lambda*Math.PI/180)) * 180/Math.PI;
  const dec = Math.asin(Math.sin(epsilon*Math.PI/180)*Math.sin(lambda*Math.PI/180)) * 180/Math.PI;
  const gmst = (6.697375 + 0.0657098242 * n + now.getUTCHours() + now.getUTCMinutes()/60) % 24;
  const sunLng = ((ra - gmst * 15) + 360) % 360 - 180;

  const pts: number[][] = [];
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 360 - 180;
    const lat = Math.atan(-Math.cos(bearing * Math.PI/180) / Math.tan(dec * Math.PI/180)) * 180/Math.PI;
    const lng = sunLng + bearing;
    pts.push([lng, Math.max(-85, Math.min(85, lat))]);
  }
  // Close the ring path — create polygon covering the night side
  const ring = pts.concat([pts[0]]);
  const nightSide = sunLng < 0 ? 1 : -1;
  const pole: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    pole.push([sunLng + (i/steps)*360 - 180, nightSide * 85]);
  }

  return [ring, pole];
}

function WebGlobe({ locations, onLocationPress, animateRoute }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading"|"ready"|"error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // ===== BOOT =====
  useEffect(() => {
    let cancelled = false;
    const c = containerRef.current; if (!c) return;
    async function boot() {
      try {
        injectCSS(ML_CSS); await injectScript(ML_JS);
        if (cancelled) return;
        const ml = (window as any).maplibregl; if (!ml) throw new Error("MapLibre fail");

        const isDark = (window as any).__tripapp_theme === "dark";
        const sources: any = {};
        const layers: any[] = [];

        // ESRI satellite basemap
        sources.esri = { type:"raster", tiles:["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"], tileSize:256, maxzoom:19 };
        layers.push({ id:"esri", type:"raster", source:"esri" });

        // Tianditu Chinese labels (from env var)
        if (TIANDITU_TOKEN && TIANDITU_TOKEN.length > 10) {
          sources.tlabel = { type:"raster", tiles:[
            `https://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${TIANDITU_TOKEN}`,
            `https://t1.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${TIANDITU_TOKEN}`,
          ], tileSize:256, maxzoom:18 };
          layers.push({ id:"tlabel", type:"raster", source:"tlabel" });
        }

        // Terminator GeoJSON source (will be updated)
        sources.terminator = { type:"geojson", data:{ type:"Feature", geometry:{ type:"Polygon", coordinates: computeTerminator() } } };
        layers.push({ id:"night", type:"fill", source:"terminator",
          paint: { "fill-color":"#000020", "fill-opacity":0.35 } });

        const map = new ml.Map({
          container:c,
          style:{ version:8, sources, layers },
          center:[104.07,35.5], zoom:3, minZoom:2, maxZoom:18,
          projection:"globe", pitch:0,
          attributionControl:false,
        });

        map.addControl(new ml.NavigationControl({ showCompass:true, showZoom:true, visualizePitch:true }), "bottom-right");

        map.on("style.load", () => {
          try { map.setFog({ color:"#d0e0f0","high-color":"#c0d8f0","horizon-blend":0.2,"space-color":"#050510","star-intensity":0.3 }); } catch{}

          // City labels
          CITY_LABELS.forEach((city) => {
            const el = document.createElement("div");
            el.innerHTML = `<div style="font-size:10px;color:#fff;font-weight:600;text-shadow:0 1px 3px rgba(0,0,0,0.7);white-space:nowrap;font-family:system-ui;cursor:pointer">${city.name}</div>`;
            new ml.Marker({element:el,anchor:"center"}).setLngLat([city.lng,city.lat]).addTo(map);
          });

          // User locations
          locations.forEach((loc) => {
            if (!loc.lat||!loc.lng||isNaN(loc.lat)||isNaN(loc.lng)) return;
            const el = document.createElement("div");
            el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer"><div style="width:12px;height:12px;border-radius:50%;background:#C9A96E;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div><div style="background:rgba(255,255,255,0.9);backdrop-filter:blur(10px);border-radius:10px;padding:2px 8px"><span style="color:#1A2744;font-size:10px;font-weight:600">${loc.name}</span></div></div>`;
            new ml.Marker({element:el,anchor:"bottom"}).setLngLat([loc.lng,loc.lat]).addTo(map);
            el.onclick=()=>onLocationPress?.(loc);
          });

          setStatus("ready");
        });

        mapRef.current = map;

        // Update terminator every 60s
        const termInterval = setInterval(() => {
          if (cancelled) return;
          try {
            const src = map.getSource("terminator");
            if (src) src.setData({ type:"Feature", geometry:{ type:"Polygon", coordinates: computeTerminator() } });
          } catch{}
        }, 60000);
        return () => clearInterval(termInterval);

      } catch(e:any) { if(!cancelled) { setErrorMsg(e.message); setStatus("error"); } }
    }
    boot();
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // ===== Route + vehicle on AI generation =====
  useEffect(() => {
    if (!animateRoute||!mapRef.current||locations.length<2) return;
    const map = mapRef.current; const ml = (window as any).maplibregl; if(!ml) return;
    const valid = locations.filter((l:any)=>l.lat&&l.lng&&!isNaN(l.lat)&&!isNaN(l.lng));
    if (valid.length<2) return;
    const coords = valid.map((l:any)=>[l.lng,l.lat]);
    let cancelled = false; const cbs:(()=>void)[]=[];

    const sampleArc = (s:number[],e:number[],n:number) => {
      const p:number[][]=[];
      for(let i=0;i<=n;i++){const f=i/n;const la1=s[1]*Math.PI/180,lo1=s[0]*Math.PI/180,la2=e[1]*Math.PI/180,lo2=e[0]*Math.PI/180;
      const d=2*Math.asin(Math.sqrt(Math.pow(Math.sin((la2-la1)/2),2)+Math.cos(la1)*Math.cos(la2)*Math.pow(Math.sin((lo2-lo1)/2),2)));
      const A=Math.sin((1-f)*d)/Math.sin(d),B=Math.sin(f*d)/Math.sin(d);
      const x=A*Math.cos(la1)*Math.cos(lo1)+B*Math.cos(la2)*Math.cos(lo2);
      const y=A*Math.cos(la1)*Math.sin(lo1)+B*Math.cos(la2)*Math.sin(lo2);
      const z=A*Math.sin(la1)+B*Math.sin(la2);
      p.push([Math.atan2(y,x)*180/Math.PI,Math.atan2(z,Math.sqrt(x*x+y*y))*180/Math.PI]);}
      return p;
    };
    const arc = sampleArc([coords[0][0],coords[0][1]],[coords[coords.length-1][0],coords[coords.length-1][1]],80);
    const rid="ai-route-"+Date.now();
    map.addSource(rid,{type:"geojson",data:{type:"Feature",geometry:{type:"LineString",coordinates:arc}}});
    map.addLayer({id:rid+"-glow",type:"line",source:rid,paint:{"line-color":"#C9A96E","line-width":2.5,"line-opacity":0.9}});
    map.addLayer({id:rid+"-outer",type:"line",source:rid,paint:{"line-color":"#C9A96E","line-width":6,"line-opacity":0.12,"line-blur":3}});
    cbs.push(()=>{try{map.removeLayer(rid+"-glow");map.removeLayer(rid+"-outer");map.removeSource(rid);}catch{}});

    const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@turf/turf@7/turf.min.js";
    s.onload=()=>{const turf=(window as any).turf;if(!turf||cancelled)return;
      const start=turf.point([coords[0][0],coords[0][1]]),end=turf.point([coords[coords.length-1][0],coords[coords.length-1][1]]);
      const gc=turf.greatCircle(start,end,{npoints:100});const line=turf.lineString(gc.geometry.coordinates);
      const totalLen=turf.length(line,{units:"kilometers"});
      const fp=turf.along(line,0,{units:"kilometers"});const sc=fp?.geometry?.coordinates;
      if(!sc||sc.length<2||isNaN(sc[0]))return;
      const ve=document.createElement("div");
      ve.innerHTML=`<div style="opacity:0;transition:opacity 0.6s;transform-style:preserve-3d;perspective:80px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5))"><svg width="24" height="24" viewBox="0 0 32 32"><path d="M16 4L28 24H20L16 16L12 24H4L16 4Z" fill="white" stroke="#C9A96E" stroke-width="1.2"/><path d="M16 16L20 24H28L20 12L16 16Z" fill="#C9A96E" opacity="0.7"/></svg></div>`;
      const inner=ve.firstChild as HTMLElement;if(inner)inner.style.transform="rotateX(18deg) scale(1.1)";
      const vm=new ml.Marker({element:ve,anchor:"center"}).setLngLat(sc).addTo(map);
      requestAnimationFrame(()=>{if(inner){inner.style.opacity="1";inner.style.transform="rotateX(10deg) scale(1.05)";}});
      let prog=0;
      const anim=()=>{if(cancelled){vm.remove();return;}prog+=0.0015;if(prog>1)prog=0;
        const pt=turf.along(line,prog*totalLen,{units:"kilometers"});const c=pt?.geometry?.coordinates;
        if(!c||isNaN(c[0])){requestAnimationFrame(anim);return;}vm.setLngLat(c);
        if(prog+0.0015<=1){const nx=turf.along(line,(prog+0.0015)*totalLen,{units:"kilometers"});const nc=nx?.geometry?.coordinates;
        if(nc&&!isNaN(nc[0])){const ang=Math.atan2(nc[0]-c[0],nc[1]-c[1])*180/Math.PI;const bk=Math.sin(prog*Math.PI*2)*5;
        if(inner)inner.style.transform=`rotateX(10deg) rotateY(${bk}deg) rotateZ(${-ang}deg) scale(1.05)`;}}
        requestAnimationFrame(anim);};anim();};
    document.head.appendChild(s);cbs.push(()=>{cancelled=true;});
    return ()=>{cbs.forEach(fn=>fn());};
  }, [animateRoute, locations.length]);

  return (
    <div ref={containerRef} style={{width:"100%",height:"100%",position:"relative"}}>
      {status==="loading"&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"#050510",zIndex:1}}><div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>🌍</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:14,fontFamily:"system-ui"}}>加载 3D 地球...</div></div></div>}
      {status==="error"&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"#050510",zIndex:1}}><div style={{textAlign:"center",padding:20}}><div style={{fontSize:48,marginBottom:12}}>🗺️</div><div style={{color:"rgba(255,255,255,0.7)",fontSize:15,fontWeight:600}}>加载失败</div><div style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginTop:8,maxWidth:280,fontFamily:"monospace"}}>{errorMsg}</div></div></div>}
    </div>
  );
}

function NativePlaceholder({ locations }: { locations: Location[] }) {
  return <View style={{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#050510"}}><Text style={{fontSize:64,marginBottom:16}}>🌍</Text><Text style={{fontSize:18,fontWeight:"700",color:"#FFF"}}>3D 地球</Text><Text style={{fontSize:14,color:"rgba(255,255,255,0.5)",marginTop:8,textAlign:"center",paddingHorizontal:40}}>npx expo prebuild 后启用原生</Text></View>;
}

export function TripMapView(props: Props) {
  return <View style={{flex:1}}>
    <View style={{flex:1}}>{Platform.OS==="web"?<WebGlobe {...props}/>:<NativePlaceholder locations={props.locations}/>}</View>
    {props.locations.length>0&&<View style={{position:"absolute",bottom:20,left:0,right:0}}><BlurView intensity={70} tint="dark" style={{marginHorizontal:16,borderRadius:20,overflow:"hidden",backgroundColor:"rgba(0,0,0,0.4)",padding:16,maxHeight:140}}><Text style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:"600",letterSpacing:0.5,marginBottom:8}}>目的地 · {props.locations.length} 个</Text><View style={{flexDirection:"row",flexWrap:"wrap",gap:6}}>{props.locations.map((loc,i)=><Pressable key={i} onPress={()=>props.onLocationPress?.(loc)} style={{flexDirection:"row",alignItems:"center",gap:4,paddingHorizontal:10,paddingVertical:6,backgroundColor:"rgba(255,255,255,0.15)",borderRadius:20}}><MapPin size={12} color="#FFF"/><Text style={{color:"#FFF",fontSize:12,fontWeight:"500"}}>{loc.name}</Text></Pressable>)}</View></BlurView></View>}
  </View>;
}
