import assert from "node:assert/strict";
import { alertBody, releaseEvent } from "./release_alert_service.js";
const event = releaseEvent.parse({releaseId:"checkout-17",environment:"production",status:"failed",phone:"+15551234567"});
assert.equal(alertBody(event), "[production] release checkout-17 failed");
assert.throws(() => releaseEvent.parse({releaseId:"",environment:"production",status:"failed",phone:"+1"}));
console.log("release decision test passed");
