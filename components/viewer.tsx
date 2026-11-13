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

interface ViewerProps extends MapGeneratorProps {
  onDownloadReady?: (download: () => void) => void;
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

const isMapData = (value: unknown): boolean => {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as MapData).elements)
  );
};

const boundingBox = (
  route: RouteData,
  zoom: number,
  shiftLat: number,
  shiftLon: number,
): BoundingBox => {
  let minlon = Infinity;
  let maxlon = -Infinity;

  let minlat = Infinity;
  let maxlat = -Infinity;

  for (let i = 0; i < route.coordinates.length; i++) {
    const [lon, lat] = route.coordinates[i];

    minlon = Math.min(minlon, lon + shiftLon);
    minlat = Math.min(minlat, lat + shiftLat);
    maxlon = Math.max(maxlon, lon + shiftLon);
    maxlat = Math.max(maxlat, lat + shiftLat);
  }

  if (!route.coordinates.length) {
    return { minlon: 0, minlat: 0, maxlon: 0, maxlat: 0 };
  }

  const centerLon = (minlon + maxlon) / 2;
  const centerLat = (minlat + maxlat) / 2; // center of bounding box
  const zoomLevel = Math.max(-20, Number.isFinite(zoom) ? zoom : 1);
  const boundsScale = 1 / 2 ** (zoomLevel - 1);

  return {
    minlon: boundsScale * (minlon - centerLon) + centerLon,
    minlat: boundsScale * (minlat - centerLat) + centerLat,
    maxlon: boundsScale * (maxlon - centerLon) + centerLon,
    maxlat: boundsScale * (maxlat - centerLat) + centerLat,
  };
};

const renderCanvas = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  map: MapGeneratorProps,
  mapBounds: BoundingBox,
  mapData: MapData | null,
  resolutionScale = 1,
): void => {
  const canvas = canvasRef.current;
  if (!canvas || !map.routeData.coordinates.length) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = window.devicePixelRatio * resolutionScale;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = map.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  const bboxWidth = mapBounds.maxlon - mapBounds.minlon || 1;
  const bboxHeight = mapBounds.maxlat - mapBounds.minlat || 1;
  const scale = Math.min(width / bboxWidth, height / bboxHeight) * 0.9; // conversion factor, geographic to pixels
  const centerLon = (mapBounds.minlon + mapBounds.maxlon) / 2;
  const centerLat = (mapBounds.minlat + mapBounds.maxlat) / 2;

  /*
  lon - centerLon, find how far away the coord is from the center
  scale * (...), convert from geographic to pixels, gives how many pixels away from the center
  + width / 2, calculates the center, perform offset from the center
  */

  const toCanvas = ([lon, lat]: Coordinate) => ({
    x: scale * (lon - centerLon) + width / 2, // scale relative to the center
    y: scale * (centerLat - lat) + height / 2,
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

const downloadImage = (
  map: MapGeneratorProps,
  mapBounds: BoundingBox,
  mapData: MapData | null,
): void => {
  const canvas = document.getElementsByTagName(
    "canvas",
  )[0] as HTMLCanvasElement;

  if (!canvas) return;

  const originalCanvas = canvas;
  if (!originalCanvas) return;

  const scale = 4;

  const exportCanvas = document.createElement("canvas");

  const exportCanvasRef: RefObject<HTMLCanvasElement | null> = {
    current: exportCanvas,
  };

  exportCanvas.style.width = `${originalCanvas.clientWidth}px`;
  exportCanvas.style.height = `${originalCanvas.clientHeight}px`;

  Object.assign(exportCanvas.style, {
    position: "absolute",
    visibility: "hidden",
  });

  document.body.appendChild(exportCanvas);

  renderCanvas(exportCanvasRef, map, mapBounds, mapData, scale);

  const link = document.createElement("a");
  link.download = "map.png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();

  exportCanvas.remove();
};

export default function Viewer({ onDownloadReady, ...map }: ViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapCache = useRef(new Map<string, MapData>());
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | unknown>(null);

  const mapBounds = boundingBox(map.routeData, map.zoom, map.lat, map.lon);

  useEffect(() => {
    if (!map.routeData.coordinates.length) return;

    const controller = new AbortController();
    const cacheKey = [
      mapBounds.minlon,
      mapBounds.minlat,
      mapBounds.maxlon,
      mapBounds.maxlat,
    ].join(":");
    const cachedData = mapCache.current.get(cacheKey);

    if (cachedData) {
      setMapData(cachedData);
      setIsLoading(false);
      return () => controller.abort();
    }

    setMapData(null);
    setIsLoading(true);
    const requestTimer = window.setTimeout(() => {
      axios
        .post("/api/map-data", mapBounds, {
          signal: controller.signal,
        })
        .then((response) => {
          if (!isMapData(response.data)) {
            throw new Error("Overpass returned an invalid map response.");
          }

          mapCache.current.set(cacheKey, response.data);
          setMapData(response.data);
          setIsLoading(false);
        })
        .catch((error: unknown) => {
          if (!axios.isCancel(error)) {
            console.error("Unable to load map data:", error);
            setError(error);
            setIsLoading(false);
          }
        });
    }, 300);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [
    map.lat,
    map.lon,
    map.zoom,
    mapBounds.minlon,
    mapBounds.minlat,
    mapBounds.maxlon,
    mapBounds.maxlat,
  ]);

  useEffect(() => {
    renderCanvas(canvasRef, map, mapBounds, mapData);
    console.log("RENDER");
    console.log(mapBounds);
    const handleResize = () => renderCanvas(canvasRef, map, mapBounds, mapData);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    mapData,
    map.lat,
    map.lon,
    map.zoom,
    map.routeData,
    map.lineColor,
    map.buildingColor,
    map.buildingOutlineColor,
    map.roadColor,
    map.backgroundColor,
  ]);

  useEffect(() => {
    if (!mapData) return;
    /*

    const handleDownloadReady = useCallback((download: () => void) => {
        setDownloadMap(() => download);
      }, []);

    */
    // store a function
    onDownloadReady?.(() => {
      downloadImage(map, mapBounds, mapData);
    });
  }, [
    onDownloadReady,
    mapData,
    map.routeData,
    map.lat,
    map.lon,
    map.zoom,
    map.lineColor,
    map.buildingColor,
    map.buildingOutlineColor,
    map.roadColor,
    map.backgroundColor,
  ]);

  return (
    <>
      {/* <div className="flex justify-center p-5">
        <button
          onClick={() => downloadImage(map, mapBounds, mapData)}
          className="flex w-1/2 items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-5 py-3.5 text-sm font-bold text-white transition hover:border-gray-500 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#e2764c] focus:ring-offset-2 focus:ring-offset-gray-950"
        >
          Download Map
        </button>
      </div> */}

      <canvas ref={canvasRef} className="block h-full w-full" />

      {isLoading && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 text-white">
          Loading map data...
        </div>
      )}

      {error instanceof Error && (
        <div
          className="absolute inset-0 grid place-items-center bg-black/70 text-white"
          role="alert"
          aria-live="assertive"
        >
          {error.message}
        </div>
      )}
    </>
  );
}
