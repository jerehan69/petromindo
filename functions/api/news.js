/**
 * Cloudflare Pages Function — proxies Google Sheet data to the browser.
 */

export async function onRequest(context) {
  const { GOOGLE_API_KEY, SHEET_ID } = context.env;
  const missing = [];
  if (!GOOGLE_API_KEY) missing.push("GOOGLE_API_KEY");
  if (!SHEET_ID) missing.push("SHEET_ID");
  if (missing.length > 0) {
    return new Response(JSON.stringify({ error: "Missing: " + missing.join(", ") }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const sheetResp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Feed?key=${GOOGLE_API_KEY}&valueRenderOption=FORMULA&majorDimension=ROWS`
    );
    if (!sheetResp.ok) {
      const text = await sheetResp.text();
      return new Response(JSON.stringify({ error: "Sheet fetch failed", status: sheetResp.status, detail: text.substring(0, 500) }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await sheetResp.json();
    const rows = data.values || [];
    const articles = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r.length < 12) continue;
      articles.push({
        companies: r[0] || "",
        country: r[1] || "",
        date: r[2] || "",
        time: r[3] || "",
        content: r[4] || "",
        account: r[5] || "",
        username: r[6] || "",
        likes: r[7] || "",
        retweets: r[8] || "",
        replies: r[9] || "",
        views: r[10] || "",
        url: r[11] || "",
      });
    }

    return new Response(JSON.stringify({ articles, count: articles.length }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, max-age=0" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: (err.stack || "").substring(0, 500) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
