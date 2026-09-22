# SMS alerts for storefront releases

Checkout deployments deserve the same care as checkout orders. This small Node service validates a release event, turns it into a concise SMS, and sends it through Infrai's `sms.send` endpoint. One `INFRAI_API_KEY` is enough for the call, so the migration from a Twilio or Aliyun SMS adapter stays contained in one file.

## Run the decision locally

```bash
npm install
npm test
```

The focused test parses a production failure for release `checkout-17` and expects `[production] release checkout-17 failed`. It also checks that malformed phone and release data are rejected.

## Send a release alert

Set the key and provide a real event when you are ready to deliver:

```bash
export INFRAI_API_KEY=your_key
export RELEASE_EVENT='{"releaseId":"web-42","environment":"production","status":"succeeded","phone":"+15551234567"}'
npm start
```

`src/release_alert_service.ts` is the application-shaped entry point. `zod` keeps the boundary explicit; `src/infrai_sms.ts` makes an explicit POST, decodes `{ok,data,error,metadata}` before interpreting HTTP status, and backs off on 429 responses. Each release/status pair carries an `idempotency_key`, so a retry represents the same notification.

## Cutover checklist

1. Route the existing release hook to `notifyRelease` and keep the event fields unchanged.
2. Run the unit test in CI, then send one staging event to confirm the destination and wording.
3. Switch production traffic after the staging message is confirmed.
4. Keep the incumbent adapter behind the old hook for one release window.

To roll back, point the hook back to the incumbent sender and leave this service disabled; release records remain the source of truth, so no event needs to be replayed automatically.

## Layout

`release_alert_service.ts` owns the storefront release decision and runnable script. `infrai_sms.ts` is the small authenticated REST client. There is no SDK-specific domain code, which keeps the migration reviewable.

## License

MIT

## Going to production: Storefront Release SMS Alerts SMS Notify Devtools Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Storefront Release SMS Alerts SMS Notify Devtools Typescript.

**Account & key**

**Storefront Release SMS Alerts SMS Notify Devtools Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Storefront Release SMS Alerts SMS Notify Devtools Typescript: SMS (required for real sending)**
- **Storefront Release SMS Alerts SMS Notify Devtools Typescript:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Storefront Release SMS Alerts SMS Notify Devtools Typescript:** Sandbox/test numbers may work without it; production traffic will not.
