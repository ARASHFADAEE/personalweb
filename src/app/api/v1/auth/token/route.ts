import { jsonError, jsonOk, ApiError } from "@/lib/api-v1/errors";
import {
  signPublishAccessToken,
  verifyClientCredentials,
} from "@/lib/api-v1/jwt";
import { clientIp, rateLimit } from "@/lib/api-v1/rate-limit";

/**
 * Machine-to-machine token endpoint.
 * POST { client_id, client_secret } → { access_token, token_type, expires_in }
 */
export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const limited = rateLimit({
      key: `v1:token:${ip}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!limited.ok) {
      throw new ApiError(429, "RATE_LIMITED", "تعداد درخواست‌ها بیش از حد مجاز است");
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "INVALID_JSON", "بدنه درخواست JSON معتبر نیست");
    }

    const clientId = String(body.client_id ?? body.clientId ?? "").trim();
    const clientSecret = String(body.client_secret ?? body.clientSecret ?? "").trim();
    if (!clientId || !clientSecret) {
      throw new ApiError(
        400,
        "MISSING_CREDENTIALS",
        "client_id و client_secret الزامی هستند"
      );
    }

    verifyClientCredentials(clientId, clientSecret);
    const token = await signPublishAccessToken();

    return jsonOk({
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.expiresIn,
      scope: "posts:write posts:read",
    });
  } catch (error) {
    return jsonError(error);
  }
}
