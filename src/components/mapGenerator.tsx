import { useEffect, useRef, useState } from "react";
import "../App.css";

interface MapGeneratorProps {
  geoData: any;
  lat: number;
  lon: number;
  zoom: number;
}

function MapGenerator({
  geoData: externalGeoData,
  lat: externalLat,
  lon: externalLot,
  zoom: externalZoom,
}: MapGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [osmData, setOsmData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geoData, setGeoData] = useState<any>(externalGeoData);

  useEffect(() => {
    setGeoData(externalGeoData);
  }, [externalGeoData]);

  const aspect = window.innerWidth / window.innerHeight;
  const latSpan = externalZoom;
  const centerLat = externalLat;
  const centerLon = externalLot;
  const lonSpan = (latSpan * aspect) / Math.cos((centerLat * Math.PI) / 180);
  console.log(externalLat);
  console.log(externalLot);
  const mapBounds = {
    minLat: centerLat - latSpan / 2,
    maxLat: centerLat + latSpan / 2,
    minLon: centerLon - lonSpan / 2,
    maxLon: centerLon + lonSpan / 2,
  };

  const latLonToCanvas = (
    lat: number,
    lon: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const bboxWidth = mapBounds.maxLon - mapBounds.minLon;
    const bboxHeight = mapBounds.maxLat - mapBounds.minLat;

    const scale = Math.min(canvasWidth / bboxWidth, canvasHeight / bboxHeight);
    const offsetX = (canvasWidth - bboxWidth * scale) / 2;
    const offsetY = (canvasHeight - bboxHeight * scale) / 2;
    const x = (lon - mapBounds.minLon) * scale + offsetX;
    const y = (mapBounds.maxLat - lat) * scale + offsetY;
    return { x, y };
  };

  useEffect(() => {
    var query = `
    [out:json][timeout:180];

      (
        way["building"](${mapBounds.minLat},${mapBounds.minLon},${mapBounds.maxLat},${mapBounds.maxLon});

        way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|unclassified|service|footway|path|pedestrian|cycleway"](
          ${mapBounds.minLat},${mapBounds.minLon},${mapBounds.maxLat},${mapBounds.maxLon}
        );
      );

      // Return geometry for mapping
      out geom;

  `;
    async function getOSMData() {
      try {
        setIsLoading(true);
        var result = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: "data=" + encodeURIComponent(query),
        }).then((data) => data.json());

        setOsmData(result);
      } catch (error) {
        console.error("Error fetching OSM data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getOSMData();
  }, [
    mapBounds.minLat,
    mapBounds.minLon,
    mapBounds.maxLat,
    mapBounds.maxLon,
    externalZoom,
  ]);

  useEffect(() => {
    if (!osmData || isLoading) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio;

      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (ctx) {
        ctx.scale(dpr, dpr);

        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < osmData.elements.length; i++) {
          const element = osmData.elements[i];

          if (element.tags?.building && element.geometry) {
            ctx.beginPath();
            ctx.fillStyle = "#444444";
            ctx.strokeStyle = "#666666";
            ctx.lineWidth = 0.5;

            for (let j = 0; j < element.geometry.length; j++) {
              let lat = element.geometry[j].lat;
              let lon = element.geometry[j].lon;

              let norm_cords = latLonToCanvas(
                lat,
                lon,
                window.innerWidth,
                window.innerHeight
              );

              if (j === 0) {
                ctx.moveTo(norm_cords.x, norm_cords.y);
              } else {
                ctx.lineTo(norm_cords.x, norm_cords.y);
              }
            }

            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (element.tags?.highway && element.geometry) {
            ctx.beginPath();
            ctx.strokeStyle = "#666666"; // Bright yellow roads
            ctx.lineWidth = 0.5;

            for (let j = 0; j < element.geometry.length; j++) {
              let lat = element.geometry[j].lat;
              let lon = element.geometry[j].lon;

              let norm_cords = latLonToCanvas(
                lat,
                lon,
                window.innerWidth,
                window.innerHeight
              );

              if (j === 0) {
                ctx.moveTo(norm_cords.x, norm_cords.y);
              } else {
                ctx.lineTo(norm_cords.x, norm_cords.y);
              }
            }

            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#e98f09ff";
        ctx.strokeStyle = "#e98f09ff";
        ctx.lineWidth = 2;
        for (
          let i = 0;
          i < geoData.features[0].geometry.coordinates.length;
          i++
        ) {
          let lat = geoData.features[0].geometry.coordinates[i][1];
          let lon = geoData.features[0].geometry.coordinates[i][0];

          let norm_cords = latLonToCanvas(
            lat,
            lon,
            window.innerWidth,
            window.innerHeight
          );
          if (i === 0) {
            ctx.moveTo(norm_cords.x, norm_cords.y);
          } else {
            ctx.lineTo(norm_cords.x, norm_cords.y);
          }
        }
        ctx.stroke();
      }
    }
  }, [osmData, geoData, isLoading]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && osmData && !isLoading) {
        const dpr = window.devicePixelRatio;

        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (ctx) {
          ctx.scale(dpr, dpr);

          ctx.imageSmoothingEnabled = false;

          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(0, 0, width, height);

          for (let i = 0; i < osmData.elements.length; i++) {
            const element = osmData.elements[i];

            if (element.tags?.building && element.geometry) {
              ctx.beginPath();
              ctx.fillStyle = "#444444";
              ctx.strokeStyle = "#666666";
              ctx.lineWidth = 0.5;

              for (let j = 0; j < element.geometry.length; j++) {
                let lat = element.geometry[j].lat;
                let lon = element.geometry[j].lon;

                let norm_cords = latLonToCanvas(
                  lat,
                  lon,
                  window.innerWidth,
                  window.innerHeight
                );

                if (j === 0) {
                  ctx.moveTo(norm_cords.x, norm_cords.y);
                } else {
                  ctx.lineTo(norm_cords.x, norm_cords.y);
                }
              }

              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            } else if (element.tags?.highway && element.geometry) {
              ctx.beginPath();
              ctx.strokeStyle = "#666666"; // Bright yellow roads
              ctx.lineWidth = 0.5;

              for (let j = 0; j < element.geometry.length; j++) {
                let lat = element.geometry[j].lat;
                let lon = element.geometry[j].lon;

                let norm_cords = latLonToCanvas(
                  lat,
                  lon,
                  window.innerWidth,
                  window.innerHeight
                );

                if (j === 0) {
                  ctx.moveTo(norm_cords.x, norm_cords.y);
                } else {
                  ctx.lineTo(norm_cords.x, norm_cords.y);
                }
              }

              ctx.stroke();
            }
          }
          ctx.beginPath();
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#e98f09ff";
          ctx.strokeStyle = "#e98f09ff";
          ctx.lineWidth = 2;
          for (
            let i = 0;
            i < geoData.features[0].geometry.coordinates.length;
            i++
          ) {
            let lat = geoData.features[0].geometry.coordinates[i][1];
            let lon = geoData.features[0].geometry.coordinates[i][0];

            let norm_cords = latLonToCanvas(
              lat,
              lon,
              window.innerWidth,
              window.innerHeight
            );
            if (i === 0) {
              ctx.moveTo(norm_cords.x, norm_cords.y);
            } else {
              ctx.lineTo(norm_cords.x, norm_cords.y);
            }
          }
          ctx.stroke();
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [osmData, geoData, isLoading]);

  // useEffect(() => {
  //   fetch("/src/routes/route2.geojson")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setGeoData(data);
  //     });
  // }, []);

  return (
    <>
      {isLoading && (
        <div className="fixed top-20 left-4 bg-blue-500 text-white px-4 py-2 rounded shadow z-20">
          Loading map data...
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-screen m-0 p-0"
      ></canvas>
    </>
  );
}

export default MapGenerator;
