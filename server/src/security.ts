/**
 * Security response headers for the API.
 *
 * This service returns only JSON and is never rendered as a document, so the
 * Content-Security-Policy is locked down to nothing (`default-src 'none'`),
 * and framing is denied outright. These are cheap, dependency-free defaults;
 * the hosting platform may layer additional headers (HSTS at the edge, etc.).
 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  // No resource loading is ever legitimate for a JSON API response.
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  // Don't let browsers sniff a different content type than declared.
  "X-Content-Type-Options": "nosniff",
  // Belt-and-suspenders against clickjacking alongside frame-ancestors.
  "X-Frame-Options": "DENY",
  // Never leak the request URL (which contains the username) to other origins.
  "Referrer-Policy": "no-referrer",
  // Opt out of legacy cross-origin embedding of API responses.
  "Cross-Origin-Resource-Policy": "same-origin",
});
