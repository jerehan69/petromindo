/**
 * Auth Middleware — password-protects the entire site.
 *
 * Visitors without the auth cookie get a login page.
 * POST to /auth with pw + redirect to authenticate.
 */

const PASSWORD = "2907";
const COOKIE_NAME = "site_auth";
const COOKIE_VALUE = "1";
const COOKIE_MAX_AGE = 600; // 10 minutes

const LOGIN_PAGE = (redirect, error) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>tech.jemxx.dev</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #faf8f5;
      color: #1a1a1a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .login-box {
      background: #fff;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 32px rgba(0,0,0,0.06);
      border: 1px solid #e0d8d0;
      text-align: center;
      max-width: 360px;
      width: 100%;
    }
    .lock-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 0.4rem;
    }
    p.sub {
      font-size: 0.9rem;
      color: #8a7e72;
      margin-bottom: 1.5rem;
    }
    input[type="password"] {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e0d8d0;
      border-radius: 10px;
      font-size: 1.1rem;
      text-align: center;
      outline: none;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    input[type="password"]:focus {
      border-color: #e65100;
      box-shadow: 0 0 0 3px rgba(230,81,0,0.1);
    }
    button {
      margin-top: 1rem;
      width: 100%;
      padding: 0.75rem;
      background: #e65100;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      font-family: inherit;
    }
    button:hover { background: #d44a00; }
    button:active { background: #c04200; }
    .error {
      color: #d32f2f;
      font-size: 0.85rem;
      margin-top: 0.75rem;
      display: ${error ? "block" : "none"};
    }
    .dot { color: #e0d8d0; margin: 1.5rem 0; }
  </style>
</head>
<body>
  <div class="login-box">
    <div class="lock-icon">🔒</div>
    <h1>tech.jemxx.dev</h1>
    <p class="sub">Enter password to continue</p>
    <form method="POST" action="/auth">
      <input type="hidden" name="redirect" value="${redirect}">
      <input type="password" name="pw" placeholder="Password" autofocus autocomplete="off">
      <button type="submit">Enter</button>
      <p class="error">Incorrect password. Try again.</p>
    </form>
  </div>
</body>
</html>`;

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // ── Check auth cookie ──────────────────────────────────────────────
  const cookies = request.headers.get("Cookie") || "";
  const isAuth = cookies
    .split(";")
    .some((c) => c.trim() === `${COOKIE_NAME}=${COOKIE_VALUE}`);

  if (isAuth) {
    return next();
  }

  // ── Handle login POST ──────────────────────────────────────────────
  if (request.method === "POST" && path === "/auth") {
    const formData = await request.formData();
    const pw = formData.get("pw") || "";
    const redirect = formData.get("redirect") || "/";

    if (pw === PASSWORD) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirect,
          "Set-Cookie": `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; HttpOnly`,
        },
      });
    }

    // Wrong password — redirect back with error flag
    const sep = redirect.includes("?") ? "&" : "?";
    return new Response(null, {
      status: 302,
      headers: { Location: `${redirect}${sep}e=1` },
    });
  }

  // ── Show login page ────────────────────────────────────────────────
  const error = url.searchParams.has("e");
  return new Response(LOGIN_PAGE(path, error), {
    status: 401,
    headers: { "Content-Type": "text/html" },
  });
}
