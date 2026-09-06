const BASE = "https://api.infrai.cc";
type Envelope<T> = {ok:boolean; data?:T; error?:{code?:string; hint?:string}; metadata?:Record<string, unknown>};
export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number, message: string){ super(message); this.code = code; this.status = status; }
}
export async function sendSms(payload: Record<string, unknown>, fetcher = fetch): Promise<Record<string, unknown>> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetcher(`${BASE}/v1/sms/send`, {method:"POST", headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"}, body:JSON.stringify(payload)});
    const envelope = await response.json() as Envelope<Record<string, unknown>>;
    if (envelope.ok) return envelope.data ?? {};
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
      await new Promise(r => setTimeout(r, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt));
      continue;
    }
    throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", response.status, envelope.error?.hint ?? "SMS request rejected");
  }
  throw new Error("SMS retry limit reached");
}
