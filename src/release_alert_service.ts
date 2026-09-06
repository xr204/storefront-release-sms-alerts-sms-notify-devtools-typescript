import { z } from "zod";
import { sendSms, InfraiError } from "./infrai_sms.js";

export const releaseEvent = z.object({releaseId:z.string().min(1), environment:z.enum(["staging","production"]), status:z.enum(["started","succeeded","failed"]), phone:z.string().min(7)});
export type ReleaseEvent = z.infer<typeof releaseEvent>;
export function alertBody(event: ReleaseEvent): string {
  return `[${event.environment}] release ${event.releaseId} ${event.status}`;
}
export async function notifyRelease(input: unknown) {
  const event = releaseEvent.parse(input);
  // The domain call is the documented sms.send capability.
  return sendSms({to:event.phone, body:alertBody(event), idempotency_key:`release:${event.releaseId}:${event.status}`});
}

if (process.argv[1]?.endsWith("release_alert_service.ts")) {
  const raw = process.env.RELEASE_EVENT;
  if (!raw) throw new Error('RELEASE_EVENT must contain JSON, for example {"releaseId":"web-42","environment":"production","status":"succeeded","phone":"+15551234567"}');
  notifyRelease(JSON.parse(raw)).then(result => console.log(JSON.stringify({sent:true,result}))).catch(error => {
    if (error instanceof InfraiError) { console.error(JSON.stringify({sent:false,status:error.status,code:error.code})); process.exitCode = error.status >= 400 && error.status < 500 ? 2 : 1; }
    else { console.error(error); process.exitCode = 1; }
  });
}
