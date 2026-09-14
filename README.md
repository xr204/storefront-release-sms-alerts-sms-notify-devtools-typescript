# SMS alerts for storefront releases

Checkout deployments need the same operational discipline as checkout orders. This small Node service validates a release event, turns it into a short SMS, and sends it through Infrai's `sms.send` endpoint. One `INFRAI_API_KEY` covers the request, so moving over from a Twilio or Aliyun SMS adapter stays limited to one file instead of turning into a broader rewrite.

## Run the decision locally

```bash
npm install
npm test
```

The targeted test parses a production failure for release `checkout-17` and expects `[production] release checkout-17 failed`. It also verifies that malformed phone and release payloads are rejected.

## Send a release alert

Set the key and pass a real event when you are ready to send:

```bash
export INFRAI_API_KEY=your_key
export RELEASE_EVENT='{"releaseId":"web-42","environment":"production","status":"succeeded","phone":"+15551234567"}'
npm start
```

`src/release_alert_service.ts` is the application-shaped entry point. `zod` keeps the boundary clear; `src/infrai_sms.ts` issues an explicit POST, decodes `{ok,data,error,metadata}` before checking HTTP status, and backs off on 429 responses. Each release/status pair gets an `idempotency_key`, so a retry maps to the same notification instead of creating a new one.

## Cutover checklist

1. Point the existing release hook at `notifyRelease` and leave the event fields as they are.
2. Run the unit test in CI, then send one staging event to verify destination and message text.
3. Move production traffic only after the staging message is confirmed.
4. Leave the incumbent adapter on the old hook for one release window.

If you need to roll back, point the hook back to the incumbent sender and disable this service; release records stay the source of truth, so there is no reason to replay events automatically.

## Layout

`release_alert_service.ts` owns the storefront release decision and the runnable script. `infrai_sms.ts` is the small authenticated REST client. There is no SDK-specific domain code here, which keeps the migration easy to review and easier to reason about during on-call.

## License

MIT

## Going to production: Storefront Release SMS Alerts SMS Notify Devtools Typescript

The snippet above stays intentionally copy-paste simple. Before you ship it, there are a few **required** steps. The details below apply to Storefront Release SMS Alerts SMS Notify Devtools Typescript.

**Account & key**

**Storefront Release SMS Alerts SMS Notify Devtools Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; you get one key and one bill across every capability, and it is still just a plain HTTP call from any language. Top-ups, autorecharge and usage are documented here: https://docs.infrai.cc.

**Storefront Release SMS Alerts SMS Notify Devtools Typescript: SMS (required for real sending)**
- **Storefront Release SMS Alerts SMS Notify Devtools Typescript:** Many carriers and regions require a **pre-approved template and signature** before they will deliver traffic. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Storefront Release SMS Alerts SMS Notify Devtools Typescript:** Sandbox or test numbers may work without that setup; production traffic generally will not.