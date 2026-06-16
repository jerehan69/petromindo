/**
 * Cloudflare Pages Function — proxies Google Sheet data to the browser.
 */

async function getAccessToken(env) {
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `client_id=${encodeURIComponent(env.GOOGLE_CLIENT_ID)}&client_secret=${encodeURIComponent(env.GOOGLE_CLIENT_SECRET)}&refresh_token=${encodeURIComponent(env.GOOGLE_REFRESH_TOKEN)}&grant_type=refresh_token`,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OAuth ${resp.status}: ${text.substring(0, 300)}`);
  }
  const data = await resp.json();
  if (!data.access_token) throw new Error(`No access_token: ${JSON.stringify(data)}`);
  return data.access_token;
}

export async function onRequest(context) {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, SHEET_ID } = context.env;
  const missing = [];
  if (!GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
  if (!GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
  if (!GOOGLE_REFRESH_TOKEN) missing.push("GOOGLE_REFRESH_TOKEN");
  if (!SHEET_ID) missing.push("SHEET_ID");
  if (missing.length > 0) {
    return new Response(JSON.stringify({ error: "Missing: " + missing.join(", ") }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const access_token = await getAccessToken(context.env);

    const sheetResp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Feed?valueRenderOption=FORMULA&majorDimension=ROWS`,
      { headers: { Authorization: `Bearer ${access_token}` } }
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
