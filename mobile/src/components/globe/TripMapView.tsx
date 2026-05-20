import { useEffect, useRef, useState } from "react";
import { View, Text, Platform } from "react-native";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Earth texture (NASA Blue Marble — reliable CDN, no API key needed)
const EARTH_TEX = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

interface Location { lat: number; lng: number; name: string; description?: string; }
interface Props {
  locations: Location[];
  onLocationPress?: (loc: Location) => void;
  animateRoute?: boolean;
}

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lng + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function WebGlobe({ locations, onLocationPress }: Props) {
  const cRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading"|"ready"|"error">("loading");

  useEffect(() => {
    const container = cRef.current;
    if (!container) return;
    let cancelled = false;
    let animId = 0;

    // --- Scene setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 220);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0x334466, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(200, 100, 200);
    scene.add(sun);

    // --- Stars ---
    const starsGeo = new THREE.BufferGeometry();
    const starsVerts: number[] = [];
    for (let i = 0; i < 1500; i++) {
      const v = new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize().multiplyScalar(130);
      starsVerts.push(v.x, v.y, v.z);
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(starsVerts), 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.4, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(starsGeo, starsMat));

    // --- Earth sphere ---
    const earthGeo = new THREE.SphereGeometry(50, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x111111, shininess: 5 });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // --- Atmosphere glow ---
    const glowGeo = new THREE.SphereGeometry(52, 64, 64);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x4488cc) }, uTime: { value: 0 } },
      vertexShader: `varying vec3 vNormal;varying vec3 vPosition;void main(){vec4 worldPos=modelMatrix*vec4(position,1.0);vNormal=normalize(mat3(modelMatrix)*normal);vPosition=worldPos.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `varying vec3 vNormal;varying vec3 vPosition;uniform vec3 uColor;uniform float uTime;void main(){float intensity=pow(0.65-dot(vNormal,vec3(0.0,0.0,1.0)),3.0);gl_FragColor=vec4(uColor,0.3)*intensity;}`,
      transparent: true, side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    // --- OrbitControls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.minDistance = 80; controls.maxDistance = 350;
    controls.autoRotate = true; controls.autoRotateSpeed = 0.3;
    controls.target.set(0, 0, 0);

    // --- Markers ---
    const markers: THREE.Mesh[] = [];
    locations.forEach(loc => {
      if (!loc.lat || !loc.lng || isNaN(loc.lat) || isNaN(loc.lng)) return;
      const pos = latLngToVec3(loc.lat, loc.lng, 50.5);
      const dotGeo = new THREE.SphereGeometry(1.0, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xff6a2f });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      dot.userData = { location: loc };
      scene.add(dot);
      markers.push(dot);
    });

    // --- Click handler (raycaster) ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(markers);
      if (hits.length > 0) {
        const loc = hits[0].object.userData.location as Location;
        onLocationPress?.(loc);
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    // --- Texture load ---
    const texLoader = new THREE.TextureLoader();
    texLoader.load(EARTH_TEX,
      (tex) => {
        if (cancelled) return;
        (earth.material as THREE.MeshPhongMaterial).map = tex;
        (earth.material as THREE.MeshPhongMaterial).needsUpdate = true;
        setStatus("ready");
      },
      undefined,
      () => { if (!cancelled) setStatus("ready"); } // fallback: show even without texture
    );

    // --- Resize handler ---
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // --- Render loop ---
    function animate() {
      if (cancelled) return;
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("click", onClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={cRef} style={{ width: "100%", height: "100%", position: "relative", backgroundColor: "#010826" }}>
      {status === "loading" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#010826", zIndex: 1 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "system-ui" }}>加载 3D 地球...</div>
          </div>
        </div>
      )}
    </div>
  );
}

function NativePlaceholder() {
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#010826" }}>
    <Text style={{ fontSize: 64, marginBottom: 16 }}>🌍</Text>
    <Text style={{ fontSize: 18, fontWeight: "700", color: "#FFF" }}>3D Globe · Three.js</Text>
  </View>;
}

export function TripMapView(props: Props) {
  return <View style={{ flex: 1, backgroundColor: "#010826" }}>
    <View style={{ flex: 1 }}>{Platform.OS === "web" ? <WebGlobe {...props} /> : <NativePlaceholder />}</View>
  </View>;
}
