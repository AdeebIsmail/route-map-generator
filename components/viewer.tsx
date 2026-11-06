import axios from "axios";
import { type RefObject, useEffect, useRef, useState } from "react";
interface MapGeneratorProps {
  routeData: RouteData;
  lat: number;
  lon: number;
  zoom: number;
  lineColor: string;
  buildingColor: string;
  buildingOutlineColor: string;
  roadColor: string;
  backgroundColor: string;
}

type Coordinate = [number, number];

type RouteData = {
  type: "FeatureCollection";
  coordinates: Coordinate[];
};

type BoundingBox = {
  minlon: number;
  minlat: number;
  maxlon: number;
  maxlat: number;
};

type MapElement = {
  tags?: {
    building?: string;
    highway?: string;
  };
  geometry?: { lat: number; lon: number }[];
};

type MapData = {
  elements?: MapElement[];
};

const boundingBox = (route: RouteData): BoundingBox => {
  let minlon = Infinity;
  let maxlon = -Infinity;

  let minlat = Infinity;
  let maxlat = -Infinity;

  for (let i = 0; i < route.coordinates.length; i++) {
    const [lon, lat] = route.coordinates[i];

    minlon = Math.min(minlon, lon);
    minlat = Math.min(minlat, lat);
    maxlon = Math.max(maxlon, lon);
    maxlat = Math.max(maxlat, lat);
  }

  return { minlon, minlat, maxlon, maxlat };
};

const renderCanvas = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  map: MapGeneratorProps,
  mapBounds: BoundingBox,
  mapData: MapData | null,
): void => {
  const canvas = canvasRef.current;
  if (!canvas || !map.routeData.coordinates.length) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = window.devicePixelRatio;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = map.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  const bboxWidth = mapBounds.maxlon - mapBounds.minlon || 1;
  const bboxHeight = mapBounds.maxlat - mapBounds.minlat || 1;
  const scale = Math.min(width / bboxWidth, height / bboxHeight) * 0.9;
  const offsetX = (width - bboxWidth * scale) / 2;
  const offsetY = (height - bboxHeight * scale) / 2;
  const toCanvas = ([lon, lat]: Coordinate) => ({
    x: (lon - mapBounds.minlon) * scale + offsetX,
    y: (mapBounds.maxlat - lat) * scale + offsetY,
  });

  for (const element of mapData?.elements ?? []) {
    if (!element.geometry?.length) continue;

    ctx.beginPath();
    ctx.strokeStyle = element.tags?.highway
      ? map.roadColor
      : map.buildingOutlineColor;
    ctx.fillStyle = map.buildingColor;
    ctx.lineWidth = 0.5;

    element.geometry.forEach((coordinate, index) => {
      const point = toCanvas([coordinate.lon, coordinate.lat]);
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });

    if (element.tags?.building) {
      ctx.closePath();
      ctx.fill();
    }
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.shadowBlur = 20;
  ctx.shadowColor = map.lineColor;
  ctx.strokeStyle = map.lineColor;
  ctx.lineWidth = 2;
  map.routeData.coordinates.forEach((coordinate, index) => {
    const point = toCanvas(coordinate);
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;
};

function Viewer(map: MapGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapBounds = boundingBox(map.routeData);

  useEffect(() => {
    if (!map.routeData.coordinates.length) return;

    const controller = new AbortController();
    setIsLoading(true);

    axios
      .post("/api/map-data", mapBounds, {
        signal: controller.signal,
      })
      .then((response) => {
        setMapData(response.data);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!axios.isCancel(error)) {
          console.error("Unable to load map data:", error);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [mapBounds.minlon, mapBounds.minlat, mapBounds.maxlon, mapBounds.maxlat]);

  useEffect(() => {
    renderCanvas(canvasRef, map, mapBounds, mapData);

    const handleResize = () => renderCanvas(canvasRef, map, mapBounds, mapData);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mapData]);

  return (
    <>
      <canvas ref={canvasRef} className="h-full w-full"></canvas>
      {isLoading && (
        <div
          className="absolute inset-0 grid place-items-center bg-[#18221d]/70 text-white"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-lg bg-[#17211b]/80 px-4 py-3 text-sm font-semibold shadow-lg">
            <span
              className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden="true"
            />
            Loading map data...
          </div>
        </div>
      )}
    </>
  );
}

export default Viewer;
