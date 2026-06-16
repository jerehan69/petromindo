export async function onRequest(context) {
  return new Response(JSON.stringify({
    ok: true,
    envKeys: Object.keys(context.env),
    hasSheetId: !!context.env.SHEET_ID,
    hasClientId: !!context.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!context.env.GOOGLE_CLIENT_SECRET,
    hasRefreshToken: !!context.env.GOOGLE_REFRESH_TOKEN,
  }), {
    headers: { "Content-Type": "application/json" },
  });
}
