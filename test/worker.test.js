import test from 'node:test';
import assert from 'node:assert/strict';
import { proxyTarget, requestHeaders, responseHeaders } from '../src/worker.js';

test('forwards every request path and query string to the configured upstream', () => {
  assert.equal(
    proxyTarget('https://proxy.example/en/pricing?currency=USD', 'https://browser.lol').href,
    'https://browser.lol/en/pricing?currency=USD',
  );
  assert.equal(
    proxyTarget('https://proxy.example/arbitrary/path', 'https://browser.lol').href,
    'https://browser.lol/arbitrary/path',
  );
});

test('uses the upstream host and removes hop-by-hop request headers', () => {
  const headers = requestHeaders(new Request('https://proxy.example/en/create', {
    headers: { connection: 'keep-alive', host: 'proxy.example', cookie: 'a=b' },
  }), 'https://browser.lol');
  assert.equal(headers.get('host'), 'browser.lol');
  assert.equal(headers.get('connection'), null);
  assert.equal(headers.get('cookie'), 'a=b');
});

test('removes upstream cookie domains and hop-by-hop response headers', () => {
  const headers = responseHeaders(new Response('ok', {
    headers: { 'set-cookie': 'session=abc; Domain=browser.lol; Path=/; Secure', connection: 'close' },
  }));
  assert.match(headers.get('set-cookie'), /^session=abc; Path=\/; Secure$/);
  assert.equal(headers.get('connection'), null);
});
