# browser.lol proxy worker

A narrowly scoped Cloudflare Worker reverse proxy for these browser.lol routes:

- `/en/create`
- `/en/viewer`

It proxies the upstream response transparently, including required Next.js assets and images. It deliberately **does not** inject, modify, or remove browser.lol UI, account requirements, paid-feature prompts, advertisements, or access controls.

## Deploy

1. Install dependencies: `npm install`
2. Authenticate Cloudflare: `npx wrangler login`
3. Set your Worker name in `wrangler.toml` if needed.
4. Deploy: `npx wrangler deploy`
5. Attach a custom domain in the Cloudflare dashboard if desired.

The `UPSTREAM_ORIGIN` variable defaults to `https://browser.lol`; retain HTTPS and point it only to the intended upstream.

## Local checks

```sh
npm test
npm run check
```

## Route behavior

Requests to the two supported pages, Next.js assets (`/_next/`), logo and favicon assets are sent upstream while retaining query strings and request methods. Other paths return `404` to keep the proxy scope explicit. Upstream cookie `Domain` attributes are removed so cookies can be stored on the custom proxy host.
