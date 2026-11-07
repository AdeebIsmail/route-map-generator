import axios from "axios";

type Bounds = {
  minlon: number;
  minlat: number;
  maxlon: number;
  maxlat: number;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isBounds(value: unknown): value is Bounds {
  if (!value || typeof value !== "object") return false;

  const bounds = value as Record<string, unknown>;
  const minlon = bounds.minlon;
  const minlat = bounds.minlat;
  const maxlon = bounds.maxlon;
  const maxlat = bounds.maxlat;

  if (
    !isFiniteNumber(minlon) ||
    !isFiniteNumber(minlat) ||
    !isFiniteNumber(maxlon) ||
    !isFiniteNumber(maxlat)
  ) {
    return false;
  }

  return minlon <= maxlon && minlat <= maxlat;
}

export async function POST(request: Request) {
  try {
    const bounds: unknown = await request.json();

    if (!isBounds(bounds)) {
      return Response.json({ error: "Invalid map bounds." }, { status: 400 });
    }

    const query = `
      [out:json][timeout:25];
      (
        way["building"](${bounds.minlat},${bounds.minlon},${bounds.maxlat},${bounds.maxlon});
        way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|unclassified|service|footway|path|pedestrian|cycleway"](${bounds.minlat},${bounds.minlon},${bounds.maxlat},${bounds.maxlon});
      );
      out geom;
    `;

    const apiKey = process.env.NEXTGIS_API_KEY;
    console.log("request");
    const response = await axios.post(
      "https://overpass.nextgis.com/" + apiKey + "/api/interpreter",
      `data=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "MapRoom/0.1 (hey@adeebismail.com)",
        },
        timeout: 60000,
      },
    );

    return Response.json(response.data);
  } catch (error: unknown) {
    const message = axios.isAxiosError(error)
      ? error.message
      : "Unable to load map data.";
    console.log(message);
    return Response.json({ error: message }, { status: 502 });
  }
}
