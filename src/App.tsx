import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mapBounds = {
    minLat: 29.7056,
    maxLat: 29.7342,
    minLon: -95.8333,
    maxLon: -95.8137,
  };

  const latLonToCanvas = (
    lat: number,
    lon: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const x =
      ((lon - mapBounds.minLon) / (mapBounds.maxLon - mapBounds.minLon)) *
      canvasWidth;
    const y =
      ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) *
      canvasHeight;
    return { x, y };
  };

  useEffect(() => {
    var query = `
    [out:json][timeout:180];

(
  way["building"](29.7056,-95.8333,29.7342,-95.8137);

  way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|unclassified|service|footway|path|pedestrian|cycleway"](
    29.7056,-95.8333,29.7342,-95.8137
  );
);

// Return geometry for mapping
out geom;

  `;
    async function getOSMData() {
      var result = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: "data=" + encodeURIComponent(query),
      }).then((data) => data.json());

      console.log(JSON.stringify(result, null, 2));
    }

    // You need to restrict it at some point
    // This is just dummy code and should be replaced by actual
    //getOSMData();
  }, []);

  useEffect(() => {
    // Resize canvas to fill the window
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Example: Draw a line from one corner of your map bounds to the other
        const topLeft = latLonToCanvas(
          mapBounds.maxLat,
          mapBounds.minLon,
          canvas.width,
          canvas.height
        );
        const bottomRight = latLonToCanvas(
          mapBounds.minLat,
          mapBounds.maxLon,
          canvas.width,
          canvas.height
        );

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(topLeft.x, topLeft.y);
        ctx.lineTo(bottomRight.x, bottomRight.y);
        ctx.stroke();

        // Draw a rectangle showing the map bounds
        ctx.strokeStyle = "blue";
        ctx.strokeRect(
          topLeft.x,
          topLeft.y,
          bottomRight.x - topLeft.x,
          bottomRight.y - topLeft.y
        );
      }
    }

    // Handle window resize
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Redraw after resize
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const topLeft = latLonToCanvas(
            mapBounds.maxLat,
            mapBounds.minLon,
            canvas.width,
            canvas.height
          );
          const bottomRight = latLonToCanvas(
            mapBounds.minLat,
            mapBounds.maxLon,
            canvas.width,
            canvas.height
          );

          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(topLeft.x, topLeft.y);
          ctx.lineTo(bottomRight.x, bottomRight.y);
          ctx.stroke();

          ctx.strokeStyle = "blue";
          ctx.strokeRect(
            topLeft.x,
            topLeft.y,
            bottomRight.x - topLeft.x,
            bottomRight.y - topLeft.y
          );
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen m-0 p-0"
    ></canvas>
  );
}

export default App;
