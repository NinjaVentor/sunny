"""Scrape UAE jobs (Bayt + Indeed + LinkedIn) via JobSpy, twice daily via GitHub Actions.

Output: data/jobs.json — [{id,title,company,location,url,site,date,salary}]
Old file is kept if a run fails or returns nothing (never blank the site).
Usage: python scripts/scrape_jobs.py [--terms developer,accountant] [--wanted 25]
"""
import json
import os
import sys
import hashlib
from datetime import datetime, timezone

TERMS = [t.strip() for t in os.environ.get("JOB_TERMS", "developer,accountant,sales representative,driver,marketing").split(",") if t.strip()]
WANTED = int(os.environ.get("JOB_WANTED", "25"))
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "jobs.json")

for i, a in enumerate(sys.argv):
    if a == "--terms" and i + 1 < len(sys.argv):
        TERMS = [t.strip() for t in sys.argv[i + 1].split(",") if t.strip()]
    if a == "--wanted" and i + 1 < len(sys.argv):
        WANTED = int(sys.argv[i + 1])

def norm_date(v):
    try:
        if v is None or (isinstance(v, float) and str(v) == "nan"):
            return None
        s = str(v)
        return s[:10] if len(s) >= 10 else None
    except Exception:
        return None

def main():
    try:
        from jobspy import scrape_jobs
        import pandas as pd
    except ImportError as e:
        print("jobspy not installed:", e)
        return 1

    frames = []
    for term in TERMS:
        for site in (["bayt", "indeed", "linkedin"],):
            try:
                df = scrape_jobs(
                    site_name=site,
                    search_term=term,
                    location="Dubai, UAE",
                    country_indeed="United Arab Emirates",
                    results_wanted=WANTED,
                    hours_old=72,
                )
                if df is not None and len(df):
                    df = df.copy()
                    df["query"] = term
                    frames.append(df)
                    print(f"OK {site} '{term}': {len(df)} rows")
            except Exception as e:
                print(f"SKIP site={site} term='{term}': {str(e)[:160]}")

    if not frames:
        print("No jobs scraped — keeping previous file.")
        return 0

    import pandas as pd
    all_df = pd.concat(frames, ignore_index=True).fillna("")
    seen, jobs = set(), []
    for _, r in all_df.iterrows():
        g = lambda k: (str(r.get(k, "")) or "").strip()
        url = g("job_url")
        if not url:
            continue
        key = hashlib.md5(url.encode()).hexdigest()
        if key in seen:
            continue
        seen.add(key)
        comp_min, comp_max = g("min_amount"), g("max_amount")
        def money(n):
            try:
                f = float(n)
                return str(int(f)) if f == int(f) else str(f)
            except Exception:
                return n
        salary = ""
        if comp_min or comp_max:
            salary = (g("currency") + " " + (money(comp_min) if comp_min else money(comp_max)) + ("–" + money(comp_max) if comp_min and comp_max else "")).strip()
        jobs.append({
            "id": key[:12],
            "title": g("title") or "Untitled role",
            "company": g("company") or "Company",
            "location": g("location") or "UAE",
            "url": url,
            "site": g("site") or "board",
            "query": g("query"),
            "date": norm_date(r.get("date_posted")),
            "salary": salary,
            "type": g("job_type") or "",
        })

    jobs.sort(key=lambda j: j["date"] or "", reverse=True)
    payload = {"updated": datetime.now(timezone.utc).isoformat(), "count": len(jobs), "jobs": jobs[:400]}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False)
    print(f"Wrote {OUT}: {len(payload['jobs'])} jobs")
    return 0

if __name__ == "__main__":
    sys.exit(main())
