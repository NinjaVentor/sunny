// GET /api/pf-rooms?city=sharjah&page=1 — live Sharjah/Dubai/Ajman apartment
// listings parsed from PropertyFinder search pages (server-side, no key needed).
const CITY_URL = {
  sharjah: "https://www.propertyfinder.ae/en/rent/sharjah/apartments-for-rent.html",
  dubai: "https://www.propertyfinder.ae/en/rent/dubai/apartments-for-rent.html",
  ajman: "https://www.propertyfinder.ae/en/rent/ajman/apartments-for-rent.html",
};
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
export async function onRequest({ request }) {
  const params = new URL(request.url).searchParams;
  const city = (params.get("city") || "sharjah").toLowerCase();
  const page = Math.min(Math.max(parseInt(params.get("page") || "1", 10) || 1, 1), 5);
  const base = CITY_URL[city] || CITY_URL.sharjah;
  const target = page > 1 ? base.replace(".html", "_page_" + page + ".html") : base;
  try {
    const res = await fetch(target, { headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" } });
    if (!res.ok) throw new Error("upstream " + res.status);
    const html = await res.text();
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!m) throw new Error("no data");
    const data = JSON.parse(m[1]);
    const raw = (((data.props || {}).pageProps || {}).searchResult || {}).listings || [];
    const listings = raw
      .filter((x) => x && x.property)
      .map((x) => {
        const p = x.property;
        const yearly = Number((p.price || {}).value) || 0;
        const img = Array.isArray(p.images) && p.images[0]
          ? p.images[0].medium || p.images[0].small || ""
          : "";
        return {
          id: String(p.id || ""),
          title: p.title || "Apartment for rent",
          yearly,
          monthly: yearly ? Math.round(yearly / 12) : 0,
          beds: String(p.bedrooms != null ? p.bedrooms : "—"),
          baths: String(p.bathrooms != null ? p.bathrooms : "—"),
          size: p.size && p.size.value ? p.size.value + " " + (p.size.unit || "sqft") : "",
          area: ((p.location || {}).full_name) || (p.location || {}).name || "",
          img,
          url: p.share_url || "",
          broker: (p.broker || {}).name || "",
          furnished: p.furnished || "",
          listed: p.listed_date || null,
        };
      })
      .filter((l) => l.yearly > 0 && l.url);
    return Response.json(
      { city, page, count: listings.length, listings, credit: { name: "PropertyFinder", url: "https://www.propertyfinder.ae" } },
      { headers: { "Cache-Control": "public, max-age=600, s-maxage=1800" } }
    );
  } catch {
    return Response.json({ error: "listings unavailable" }, { status: 502 });
  }
}
