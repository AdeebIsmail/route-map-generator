"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Viewer from "@/components/viewer";

type Coordinate = [number, number];

type RouteData = {
  type: "FeatureCollection";
  coordinates: Coordinate[];
};

const emptyRoute: RouteData = {
  type: "FeatureCollection",
  coordinates: [],
};

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [routeData, setRouteData] = useState<RouteData>(emptyRoute);
  const [fileError, setFileError] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
        throw new Error(
          "No track or route points were found in this GPX file.",
        );
      }

      setRouteData({
        type: "FeatureCollection",
        coordinates: routeCoordinates,
      });
    } catch (error) {
      setRouteData(emptyRoute);
      setFileError(
        error instanceof Error
          ? error.message
          : "Unable to read this GPX file.",
      );
    }
  }

  function toCoordinate(point: Element): [number, number] | null {
    const lat = Number(point.getAttribute("lat"));
    const lon = Number(point.getAttribute("lon"));
    return Number.isFinite(lat) && Number.isFinite(lon) ? [lon, lat] : null;
  }

  function isCoordinate(
    coordinate: [number, number] | null,
  ): coordinate is [number, number] {
    return coordinate !== null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#f3f5f0] text-[#17211b] dark:bg-[#101413] dark:text-[#edf3ee] lg:flex">
      <section className="w-full max-w-md border-r border-[#dce3db] bg-[#fbfcf9] px-6 py-4 dark:border-[#29352f] dark:bg-[#1a211e] sm:px-10 lg:min-h-screen lg:px-14 lg:py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#1f6b52] text-sm font-bold text-white">
              M
            </span>
            <span className="text-sm font-semibold tracking-[0.18em] text-[#1f6b52] dark:text-[#8bd0af]">
              MAPROOM
            </span>
          </div>
        </div>

        <div className="mb-8 max-w-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#e2764c]">
            Route Viewer
          </p>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#17211b] dark:text-[#f1f7f2]">
            Draw your route.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#6e7c72] dark:text-[#a8b8ad]">
            Upload a GPX file, set the map position, and explore the route you
            took.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="map-file"
              className="mb-2 block text-sm font-semibold text-[#27352c] dark:text-[#dce9df]"
            >
              Upload Route File
            </label>
            <label
              htmlFor="map-file"
              className="group flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#9fb5a4] bg-[#f1f6f0] px-6 text-center transition hover:border-[#1f6b52] hover:bg-[#eaf3e9] dark:border-[#587765] dark:bg-[#24332b] dark:hover:border-[#8bd0af] dark:hover:bg-[#2b4034]"
            >
              <span className="mb-3 grid size-11 place-items-center rounded-xl bg-white text-[#1f6b52] shadow-sm ring-1 ring-[#dce7dc]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5 fill-none stroke-current stroke-2"
                >
                  <path d="M12 16V4m0 0L7 9m5-5 5 5M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
                </svg>
              </span>
              <span className="text-sm font-semibold text-[#31513e] dark:text-[#d5eadb]">
                {fileName || "Choose a file or drag it here"}
              </span>
              <span className="mt-1 text-xs text-[#839087] dark:text-[#9eb2a4]">
                GPX files up to 10 MB
              </span>
            </label>
            <input
              id="map-file"
              name="file"
              type="file"
              accept=".gpx,application/gpx+xml,application/xml,text/xml"
              className="sr-only"
              onChange={handleFileChange}
            />
            {fileError && (
              <p
                role="alert"
                className="mt-2 text-sm text-[#c2543d] dark:text-[#ff9b83]"
              >
                {fileError}
              </p>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="latitude"
                className="mb-2 block text-sm font-semibold text-[#27352c] dark:text-[#dce9df]"
              >
                Map Position
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  defaultValue="0"
                  aria-label="Latitude"
                  className="form-input"
                />
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  defaultValue="0"
                  aria-label="Longitude"
                  className="form-input"
                />
                <input
                  id="zoom"
                  name="zoom"
                  type="number"
                  step="any"
                  defaultValue="0"
                  aria-label="Zoom"
                  className="form-input"
                />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-3 px-1 text-[11px] font-medium text-[#839087] dark:text-[#9eb2a4]">
                <span>Latitude</span>
                <span>Longitude</span>
                <span>Zoom</span>
              </div>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-[#27352c] dark:text-[#dce9df]">
                Quick Navigation
              </legend>
              <div className="grid grid-cols-4 gap-2">
                {[
                  ["⬆", "North"],
                  ["⬇", "South"],
                  ["➡", "East"],
                  ["⬅", "West"],
                ].map(([icon, direction]) => (
                  <button
                    key={direction}
                    type="button"
                    className="rounded-lg border border-[#d3ddd3] bg-white px-2 py-2 text-xs font-semibold text-[#54715d] transition hover:border-[#1f6b52] hover:text-[#1f6b52] dark:border-[#3d5145] dark:bg-[#243029] dark:text-[#b9d1c0] dark:hover:border-[#8bd0af] dark:hover:text-[#b7ebcb]"
                  >
                    <span className="mr-1">{icon}</span>
                    {direction}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-lg border border-[#d3ddd3] bg-white px-3 py-2 text-sm font-semibold text-[#54715d] transition hover:border-[#1f6b52] dark:border-[#3d5145] dark:bg-[#243029] dark:text-[#b9d1c0] dark:hover:border-[#8bd0af]"
              >
                🔍 Zoom In
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#d3ddd3] bg-white px-3 py-2 text-sm font-semibold text-[#54715d] transition hover:border-[#1f6b52] dark:border-[#3d5145] dark:bg-[#243029] dark:text-[#b9d1c0] dark:hover:border-[#8bd0af]"
              >
                🔎 Zoom Out
              </button>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-[#27352c] dark:text-[#dce9df]">
                Color Scheme
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Route Line", "#e2764c"],
                  ["Buildings", "#b8cdbb"],
                  ["Outlines", "#9fb5a4"],
                  ["Roads", "#ffffff"],
                  ["Background", "#dce7db"],
                ].map(([label, color]) => (
                  <label
                    key={label}
                    className="flex items-center justify-between rounded-lg border border-[#d3ddd3] bg-white px-3 py-2 text-xs font-medium text-[#54715d] dark:border-[#3d5145] dark:bg-[#243029] dark:text-[#b9d1c0]"
                  >
                    {label}
                    <input
                      type="color"
                      defaultValue={color}
                      aria-label={label}
                      className="size-6 cursor-pointer border-0 bg-transparent p-0"
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f6b52] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(31,107,82,0.18)] transition hover:bg-[#185640] focus:outline-none focus:ring-2 focus:ring-[#e2764c] focus:ring-offset-2 dark:bg-[#2f8a68] dark:hover:bg-[#3aa47c] dark:focus:ring-offset-[#1a211e]"
          >
            Load Map
            <span aria-hidden="true">&#8594;</span>
          </button>
          {submitted && (
            <p
              role="status"
              className="text-center text-sm font-medium text-[#1f6b52]"
            >
              Your GPX route is ready to load on the map.
            </p>
          )}
        </form>
      </section>

      <section className="relative min-h-[440px] flex-1 overflow-hidden bg-[#dce7db] dark:bg-[#18221d] lg:min-h-screen">
        {submitted && (
          <Viewer
            routeData={routeData}
            lat={0}
            lon={0}
            zoom={0}
            lineColor="#e2764c"
            buildingColor="#b8cdbb"
            buildingOutlineColor="#9fb5a4"
            roadColor="#ffffff"
            backgroundColor="#18221d"
          />
        )}
      </section>
    </main>
  );
}
