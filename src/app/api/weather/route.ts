/**
 * Today's weather where the visitor is, for the weather card on the About me
 * pinboard.
 *
 * The location is the approximate one Vercel attaches to every request from
 * the visitor's IP (city level, no browser permission prompt). Off Vercel, or
 * in local dev, those headers are missing and the card shows Ann Arbor, where
 * Anne studies. Nothing is stored; the coordinates only go to Open-Meteo,
 * which is free and needs no key.
 *
 * Fahrenheit for visitors in the US, Celsius everywhere else.
 */

const FALLBACK = { city: "Ann Arbor", lat: 42.2808, lon: -83.743, country: "US" };

function fromHeaders(h: Headers) {
  const lat = Number(h.get("x-vercel-ip-latitude"));
  const lon = Number(h.get("x-vercel-ip-longitude"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0) || !h.get("x-vercel-ip-latitude")) return FALLBACK;
  let city = h.get("x-vercel-ip-city") ?? "";
  try {
    city = decodeURIComponent(city);
  } catch {
    /* keep the raw value */
  }
  return { city: city || "Your city", lat, lon, country: h.get("x-vercel-ip-country") ?? "" };
}

export async function GET(request: Request) {
  const where = fromHeaders(request.headers);
  const fahrenheit = where.country === "US";
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: where.lat.toFixed(2),
    longitude: where.lon.toFixed(2),
    current: "temperature_2m,weather_code,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "1",
    temperature_unit: fahrenheit ? "fahrenheit" : "celsius",
  }).toString();

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(String(res.status));
    const d = await res.json();
    return Response.json(
      {
        city: where.city,
        unit: fahrenheit ? "F" : "C",
        now: Math.round(d.current.temperature_2m),
        code: d.current.weather_code as number,
        isDay: d.current.is_day === 1,
        high: Math.round(d.daily.temperature_2m_max[0]),
        low: Math.round(d.daily.temperature_2m_min[0]),
        rain: d.daily.precipitation_probability_max?.[0] ?? null,
      },
      // per visitor (location comes from their request), so only their browser may keep it
      { headers: { "Cache-Control": "private, max-age=900" } },
    );
  } catch {
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
