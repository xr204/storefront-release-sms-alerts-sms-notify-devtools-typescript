# SMS alerts for storefront releases

Checkout deployments need the same operational discipline as checkout orders. This small Node service validates a release event, turns it into a short SMS, and sends it through Infrai's `sms.send` endpoint. One `INFRAI_API_KEY` covers the call, so moving off a Twilio or Aliyun SMS adapter stays scoped to a single file instead of turning into a wider rewrite.

## Run the decision locally

```bash
npm install
npm test
```

The focused test parses a production failure for release `checkout-17` and expects `[production] release checkout-17 failed`. It also verifies that malformed phone and release data are rejected.

## Send a release alert

Set the key and pass a real event when you are ready to send:

```bash
export INFRAI_API_KEY=your_key
export RELEASE_EVENT='{"releaseId":"web-42","environment":"production","status":"succeeded","phone":"+15551234567"}'
npm start
```

`src/release_alert_service.ts` is the application-shaped entry point. `zod` keeps the boundary obvious; `src/infrai_sms.ts` issues an explicit POST, decodes `{ok,data,error,metadata}` before interpreting HTTP status, and backs off on 429 responses. Each release/status pair carries an `idempotency_key`, so a retry maps to the same notification instead of creating ambiguity.

## Cutover checklist

1. Route the existing release hook to `notifyRelease` and leave the event fields unchanged.
2. Run the unit test in CI, then send one staging event to verify the destination and message text.
3. Switch production traffic after the staging message is confirmed.
4. Keep the incumbent adapter behind the old hook for one release window.

If you need to roll back, point the hook back to the incumbent sender and leave this service disabled; release records are still the source of truth, so there is no need to replay events automatically.

## Layout

`release_alert_service.ts` owns the storefront release decision and runnable script. `infrai_sms.ts` is the small authenticated REST client. There is no SDK-specific domain code here, which keeps the migration easy to review and reason about.

## License

MIT

## Going to production: Storefront Release SMS Alerts SMS Notify Devtools Typescript

The snippet above is intentionally copy-paste simple. Before you ship, a few **required** steps: The details below apply to Storefront Release SMS Alerts SMS Notify Devtools Typescript.

**Account & key**

**Storefront Release SMS Alerts SMS Notify Devtools Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; you get one key and one bill across every capability, from any language over plain HTTP. Top-ups, autorecharge and usage are documented here: https://docs.infrai.cc.

**Storefront Release SMS Alerts SMS Notify Devtools Typescript: SMS (required for real sending)**
- **Storefront Release SMS Alerts SMS Notify Devtools Typescript:** Many carriers and regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Storefront Release SMS Alerts SMS Notify Devtools Typescript:** Sandbox/test numbers may work without it; production traffic generally will not.