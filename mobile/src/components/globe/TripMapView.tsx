import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { Plus, Minus, Crosshair, Navigation } from "lucide-react-native";

const ML_CSS = "https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.0/dist/maplibre-gl.css?v=3";
const ML_JS = "https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.0/dist/maplibre-gl.js?v=3";
const TK = process.env.EXPO_PUBLIC_TIANDITU_TOKEN || "";

interface Location { lat: number; lng: number; name: string; description?: string; }
interface Props {
  locations: Location[];
  onLocationPress?: (loc: Location) => void;
  focusLocation?: { lat: number; lng: number; zoom?: number } | null;
  animateRoute?: boolean;
}

const CITIES = [
  { n:"北京",lat:39.9,lng:116.4},{n:"上海",lat:31.2,lng:121.5},{n:"广州",lat:23.1,lng:113.3},{n:"深圳",lat:22.5,lng:114.1},{n:"成都",lat:30.6,lng:104.1},{n:"杭州",lat:30.3,lng:120.2},{n:"西安",lat:34.3,lng:108.9},{n:"重庆",lat:29.4,lng:106.9},{n:"南京",lat:32.1,lng:118.8},{n:"武汉",lat:30.6,lng:114.3},{n:"厦门",lat:24.5,lng:118.1},{n:"三亚",lat:18.3,lng:109.5},{n:"拉萨",lat:29.7,lng:91.1},{n:"昆明",lat:25,lng:102.7},{n:"东京",lat:35.7,lng:139.7},{n:"大阪",lat:34.7,lng:135.5},{n:"首尔",lat:37.6,lng:127},{n:"曼谷",lat:13.8,lng:100.5},{n:"新加坡",lat:1.35,lng:103.8},{n:"巴黎",lat:48.9,lng:2.35},{n:"伦敦",lat:51.5,lng:-0.13},{n:"纽约",lat:40.7,lng:-74},{n:"悉尼",lat:-33.9,lng:151.2},{n:"迪拜",lat:25.2,lng:55.3},{n:"罗马",lat:41.9,lng:12.5}];

function injectCSS(h:string){if(!document.querySelector(`link[href="${h}"]`)){const l=document.createElement("link");l.rel="stylesheet";l.href=h;document.head.appendChild(l);}}
function injectScript(s:string):Promise<void>{return new Promise((res,rej)=>{if(document.querySelector(`script[src="${s}"]`))return res();const t=document.createElement("script");t.src=s;t.onload=()=>res();t.onerror=()=>rej(new Error(s));document.head.appendChild(t);});}

function computeTerminator():number[][][]{
  const n=new Date();const jd=n.getTime()/864e5+2440587.5;const d=jd-2451545;const L=(280.46+0.9856474*d)%360;const g=(357.528+0.9856003*d)%360;const la=L+1.915*Math.sin(g*Math.PI/180)+0.02*Math.sin(2*g*Math.PI/180);const ep=23.439-4e-7*d;const ra=Math.atan2(Math.cos(ep*Math.PI/180)*Math.sin(la*Math.PI/180),Math.cos(la*Math.PI/180))*180/Math.PI;const de=Math.asin(Math.sin(ep*Math.PI/180)*Math.sin(la*Math.PI/180))*180/Math.PI;const gm=(6.697375+0.0657098242*d+n.getUTCHours()+n.getUTCMinutes()/60)%24;const sl=((ra-gm*15)+360)%360-180;
  const pts:number[][]=[];for(let i=0;i<=120;i++){const b=(i/120)*360-180;const lat=Math.atan(-Math.cos(b*Math.PI/180)/Math.tan(de*Math.PI/180))*180/Math.PI;pts.push([sl+b,Math.max(-85,Math.min(85,lat))]);}
  const ring=[...pts,pts[0]];const pole:number[][]=[];const ns=sl<0?1:-1;for(let i=0;i<=120;i++)pole.push([sl+(i/120)*360-180,ns*85]);
  return [ring,pole];
}

function WebGlobe({ locations, onLocationPress, animateRoute }: Props) {
  const cRef=useRef<HTMLDivElement>(null);const mRef=useRef<any>(null);
  const [status,setStatus]=useState<"loading"|"ready"|"error">("loading");
  const [err,setErr]=useState("");

  useEffect(()=>{
    let cancelled=false;const ct=cRef.current;if(!ct)return;
    (async()=>{
      try{
        injectCSS(ML_CSS);await injectScript(ML_JS);if(cancelled)return;
        const ml=(window as any).maplibregl;if(!ml)throw new Error("MapLibre load fail");

        const src:any={};const lyr:any[]=[];
        // ESRI satellite
        src.esri={type:"raster",tiles:["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],tileSize:256,maxzoom:19};
        lyr.push({id:"esri",type:"raster",source:"esri"});
        // Tianditu labels
        if(TK&&TK.length>10){src.tl={type:"raster",tiles:[`https://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${TK}`,`https://t1.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${TK}`],tileSize:256,maxzoom:18};lyr.push({id:"tl",type:"raster",source:"tl"});}
        // Terminator
        src.term={type:"geojson",data:{type:"Feature",geometry:{type:"Polygon",coordinates:computeTerminator()}}};
        lyr.push({id:"night",type:"fill",source:"term",paint:{"fill-color":"#000010","fill-opacity":0.38}});

        const map=new ml.Map({container:ct,style:{version:8,sources:src,layers:lyr},center:[104.07,35.5],zoom:1.8,minZoom:1,maxZoom:18,projection:{name:"globe"},pitch:25,bearing:0,attributionControl:false});
        mRef.current=map;

        map.on("style.load",()=>{
          console.log("[globe] v4.7.0 loaded, projection:",map.getProjection?.());
          map.setFog({color:"rgba(10,10,15,1)","high-color":"rgba(30,40,60,1)","horizon-blend":0.1,"space-color":"rgba(0,0,0,1)","star-intensity":0.8});
          // City labels
          CITIES.forEach(c=>{const el=document.createElement("div");el.innerHTML=`<div style="font-size:9px;color:#fff;font-weight:500;text-shadow:0 1px 3px rgba(0,0,0,0.8);white-space:nowrap;opacity:0.7">${c.n}</div>`;new ml.Marker({element:el,anchor:"center"}).setLngLat([c.lng,c.lat]).addTo(map);});
          // User markers
          locations.forEach(loc=>{if(!loc.lat||!loc.lng||isNaN(loc.lat)||isNaN(loc.lng))return;const el=document.createElement("div");el.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer"><div style="width:10px;height:10px;border-radius:50%;background:#FF6A2F;border:2px solid white;box-shadow:0 0 8px rgba(255,106,47,0.6)"></div><div style="background:rgba(18,18,20,0.85);border-radius:8px;padding:2px 6px;margin-top:2px"><span style="color:#fff;font-size:9px;font-weight:600">${loc.name}</span></div></div>`;new ml.Marker({element:el,anchor:"bottom"}).setLngLat([loc.lng,loc.lat]).addTo(map);el.onclick=()=>onLocationPress?.(loc);});
          setStatus("ready");
        });

        // Terminator refresh
        const ti=setInterval(()=>{if(cancelled)return;try{const s=map.getSource("term");if(s)s.setData({type:"Feature",geometry:{type:"Polygon",coordinates:computeTerminator()}});}catch{}},6e4);
        return ()=>{clearInterval(ti);};
      }catch(e:any){if(!cancelled){setErr(e.message);setStatus("error");}}
    })();
    return ()=>{cancelled=true;mRef.current?.remove();mRef.current=null;};
  },[]);

  // Route animation
  useEffect(()=>{
    if(!animateRoute||!mRef.current||locations.length<2)return;
    const map=mRef.current;const ml=(window as any).maplibregl;if(!ml)return;
    const valid=locations.filter((l:any)=>l.lat&&l.lng&&!isNaN(l.lat)&&!isNaN(l.lng));if(valid.length<2)return;
    let cancelled=false;const cbs:(()=>void)[]=[];
    const coords=valid.map((l:any)=>[l.lng,l.lat]);
    const arc=(s:number[],e:number[],n:number)=>{const p:number[][]=[];for(let i=0;i<=n;i++){const f=i/n,la1=s[1]*Math.PI/180,lo1=s[0]*Math.PI/180,la2=e[1]*Math.PI/180,lo2=e[0]*Math.PI/180;const d=2*Math.asin(Math.sqrt(Math.pow(Math.sin((la2-la1)/2),2)+Math.cos(la1)*Math.cos(la2)*Math.pow(Math.sin((lo2-lo1)/2),2)));const A=Math.sin((1-f)*d)/Math.sin(d),B=Math.sin(f*d)/Math.sin(d),x=A*Math.cos(la1)*Math.cos(lo1)+B*Math.cos(la2)*Math.cos(lo2),y=A*Math.cos(la1)*Math.sin(lo1)+B*Math.cos(la2)*Math.sin(lo2),z=A*Math.sin(la1)+B*Math.sin(la2);p.push([Math.atan2(y,x)*180/Math.PI,Math.atan2(z,Math.sqrt(x*x+y*y))*180/Math.PI]);}return p;};
    const a=arc([coords[0][0],coords[0][1]],[coords[coords.length-1][0],coords[coords.length-1][1]],80);
    const rid="ar-"+Date.now();map.addSource(rid,{type:"geojson",data:{type:"Feature",geometry:{type:"LineString",coordinates:a}}});map.addLayer({id:rid+"-g",type:"line",source:rid,paint:{"line-color":"#FF6A2F","line-width":2,"line-opacity":0.85}});
    cbs.push(()=>{try{map.removeLayer(rid+"-g");map.removeSource(rid);}catch{}});
    return ()=>{cbs.forEach(f=>f());};
  },[animateRoute,locations.length]);

  return (
    <div ref={cRef} style={{width:"100%",height:"100%",backgroundColor:"#000000"}}>
      {status==="loading"&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"#000000",zIndex:1}}><div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>🌍</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:14}}>加载中...</div></div></div>}
      {status==="error"&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"#000000",zIndex:1}}><div style={{textAlign:"center",padding:20}}><div style={{fontSize:48,marginBottom:12}}>🗺️</div><div style={{color:"rgba(255,255,255,0.6)",fontSize:15,fontWeight:600}}>加载失败</div><div style={{color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:8,maxWidth:260,fontFamily:"monospace"}}>{err}</div></div></div>}
    </div>
  );
}

function NativePlaceholder(){return<View style={{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#000"}}><Text style={{fontSize:64,marginBottom:16}}>🌍</Text><Text style={{fontSize:18,fontWeight:"700",color:"#FFF"}}>3D Globe</Text><Text style={{fontSize:14,color:"rgba(255,255,255,0.4)",marginTop:8}}>npx expo prebuild</Text></View>;}

// Floating map controls
function MapControls({mapRef}:{mapRef:any}){
  const zoomIn=()=>{if(mapRef.current)mapRef.current.zoomIn({duration:300});};
  const zoomOut=()=>{if(mapRef.current)mapRef.current.zoomOut({duration:300});};
  const reset=()=>{if(mapRef.current)mapRef.current.flyTo({center:[104.07,35.5],zoom:1.5,pitch:25,bearing:0,duration:1500});};
  return <View style={{position:"absolute",right:16,top:"50%",marginTop:-70,gap:8}} pointerEvents="box-none">
    {[{icon:Plus,fn:zoomIn},{icon:Minus,fn:zoomOut},{icon:Crosshair,fn:reset}].map((b,i)=>(
      <Pressable key={i} onPress={b.fn} style={{width:36,height:36,borderRadius:18,backgroundColor:"rgba(18,18,20,0.7)",backdropFilter:"blur(10px)",borderWidth:0.5,borderColor:"rgba(255,255,255,0.1)",alignItems:"center",justifyContent:"center"}}>
        <b.icon size={16} color="#fff"/>
      </Pressable>
    ))}
  </View>;
}

export function TripMapView(props: Props){
  return <View style={{flex:1,backgroundColor:"#000"}}>
    <View style={{flex:1}}>{Platform.OS==="web"?<WebGlobe {...props}/>:<NativePlaceholder/>}</View>
  </View>;
}
