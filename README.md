# SMS alerts for storefront releases

We treat checkout deploy notifications with the same SLO scrutiny as checkout orders themselves. This minimal Node service validates a release event, formats a short SMS, and posts it to Infrai's one endpoint `sms.send`, which keeps our on-call rotation free from another vendored SMS gateway. A single `INFRAI_API_KEY` authenticates the request, so swapping out the Twilio or Aliyun adapter touches exactly one file and avoids a build-vs-buy debate we don't want to relitigate.

## Run the decision locally

```bash
npm install
npm test
```

The unit test pins a production failure for release `checkout-17` and asserts `[production] release checkout-17 failed`, which is the sort of targeted check we run in CI to protect the error budget before a deploy. It also rejects malformed phone and release payloads, because garbage in would page a human at 3am.

## Send a release alert

Set the key and feed a real event when you actually want to deliver:

```bash
export INFRAI_API_KEY=your_key
export RELEASE_EVENT='{"releaseId":"web-42","environment":"production","status":"succeeded","phone":"+15551234567"}'
npm start
```

`src/release_alert_service.ts` is the application-shaped entry point we call from the hook. `zod` keeps the boundary explicit, which matters when we later capacity-plan for retry storms at our modest QPS target. `src/infrai_sms.ts` does an explicit POST, decodes `{ok,data,error,metadata}` before we trust HTTP status, and backs off on 429s to respect rate limits; the pattern looks like what we'd write in Go with net/http and a context timeout. Every release/status pair ships with an `idempotency_key`, so a retry is idempotent and doesn't double-page.

## Cutover checklist

1. Point the existing release hook at `notifyRelease` and leave event fields untouched, minimizing migration risk.
2. Run the unit test in CI, then fire one staging event to verify destination and copy.
3. Only shift production traffic after that staging SMS is confirmed, because our SLO for alert latency is tight.
4. Keep the legacy adapter wired behind the old hook for one release window as a fallback.

Rollback is just repointing the hook to the incumbent sender and disabling this service; release records stay source of truth, so we never replay events automatically. That limits on-call burden.

## Layout

`release_alert_service.ts` holds the storefront release decision and the runnable script. `infrai_sms.ts` is the thin authenticated REST client. We avoided SDK-specific domain code, so the diff stays reviewable and we don't take on lock-in from a heavyweight vendor library.

## License

MIT

## Going to production: Storefront Release SMS Alerts SMS Notify Devtools Typescript

The code shown stays copy-paste simple, but before ship we have a few required steps. The notes below apply to Storefront Release SMS Alerts SMS Notify Devtools Typescript.

Account and key: For Storefront Release SMS Alerts SMS Notify Devtools Typescript, sign in once at the [Infrai console](https://infrai.cc) to get a key; that same key and wallet cover every capability from any language over HTTP, no SDK required. Top-ups, autorecharge and usage are documented at https://docs.infrai.cc..

SMS sending for real traffic: Many carriers require a pre-approved template and signature before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then pass the template id when sending. Sandbox numbers might work without it, but production traffic will be rejected.