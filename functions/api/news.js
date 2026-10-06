// GET /api/news — live UAE headlines from ARN News Centre RSS (server-side fetch).
// Returns top 5 items as JSON {title, link, pubDate}. Edge-cached 1 hour.
const FEED = "https://www.arnnewscentre.ae/news/uae/feed.xml";
function clean(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ").trim();
}
export async function onRequest() {
  try {
    const res = await fetch(FEED, {
      headers: { "user-agent": "sunnytoolspro/1.0 (+https://sunnytoolspro.pages.dev)" },
    });
    if (!res.ok) throw new Error("upstream " + res.status);
    const xml = await res.text();
    const items = [];
    const re = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = re.exec(xml)) && items.length < 5) {
      const body = m[1];
      const pick = (tag) => {
        const t = body.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\/" + tag + ">"));
        return t ? clean(t[1]) : "";
      };
      const title = pick("title"), link = pick("link");
      if (!title || !link) continue;
      items.push({ title, link, pubDate: pick("pubDate") });
    }
    if (!items.length) throw new Error("empty feed");
    return Response.json(
      { source: "ARN News Centre", items },
      { headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" } }
    );
  } catch {
    return Response.json({ error: "news unavailable" }, { status: 502 });
  }
}
