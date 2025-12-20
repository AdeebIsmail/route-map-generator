import MapGenerator from "./components/mapGenerator";
import "./App.css";
import { useState } from "react";

function App() {
  const [fileContent, setFileContent] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [zoom, setZoom] = useState("");

  const handleFormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file || !file.name) {
      console.log("No file selected");
      return;
    }
    setLat(formData.get("lat") as string);
    setLon(formData.get("lon") as string);
    setZoom(formData.get("zoom") as string);

    console.log("File selected:", file);
    const JSONData = new FileReader();
    JSONData.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result;
      if (content) {
        setFileContent(content as string);
      }
    };
    JSONData.readAsText(file);
  };
  return (
    <div className="min-h-screen bg-black">
      <div className="fixed top-0 left-0 right-0 z-10 bg-black p-6">
        <form
          onSubmit={handleFormSubmission}
          className="flex items-center gap-4"
        >
          <input
            type="file"
            name="file"
            className="text-white file:mr-4 file:py-2 file:px-6 file:rounded file:border-0 file:bg-blue-500 file:text-white file:font-semibold hover:file:bg-blue-600 file:cursor-pointer"
          />
          <label className="px-4 py-2 text-white">Latitude </label>
          <input
            type="text"
            name="lat"
            placeholder="Latitude"
            defaultValue="29.716816"
            className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <label className="px-4 py-2 text-white">Longitude </label>

          <input
            type="text"
            name="lon"
            placeholder="Longitude"
            defaultValue="-95.844305"
            className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <label className="px-4 py-2 text-white">Zoom </label>

          <input
            type="text"
            name="zoom"
            placeholder="Zoom"
            defaultValue="0.04"
            className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
      {fileContent && (
        <MapGenerator
          geoData={JSON.parse(fileContent)}
          lat={parseFloat(lat)}
          lon={parseFloat(lon)}
          zoom={parseFloat(zoom)}
        />
      )}
    </div>
  );
}

export default App;
