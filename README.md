# browser.lol proxy worker

A Cloudflare Worker reverse proxy for all browser.lol paths. It forwards every request it receives to the matching path on the configured browser.lol upstream, preserving the method and query string. It deliberately **does not** inject, modify, or remove browser.lol UI, account requirements, paid-feature prompts, advertisements, or access controls.

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

Every request path is sent upstream while retaining query strings and request methods. Upstream cookie `Domain` attributes are removed so cookies can be stored on the custom proxy host.
