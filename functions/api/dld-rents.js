// GET /api/dld-rents — Dubai official average rents, aggregated from DLD open data.
// Source: Dubai Land Department open-data Ejari export (last 30 days, residential only).
// Returns compact per-area averages so the page stays fast.
function dldDate(d) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return m + "/" + day + "/" + d.getFullYear();
}
function splitCsv(line) {
  const out = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === "," && !inQ) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
export async function onRequest() {
  try {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const body = JSON.stringify({
      parameters: {
        P_FROM_DATE: dldDate(from), P_TO_DATE: dldDate(to), P_DATE_TYPE: "0",
        P_IS_FREE_HOLD: "", P_VERSION: "", P_AREA_ID: "", P_USAGE_ID: "",
        P_PROP_TYPE_ID: "", P_TAKE: "2500", P_SKIP: "0", P_SORT: "",
      },
      labels: {},
    });
    const res = await fetch("https://gateway.dubailand.gov.ae/open-data/rents/export/csv", {
      method: "POST",
      headers: { "Content-Type": "application/json", "user-agent": "sunnytoolspro/1.0" },
      body,
    });
    if (!res.ok) throw new Error("upstream " + res.status);
    const text = await res.text();
    if (!text || text.trim().startsWith("<") || text.trim().startsWith("{")) throw new Error("bad payload");
    const lines = text.trim().split("\n");
    const head = splitCsv(lines[0]).map((h) => h.trim());
    const ix = (n) => head.indexOf(n);
    const iArea = ix("AREA_EN"), iAnnual = ix("ANNUAL_AMOUNT"), iRooms = ix("ROOMS"),
      iUsage = ix("USAGE_EN"), iType = ix("PROP_TYPE_EN");
    if (iArea < 0 || iAnnual < 0) throw new Error("bad columns");
    const agg = {};
    for (let i = 1; i < lines.length; i++) {
      const c = splitCsv(lines[i]);
      if ((c[iUsage] || "").toLowerCase() !== "residential") continue;
      const area = (c[iArea] || "").trim();
      const annual = Number(String(c[iAnnual] || "").replace(/,/g, ""));
      if (!area || !isFinite(annual) || annual <= 0) continue;
      const rooms = (c[iRooms] || "").trim() || "—";
      const key = area + "|AED";
      const a = agg[key] || (agg[key] = { area, sum: 0, n: 0, min: Infinity, max: 0, rooms: {} });
      a.sum += annual; a.n++;
      if (annual < a.min) a.min = annual;
      if (annual > a.max) a.max = annual;
      const rk = rooms;
      const r = a.rooms[rk] || (a.rooms[rk] = { sum: 0, n: 0 });
      r.sum += annual; r.n++;
    }
    const areas = Object.values(agg)
      .map((a) => ({
        area: a.area,
        avgAnnual: Math.round(a.sum / a.n),
        minAnnual: a.min === Infinity ? null : a.min,
        maxAnnual: a.max || null,
        contracts: a.n,
        byRooms: Object.entries(a.rooms)
          .map(([rooms, r]) => ({ rooms, avgAnnual: Math.round(r.sum / r.n), contracts: r.n }))
          .sort((x, y) => y.contracts - x.contracts).slice(0, 4),
      }))
      .sort((x, y) => y.contracts - x.contracts)
      .slice(0, 40);
    return Response.json(
      { areas, windowDays: 30, source: "Dubai Land Department open data (Ejari)", updated: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=1800, s-maxage=3600" } }
    );
  } catch {
    return Response.json({ error: "rents unavailable" }, { status: 502 });
  }
}
