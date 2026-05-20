const TIANDITU_TOKEN = "b3a9e6486cea01c01b6dc7650d5ee03a";

// Tianditu WMTS tile URL
export function getTiandituTileUrl(
  layer: "vec" | "img" | "cva" = "vec"
): string {
  const subdomains = ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];
  const sub = subdomains[Math.floor(Math.random() * subdomains.length)];
  const base = `https://${sub}.tianditu.gov.cn`;

  if (layer === "cva") {
    // Chinese annotation overlay
    return `${base}/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_TOKEN}`;
  }
  if (layer === "img") {
    return `${base}/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_TOKEN}`;
  }
  // Default: vector base map
  return `${base}/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_TOKEN}`;
}

// Static map image URL (for simple previews)
export function getStaticMapUrl(
  lng: number,
  lat: number,
  zoom: number = 12,
  width: number = 600,
  height: number = 400
): string {
  const center = `${lng},${lat}`;
  return `https://api.tianditu.gov.cn/static?center=${center}&zoom=${zoom}&size=${width},${height}&markers=${center}&tk=${TIANDITU_TOKEN}`;
}
