/**
 * Cloudflare Pages Function — proxies Google Sheet data to the browser.
 */

export async function onRequest(context) {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, SHEET_ID } = context.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !SHEET_ID) {
    return new Response(JSON.stringify({ error: "Missing environment variables", keys: Object.keys(context.env) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Step 1: Get OAuth access token
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: GOOGLE_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenResp.ok) {
      const text = await tokenResp.text();
      return new Response(JSON.stringify({ error: "OAuth failed", status: tokenResp.status, detail: text }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tokenData = await tokenResp.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      return new Response(JSON.stringify({ error: "No access token in response", data: tokenData }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 2: Fetch sheet data
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

    // Parse into article objects
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
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, max-age=0",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
