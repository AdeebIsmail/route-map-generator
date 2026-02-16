// import { useEffect, useRef, useState } from "react";
// import "./App.css";
// import { gpx } from "@tmcw/togeojson";

// function navigation() {
//   const [fileContent, setFileContent] = useState("");
//   const [lat, setLat] = useState(29.716816);
//   const [lon, setLon] = useState(-95.844305);
//   const [zoom, setZoom] = useState(0.04);
//   const [lineColor, setLineColor] = useState("#e98f09ff");
//   const [buildingColor, setBuildingColor] = useState("#444444");
//   const [buildingOutlineColor, setBuildingOutlineColor] = useState("#666666");
//   const [roadColor, setRoadColor] = useState("#666666");
//   const [backgroundColor, setBackgroundColor] = useState("#1a1a1a");

//   const handleFormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     const file = formData.get("file") as File;

//     if (!file || !file.name) {
//       console.log("No file selected");
//       return;
//     }
//     setLat(parseFloat(formData.get("lat") as string));
//     setLon(parseFloat(formData.get("lon") as string));
//     setZoom(parseFloat(formData.get("zoom") as string));
//     setLineColor(formData.get("lineColor") as string);
//     setBuildingColor(formData.get("buildingColor") as string);
//     setBuildingOutlineColor(formData.get("buildingOutlineColor") as string);
//     setRoadColor(formData.get("roadColor") as string);
//     setBackgroundColor(formData.get("backgroundColor") as string);

//     console.log("File selected:", file);
//     const JSONData = new FileReader();
//     console.log(file.name);
//     JSONData.onload = (e: ProgressEvent<FileReader>) => {
//       if (file.type == "application/gpx+xml") {
//         const text = e.target?.result as string;
//         const parser = new DOMParser();
//         const xml = parser.parseFromString(text, "application/xml");
//         const geojson = gpx(xml);
//         if (geojson) {
//           setFileContent(JSON.stringify(geojson));
//         }
//       } else {
//         const content = e.target?.result;
//         if (content) {
//           setFileContent(content as string);
//         }
//       }
//     };
//     JSONData.readAsText(file);
//   };

//   const increaseLon = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     setLon(lon + 0.01);
//   };

//   const decreaseLon = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     setLon(lon - 0.01);
//   };
//   const increaseLat = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     setLat(lat + 0.01);
//   };

//   const decreaseLat = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     setLat(lat - 0.01);
//   };

//   const increaseZoom = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     setZoom(zoom - 0.01);
//   };
//   const decreaseZoom = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     setZoom(zoom + 0.01);
//   };
//   return (
//     <div className="min-h-screen bg-black">
//       <div className="fixed top-0 left-0 right-0 z-10 backdrop-blur-md bg-black/80 border-b border-gray-800 shadow-2xl">
//         <div className="max-w-[1800px] mx-auto p-4 space-y-4">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-2">
//             <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
//               🗺️ Map Viewer
//             </h1>
//             <div className="flex items-center gap-2 text-xs text-gray-400">
//               <span className="px-2 py-1 bg-gray-800 rounded">
//                 Lat: {lat.toFixed(6)}
//               </span>
//               <span className="px-2 py-1 bg-gray-800 rounded">
//                 Lon: {lon.toFixed(6)}
//               </span>
//               <span className="px-2 py-1 bg-gray-800 rounded">
//                 Zoom: {zoom.toFixed(3)}
//               </span>
//             </div>
//           </div>

//           <form onSubmit={handleFormSubmission} className="space-y-4">
//             {/* File Upload Section */}
//             <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
//               <label className="block text-sm font-semibold text-gray-300 mb-2">
//                 📁 Upload Route File
//               </label>
//               <input
//                 type="file"
//                 name="file"
//                 className="w-full text-white file:py-2 file:px-6 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-blue-700 file:text-white file:font-semibold hover:file:from-blue-700 hover:file:to-blue-800 file:cursor-pointer file:transition-all file:shadow-lg hover:file:shadow-blue-500/50"
//               />
//             </div>

//             {/* Map Configuration */}
//             <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
//               <label className="block text-sm font-semibold text-gray-300 mb-3">
//                 🎯 Map Position
//               </label>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                 <div>
//                   <label className="block text-xs text-gray-400 mb-1">
//                     Latitude
//                   </label>
//                   <input
//                     type="text"
//                     name="lat"
//                     placeholder="Latitude"
//                     defaultValue={lat}
//                     className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs text-gray-400 mb-1">
//                     Longitude
//                   </label>
//                   <input
//                     type="text"
//                     name="lon"
//                     placeholder="Longitude"
//                     defaultValue={lon}
//                     className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs text-gray-400 mb-1">
//                     Zoom
//                   </label>
//                   <input
//                     type="text"
//                     name="zoom"
//                     placeholder="Zoom"
//                     defaultValue={zoom}
//                     className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Color Customization */}
//             <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
//               <label className="block text-sm font-semibold text-gray-300 mb-3">
//                 🎨 Color Scheme
//               </label>
//               <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
//                 <div>
//                   <label className="block text-xs text-gray-400 mb-1">
//                     Route Line
//                   </label>
//                   <input
//                     type="color"
//                     name="lineColor"
//                     defaultValue={lineColor}
//                     className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs text-gray-400 mb-1">
//                     Buildings
//                   </label>
//                   <input
//                     type="color"
//                     name="buildingColor"
//                     defaultValue={buildingColor}
//                     className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs text-gray-400 mb-1">
//                     Outlines
//                   </label>
//                   <input
//                     type="color"
//                     name="buildingOutlineColor"
//                     defaultValue={buildingOutlineColor}
//                     className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs text-gray-400 mb-1">
//                     Roads
//                   </label>
//                   <input
//                     type="color"
//                     name="roadColor"
//                     defaultValue={roadColor}
//                     className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs text-gray-400 mb-1">
//                     Background
//                   </label>
//                   <input
//                     type="color"
//                     name="backgroundColor"
//                     defaultValue={backgroundColor}
//                     className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98]"
//             >
//               🚀 Load Map
//             </button>
//           </form>

//           {/* Quick Navigation */}
//           <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
//             <label className="block text-sm font-semibold text-gray-300 mb-3">
//               🧭 Quick Navigation
//             </label>
//             <div className="flex flex-wrap gap-2">
//               <button
//                 onClick={increaseLat}
//                 className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
//               >
//                 ⬆️ North
//               </button>
//               <button
//                 onClick={decreaseLat}
//                 className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
//               >
//                 ⬇️ South
//               </button>
//               <button
//                 onClick={increaseLon}
//                 className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
//               >
//                 ➡️ East
//               </button>
//               <button
//                 onClick={decreaseLon}
//                 className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
//               >
//                 ⬅️ West
//               </button>
//               <div className="w-full md:w-auto h-px md:h-auto md:w-px bg-gray-700"></div>
//               <button
//                 onClick={increaseZoom}
//                 className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all border border-gray-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
//               >
//                 🔍 Zoom In
//               </button>
//               <button
//                 onClick={decreaseZoom}
//                 className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all border border-gray-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
//               >
//                 🔎 Zoom Out
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default navigation;
