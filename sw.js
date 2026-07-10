/*
 * GAF On-Chain Renderer - service worker
 *
 * Network-level IPFS gateway fallback. The in-page loadImage shim covers p5
 * image loads, but some projects load assets through mechanisms no in-frame
 * script can intercept: dynamic import() (language syntax, not wrappable),
 * and library-internal fetches (e.g. ONNX Runtime pulling WASM and model
 * files). This worker intercepts every GET the renderer frame makes and,
 * when a request for an /ipfs/ path fails against the artist's hardcoded
 * gateway, retries the same content-addressed path against the gateway the
 * chain nominates for that token (tokenData.preferredIPFSGateway, relayed
 * by the parent page via postMessage on each load).
 *
 * Semantics: artist gateway FIRST, preferred gateway only on failure.
 * At the network layer this is trivial and robust - none of the p5-internals
 * fragility that applies to in-frame retry exists here.
 *
 * Scope and guarantees:
 *  - Only /ipfs/<CID> paths. /ipns/ and non-IPFS URLs pass through.
 *  - Only fires when the current token's on-chain data nominates a
 *    preferred gateway. Otherwise every request passes through untouched.
 *  - Requests already on the preferred gateway pass through.
 *  - Opaque (no-cors cross-origin) responses pass through uninspected -
 *    their status is not readable, so no retry judgment is possible.
 *  - Every substitution is logged for preservation telemetry.
 */

let preferredGateway = null;

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', function (event) {
  const d = event.data || {};
  if (d.type === 'gaf:preferred-gateway') {
    if (typeof d.gateway === 'string' && d.gateway.length > 0) {
      preferredGateway = d.gateway.replace(/\/+$/, '');
    } else {
      preferredGateway = null;
    }
    try { console.info('[gaf sw] preferred gateway set:', preferredGateway); } catch (e) {}
  }
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') return;
  if (!preferredGateway) return;

  const url = req.url;
  const k = url.indexOf('/ipfs/');
  if (k === -1) return;
  if (url.indexOf(preferredGateway + '/') === 0) return;

  event.respondWith(handleIpfs(req, url, k));
});

async function handleIpfs(req, url, k) {
  let original = null;
  let originalError = null;
  try {
    original = await fetch(req);
    // Opaque responses hide their status; pass through uninspected.
    if (original.type === 'opaque') return original;
    if (original.ok) return original;
  } catch (e) {
    originalError = e;
  }

  // Original gateway failed (network error or 4xx/5xx). Retry the same
  // content-addressed path against the chain-nominated preferred gateway.
  const alt = preferredGateway + '/' + url.slice(k + 6);
  try {
    const retried = await fetch(alt, {
      mode: req.mode,
      credentials: 'omit',
      redirect: 'follow'
    });
    try { console.info('[gaf sw] gateway substitution:', url, '->', alt); } catch (e) {}
    return retried;
  } catch (retryError) {
    // Preferred gateway also failed. Surface the original outcome so the
    // artwork sees the same failure it would have without the worker.
    if (original) return original;
    throw originalError || retryError;
  }
}
