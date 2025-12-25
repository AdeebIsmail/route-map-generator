import MapGenerator from "./components/mapGenerator";
import "./App.css";
import { useState } from "react";
import { gpx } from "@tmcw/togeojson";

function App() {
  const [fileContent, setFileContent] = useState("");
  const [lat, setLat] = useState(29.716816);
  const [lon, setLon] = useState(-95.844305);
  const [zoom, setZoom] = useState(0.04);
  const [lineColor, setLineColor] = useState("#e98f09ff");
  const [buildingColor, setBuildingColor] = useState("#444444");
  const [buildingOutlineColor, setBuildingOutlineColor] = useState("#666666");
  const [roadColor, setRoadColor] = useState("#666666");
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a");

  const handleFormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file || !file.name) {
      console.log("No file selected");
      return;
    }
    setLat(parseFloat(formData.get("lat") as string));
    setLon(parseFloat(formData.get("lon") as string));
    setZoom(parseFloat(formData.get("zoom") as string));
    setLineColor(formData.get("lineColor") as string);
    setBuildingColor(formData.get("buildingColor") as string);
    setBuildingOutlineColor(formData.get("buildingOutlineColor") as string);
    setRoadColor(formData.get("roadColor") as string);
    setBackgroundColor(formData.get("backgroundColor") as string);

    console.log("File selected:", file);
    const JSONData = new FileReader();
    console.log(file.name);
    JSONData.onload = (e: ProgressEvent<FileReader>) => {
      if (file.type == "application/gpx+xml") {
        const text = e.target?.result as string;
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");
        const geojson = gpx(xml);
        if (geojson) {
          setFileContent(JSON.stringify(geojson));
        }
      } else {
        const content = e.target?.result;
        if (content) {
          setFileContent(content as string);
        }
      }
    };
    JSONData.readAsText(file);
  };

  const increaseLon = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLon(lon + 0.01);
  };

  const decreaseLon = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLon(lon - 0.01);
  };
  const increaseLat = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLat(lat + 0.01);
  };

  const decreaseLat = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLat(lat - 0.01);
  };

  const increaseZoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setZoom(zoom - 0.01);
  };
  const decreaseZoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setZoom(zoom + 0.01);
  };
  return (
    <div className="min-h-screen bg-black">
      <div className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black via-black to-transparent p-6 space-y-4">
        <form
          onSubmit={handleFormSubmission}
          className="flex items-center gap-3 flex-wrap"
        >
          <input
            type="file"
            name="file"
            className="text-white file:py-2 file:px-6 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-semibold hover:file:bg-blue-700 file:cursor-pointer file:transition-colors"
          />

          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">
              Latitude
            </label>
            <input
              type="text"
              name="lat"
              placeholder="Latitude"
              defaultValue={lat}
              className="w-32 px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">
              Longitude
            </label>
            <input
              type="text"
              name="lon"
              placeholder="Longitude"
              defaultValue={lon}
              className="w-32 px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">Zoom</label>
            <input
              type="text"
              name="zoom"
              placeholder="Zoom"
              defaultValue={zoom}
              className="w-24 px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">
              Line Color
            </label>
            <input
              type="color"
              name="lineColor"
              defaultValue={lineColor}
              className="w-16 h-10 rounded-lg bg-gray-900 border border-gray-700 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">
              Building Fill
            </label>
            <input
              type="color"
              name="buildingColor"
              defaultValue={buildingColor}
              className="w-16 h-10 rounded-lg bg-gray-900 border border-gray-700 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">
              Building Outline
            </label>
            <input
              type="color"
              name="buildingOutlineColor"
              defaultValue={buildingOutlineColor}
              className="w-16 h-10 rounded-lg bg-gray-900 border border-gray-700 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">
              Road Color
            </label>
            <input
              type="color"
              name="roadColor"
              defaultValue={roadColor}
              className="w-16 h-10 rounded-lg bg-gray-900 border border-gray-700 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">
              Background
            </label>
            <input
              type="color"
              name="backgroundColor"
              defaultValue={backgroundColor}
              className="w-16 h-10 rounded-lg bg-gray-900 border border-gray-700 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg transition-all shadow-lg hover:shadow-blue-500/50"
          >
            Load Map
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm font-medium">
            Quick Navigation:
          </span>
          <div className="flex gap-2">
            <button
              onClick={increaseLat}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1.5 px-4 rounded-lg transition-all border border-gray-700 hover:border-gray-600"
            >
              ↑ Lat
            </button>
            <button
              onClick={decreaseLat}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1.5 px-4 rounded-lg transition-all border border-gray-700 hover:border-gray-600"
            >
              ↓ Lat
            </button>
            <button
              onClick={increaseLon}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1.5 px-4 rounded-lg transition-all border border-gray-700 hover:border-gray-600"
            >
              → Lon
            </button>
            <button
              onClick={decreaseLon}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1.5 px-4 rounded-lg transition-all border border-gray-700 hover:border-gray-600"
            >
              ← Lon
            </button>
            <button
              onClick={decreaseZoom}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1.5 px-4 rounded-lg transition-all border border-gray-700 hover:border-gray-600"
            >
              Decrease Zoom
            </button>
            <button
              onClick={increaseZoom}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1.5 px-4 rounded-lg transition-all border border-gray-700 hover:border-gray-600"
            >
              Increase Zoom
            </button>
          </div>
        </div>
      </div>
      {fileContent && (
        <MapGenerator
          geoData={JSON.parse(fileContent)}
          lat={lat}
          lon={lon}
          zoom={zoom}
          lineColor={lineColor}
          buildingColor={buildingColor}
          buildingOutlineColor={buildingOutlineColor}
          roadColor={roadColor}
          backgroundColor={backgroundColor}
        />
      )}
    </div>
  );
}

export default App;
