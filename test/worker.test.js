import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedPath, requestHeaders, responseHeaders } from '../src/worker.js';

test('only exposes the requested pages and their required static assets', () => {
  assert.equal(isAllowedPath('/en/create'), true);
  assert.equal(isAllowedPath('/en/viewer'), true);
  assert.equal(isAllowedPath('/_next/static/chunks/main.js'), true);
  assert.equal(isAllowedPath('/img/logo.svg'), true);
  assert.equal(isAllowedPath('/en/pricing'), false);
  assert.equal(isAllowedPath('/'), false);
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
