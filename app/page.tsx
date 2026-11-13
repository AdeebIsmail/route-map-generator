"use client";

import { ChangeEvent, FormEvent, useState, useCallback } from "react";
import Viewer from "@/components/viewer";
//
type Coordinate = [number, number];

type RouteData = {
  type: "FeatureCollection";
  coordinates: Coordinate[];
};

const emptyRoute: RouteData = {
  type: "FeatureCollection",
  coordinates: [],
};

const toCoordinate = (point: Element): [number, number] | null => {
  const lat = Number(point.getAttribute("lat"));
  const lon = Number(point.getAttribute("lon"));

  return Number.isFinite(lat) && Number.isFinite(lon) ? [lon, lat] : null;
};

const isCoordinate = (
  coordinate: [number, number] | null,
): coordinate is [number, number] => {
  return coordinate !== null;
};

const parseGpxFile = async (file: File): Promise<RouteData> => {
  const xml = new DOMParser().parseFromString(
    await file.text(),
    "application/xml",
  );

  const parserError = xml.querySelector("parsererror");
  if (parserError) throw new Error("This is not valid XML.");

  const segments = Array.from(xml.querySelectorAll("trkseg"))
    .map((segment) => Array.from(segment.querySelectorAll("trkpt")))
    .map((points) => points.map(toCoordinate).filter(isCoordinate));

  const routePoints = Array.from(xml.querySelectorAll("rtept"))
    .map(toCoordinate)
    .filter(isCoordinate);

  const coordinates = segments.length
    ? segments.filter((segment) => segment.length > 1)
    : routePoints.length > 1
      ? [routePoints]
      : [];

  const routeCoordinates = coordinates.flat();

  if (!routeCoordinates.length) {
    throw new Error("No track or route points were found in this GPX file.");
  }

  return {
    type: "FeatureCollection",
    coordinates: routeCoordinates,
  };
};

const ColorControl = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <label className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-medium text-gray-200 transition hover:border-gray-500 hover:bg-gray-800">
      {label}
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="size-6 cursor-pointer border-0 bg-transparent p-0"
      />
    </label>
  );
};

const DirectionControl = ({
  direction,
  icon,
  onChange,
}: {
  direction: string;
  icon: string;
  onChange: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className="rounded-lg border border-gray-700 bg-gray-900 px-2 py-2 text-xs font-semibold text-gray-200 transition hover:border-gray-500 hover:bg-gray-800"
    >
      <span className="mr-1">{icon}</span>
      {direction}
    </button>
  );
};

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [routeData, setRouteData] = useState<RouteData>(emptyRoute);
  const [fileError, setFileError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [zoom, setZoom] = useState(1);

  const [downloadMap, setDownloadMap] = useState<(() => void) | null>(null);

  const [routeLine, setRouteLine] = useState("#e2764c");
  const [buildingColor, setBuildingColor] = useState("#b8cdbb");
  const [outlineColor, setOutlineColor] = useState("#9fb5a4");
  const [roadColor, setRoadColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#030712");

  const handleDownloadReady = useCallback((download: () => void) => {
    setDownloadMap(() => download);
  }, []);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name ?? "");
    setSubmitted(false);
    setFileError("");

    if (!file) {
      setRouteData(emptyRoute);
      return;
    }

    try {
      setRouteData(await parseGpxFile(file));
    } catch (error) {
      setRouteData(emptyRoute);
      setFileError(
        error instanceof Error
          ? error.message
          : "Unable to read this GPX file.",
      );
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-[#edf3ee] lg:flex">
      <section className="w-full max-w-md border-r border-gray-800 bg-gray-950 px-6 py-4 sm:px-10 lg:min-h-screen lg:px-14 lg:py-6">
        <div className="mb-8 max-w-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#e2764c]">
            Route Visualizer
          </p>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#f1f7f2]">
            Draw your route.
          </h1>
          <p className="mt-4 text-sm leading-6 text-gray-300">
            Upload a GPX file, set the map position, and explore the route you
            took.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="map-file"
              className="mb-2 block text-sm font-semibold text-[#dce9df]"
            >
              Upload Route File
            </label>
            <label
              htmlFor="map-file"
              className="group flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-gray-900 px-6 text-center transition hover:border-gray-500 hover:bg-gray-800"
            >
              <span className="mb-3 grid size-11 place-items-center rounded-xl bg-white text-black shadow-sm ring-1 ring-black">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5 fill-none stroke-current stroke-2"
                >
                  <path d="M12 16V4m0 0L7 9m5-5 5 5M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
                </svg>
              </span>
              <span className="text-sm font-semibold text-white">
                {fileName || "Choose a file or drag it here"}
              </span>
              <span className="mt-1 text-xs text-gray-400">
                GPX files up to 10 MB
              </span>
            </label>
            <input
              id="map-file"
              name="file"
              type="file"
              accept=".gpx"
              className="sr-only"
              onChange={handleFileChange}
            />
            {fileError && (
              <p role="alert" className="mt-2 text-sm text-red-400">
                {fileError}
              </p>
            )}
          </div>

          <div className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-200">
                Quick Navigation
              </legend>
              <div className="grid grid-cols-4 gap-2">
                <DirectionControl
                  direction="North"
                  icon="⬆"
                  onChange={() => setLatitude((value) => value + 0.01)}
                />
                <DirectionControl
                  direction="South"
                  icon="⬇"
                  onChange={() => setLatitude((value) => value - 0.01)}
                />
                <DirectionControl
                  direction="West"
                  icon="⬅"
                  onChange={() => setLongitude((value) => value - 0.01)}
                />
                <DirectionControl
                  direction="East"
                  icon="➡"
                  onChange={() => setLongitude((value) => value + 0.01)}
                />
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-200 transition hover:border-gray-500 hover:bg-gray-800"
                onClick={() => setZoom((currentZoom) => currentZoom + 1)}
              >
                🔍 Zoom In
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-200 transition hover:border-gray-500 hover:bg-gray-800"
                onClick={() => setZoom((currentZoom) => currentZoom - 1)}
              >
                🔎 Zoom Out
              </button>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-200">
                Color Scheme
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <ColorControl
                  label="Route Line"
                  value={routeLine}
                  onChange={setRouteLine}
                />
                <ColorControl
                  label="Buildings"
                  value={buildingColor}
                  onChange={setBuildingColor}
                />
                <ColorControl
                  label="Outlines"
                  value={outlineColor}
                  onChange={setOutlineColor}
                />
                <ColorControl
                  label="Roads"
                  value={roadColor}
                  onChange={setRoadColor}
                />
                <ColorControl
                  label="Background"
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                />
              </div>
            </fieldset>
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-5 py-3.5 text-sm font-bold text-white transition hover:border-gray-500 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#e2764c] focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            Load Map
            <span aria-hidden="true">&#8680;</span>
          </button>

          {submitted && (
            <p
              role="status"
              className="text-center text-sm font-medium text-[#e2764c]"
            >
              Your GPX route is loading!
            </p>
          )}
        </form>
        <button
          onClick={downloadMap ?? undefined}
          disabled={!downloadMap}
          className="flex mt-4 w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-5 py-3.5 text-sm font-bold text-white transition hover:border-gray-500 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#e2764c] focus:ring-offset-2 focus:ring-offset-gray-950"
        >
          Download Map
          <span aria-hidden="true">&#8681;</span>
        </button>
      </section>

      <section className="relative h-[70vh] min-h-[440px] flex-1 overflow-hidden bg-gray-950 lg:h-screen lg:min-h-0">
        {submitted && (
          <Viewer
            routeData={routeData}
            lat={latitude}
            lon={longitude}
            zoom={zoom}
            lineColor={routeLine}
            buildingColor={buildingColor}
            buildingOutlineColor={outlineColor}
            roadColor={roadColor}
            backgroundColor={backgroundColor}
            onDownloadReady={handleDownloadReady}
          />
        )}
      </section>
    </main>
  );
}
