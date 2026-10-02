const DEFAULT_UPSTREAM_ORIGIN = 'https://browser.lol';
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function upstreamOrigin(environment) {
  return environment.UPSTREAM_ORIGIN || DEFAULT_UPSTREAM_ORIGIN;
}

function proxyTarget(requestUrl, origin) {
  const url = new URL(requestUrl);
  return new URL(url.pathname + url.search, origin);
}

function requestHeaders(request, origin) {
  const headers = new Headers(request.headers);
  for (const name of HOP_BY_HOP_HEADERS) headers.delete(name);
  headers.delete('host');
  headers.set('host', new URL(origin).host);
  return headers;
}

function responseHeaders(response) {
  const headers = new Headers(response.headers);
  for (const name of HOP_BY_HOP_HEADERS) headers.delete(name);

  // Cookies must belong to the proxy host, not browser.lol, to work on a custom domain.
  const cookies = typeof headers.getSetCookie === 'function'
    ? headers.getSetCookie()
    : (headers.get('set-cookie') ? [headers.get('set-cookie')] : []);
  if (cookies.length) {
    headers.delete('set-cookie');
    for (const cookie of cookies) {
      headers.append('set-cookie', cookie.replace(/;\s*domain=[^;]+/ig, ''));
    }
  }
  return headers;
}

export default {
  async fetch(request, environment) {
    const origin = upstreamOrigin(environment);
    const target = proxyTarget(request.url, origin);
    const upstreamRequest = new Request(target, {
      method: request.method,
      headers: requestHeaders(request, origin),
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    const upstreamResponse = await fetch(upstreamRequest);
    const headers = responseHeaders(upstreamResponse);
    headers.set('x-proxy-by', 'browser-lol-proxy');
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  },
};

export { proxyTarget, requestHeaders, responseHeaders };
