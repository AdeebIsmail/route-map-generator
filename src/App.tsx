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
          console.log(geojson);
          const geometry = geojson.features[0].geometry;

          if (geometry.type === "LineString") {
            const coords = geometry.coordinates;
            let minLat = Infinity;
            let maxLat = -Infinity;
            let minLon = Infinity;
            let maxLon = -Infinity;

            coords.forEach((cord: number[]) => {
              const lon = cord[0];
              const lat = cord[1];

              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
              minLon = Math.min(minLon, lon);
              maxLon = Math.max(maxLon, lon);
            });

            const center = [(minLon + maxLon) / 2, (minLat + maxLat) / 2];

            setLon(center[0]);
            setLat(center[1]);

            console.log(center);
          }
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

  const changeLat = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLat(parseFloat(e.target.value));
  };
  const changeLon = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLon(parseFloat(e.target.value));
  };

  const changeZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
  };

  return (
    <div className="min-h-screen ">
      <div className="grid grid-flow-col grid-rows-2 grid-cols-8">
        <div className="row-start-1 col-span-1 min-w-0 overflow-hidden">
          <div className=" backdrop-blur-md bg-black/90 border-b border-gray-800 shadow-2xl h-screen overflow-y-auto overflow-x-hidden">
            <h1 className="text-[clamp(0.6rem,1.5vw,1.5rem)] font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-center">
              🗺️ Route Viewer
            </h1>
            <div className="flex flex-wrap items-center gap-1 text-[clamp(0.5rem,1vw,0.75rem)] text-gray-400 justify-center mb-6">
              <span className="px-1 py-0.5 rounded truncate">
                Lat: {lat.toFixed(6)}
              </span>
              <span className="px-1 py-0.5 rounded truncate">
                Lon: {lon.toFixed(6)}
              </span>
              <span className="px-1 py-0.5 rounded truncate">
                Zoom: {zoom.toFixed(3)}
              </span>
            </div>

            <form
              onSubmit={handleFormSubmission}
              className="flex flex-col gap-3 px-2 "
            >
              <div className="mb-6">
                <label className="block text-[clamp(0.55rem,1.2vw,0.875rem)] font-semibold text-gray-300 mb-2">
                  📁 Upload Route File
                </label>
                <input
                  type="file"
                  name="file"
                  className="w-full text-white text-[clamp(0.5rem,1vw,0.75rem)] file:h-7 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-blue-700 file:text-[clamp(0.5rem,1vw,0.875rem)] file:font-semibold hover:file:from-blue-700 hover:file:to-blue-800 file:cursor-pointer file:transition-all"
                />
              </div>

              <div className="">
                <label className="block text-[clamp(0.55rem,1.2vw,0.875rem)] font-semibold text-gray-300 mb-3">
                  🎯 Map Position
                </label>
                <div className="grid grid-cols-1 grid-rows-3 md:grid-cols-3 gap-3">
                  <div className="col-span-full">
                    <label className="block text-[clamp(0.5rem,1vw,0.75rem)] text-gray-400 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="lat"
                      value={lat}
                      onChange={changeLat}
                      placeholder="Latitude"
                      className="w-full px-2 py-1 rounded-lg bg-gray-800 text-[clamp(0.5rem,1.2vw,1rem)] text-white border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-[clamp(0.5rem,1vw,0.75rem)] text-gray-400 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="lon"
                      placeholder="Longitude"
                      value={lon}
                      onChange={changeLon}
                      className="w-full px-2 py-1 rounded-lg bg-gray-800 text-[clamp(0.5rem,1.2vw,1rem)] text-white border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-[clamp(0.5rem,1vw,0.75rem)] text-gray-400 mb-1">
                      Zoom
                    </label>
                    <input
                      type="text"
                      name="zoom"
                      placeholder="Zoom"
                      value={zoom}
                      onChange={changeZoom}
                      className="w-full px-2 py-1 rounded-lg bg-gray-800 text-[clamp(0.5rem,1.2vw,1rem)] text-white border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="">
                <label className="block text-[clamp(0.55rem,1.2vw,0.875rem)] font-semibold text-gray-300 mb-3">
                  🧭 Quick Navigation
                </label>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={increaseLat}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1 px-2 rounded-lg transition-all border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 text-[clamp(0.5rem,1.2vw,0.875rem)]"
                  >
                    ⬆️ North
                  </button>
                  <button
                    onClick={decreaseLat}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1 px-2 rounded-lg transition-all border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 text-[clamp(0.5rem,1.2vw,0.875rem)]"
                  >
                    ⬇️ South
                  </button>
                  <button
                    onClick={increaseLon}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1 px-2 rounded-lg transition-all border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 text-[clamp(0.5rem,1.2vw,0.875rem)]"
                  >
                    ➡️ East
                  </button>
                  <button
                    onClick={decreaseLon}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1 px-2 rounded-lg transition-all border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 text-[clamp(0.5rem,1.2vw,0.875rem)]"
                  >
                    ⬅️ West
                  </button>
                  <div className="w-full md:w-auto h-px md:h-auto md:w-px bg-gray-700"></div>
                  <button
                    onClick={increaseZoom}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1 px-2 rounded-lg transition-all border border-gray-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 text-[clamp(0.5rem,1.2vw,0.875rem)]"
                  >
                    🔍 Zoom In
                  </button>
                  <button
                    onClick={decreaseZoom}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1 px-2 rounded-lg transition-all border border-gray-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 text-[clamp(0.5rem,1.2vw,0.875rem)]"
                  >
                    🔎 Zoom Out
                  </button>
                </div>
              </div>
              <div className="">
                <label className="block text-[clamp(0.55rem,1.2vw,0.875rem)] font-semibold text-gray-300 mb-3">
                  🎨 Color Scheme
                </label>
                <div className="grid grid-flow-col grid-rows-5 grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="col-span-full">
                    <label className="block text-[clamp(0.5rem,1vw,0.75rem)] text-gray-400 ">
                      Route Line
                    </label>
                    <input
                      type="color"
                      name="lineColor"
                      defaultValue={lineColor}
                      className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="col-span-full  ">
                    <label className="block text-[clamp(0.5rem,1vw,0.75rem)] text-gray-400 ">
                      Buildings
                    </label>
                    <input
                      type="color"
                      name="buildingColor"
                      defaultValue={buildingColor}
                      className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-[clamp(0.5rem,1vw,0.75rem)] text-gray-400 ">
                      Outlines
                    </label>
                    <input
                      type="color"
                      name="buildingOutlineColor"
                      defaultValue={buildingOutlineColor}
                      className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-[clamp(0.5rem,1vw,0.75rem)] text-gray-400 ">
                      Roads
                    </label>
                    <input
                      type="color"
                      name="roadColor"
                      defaultValue={roadColor}
                      className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-[clamp(0.5rem,1vw,0.75rem)] text-gray-400 ">
                      Background
                    </label>
                    <input
                      type="color"
                      name="backgroundColor"
                      defaultValue={backgroundColor}
                      className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] text-[clamp(0.55rem,1.2vw,1rem)]"
              >
                🚀 Load Map
              </button>
            </form>
          </div>
          {/* </div> */}
        </div>
        <div className="row-start-1  col-span-7  bg-black">
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
      </div>
    </div>
  );
}

export default App;
