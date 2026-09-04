import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { randomUUID } from "crypto";
import { ApiError, safeEqual } from "@/lib/api-v1/errors";

export const PUBLISH_JWT_ISS = "fadaee-dev-publish-api";
export const PUBLISH_JWT_AUD = "fadaee-dev-publish-clients";
export const PUBLISH_SCOPE_POSTS_WRITE = "posts:write";
export const PUBLISH_SCOPE_POSTS_READ = "posts:read";

export type PublishTokenClaims = JWTPayload & {
  sub: string;
  scope: string;
  client_id: string;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new ApiError(
      503,
      "API_NOT_CONFIGURED",
      `متغیر محیطی ${name} تنظیم نشده است`
    );
  }
  return value;
}

export function getJwtSecretKey(): Uint8Array {
  const secret = requireEnv("PUBLISH_API_JWT_SECRET");
  if (secret.length < 32) {
    throw new ApiError(
      503,
      "API_NOT_CONFIGURED",
      "PUBLISH_API_JWT_SECRET باید حداقل ۳۲ کاراکتر باشد"
    );
  }
  return new TextEncoder().encode(secret);
}

export function getPublishClientCredentials(): {
  clientId: string;
  clientSecret: string;
} {
  return {
    clientId: requireEnv("PUBLISH_API_CLIENT_ID"),
    clientSecret: requireEnv("PUBLISH_API_CLIENT_SECRET"),
  };
}

export function verifyClientCredentials(
  clientId: string,
  clientSecret: string
): void {
  const expected = getPublishClientCredentials();
  const idOk = safeEqual(clientId, expected.clientId);
  const secretOk = safeEqual(clientSecret, expected.clientSecret);
  if (!idOk || !secretOk) {
    throw new ApiError(401, "INVALID_CLIENT", "client_id یا client_secret نامعتبر است");
  }
}

export async function signPublishAccessToken(opts?: {
  ttlSeconds?: number;
  scopes?: string[];
}): Promise<{ accessToken: string; expiresIn: number; tokenType: "Bearer" }> {
  const ttl =
    opts?.ttlSeconds ??
    Number(process.env.PUBLISH_API_TOKEN_TTL_SECONDS || 900);
  const expiresIn = Number.isFinite(ttl) && ttl > 60 ? Math.min(ttl, 3600) : 900;
  const scopes = opts?.scopes ?? [
    PUBLISH_SCOPE_POSTS_WRITE,
    PUBLISH_SCOPE_POSTS_READ,
  ];
  const { clientId } = getPublishClientCredentials();
  const key = getJwtSecretKey();

  const accessToken = await new SignJWT({
    client_id: clientId,
    scope: scopes.join(" "),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(PUBLISH_JWT_ISS)
    .setAudience(PUBLISH_JWT_AUD)
    .setSubject(clientId)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(key);

  return { accessToken, expiresIn, tokenType: "Bearer" };
}

export async function verifyPublishAccessToken(
  token: string
): Promise<PublishTokenClaims> {
  const key = getJwtSecretKey();
  try {
    const { payload } = await jwtVerify(token, key, {
      issuer: PUBLISH_JWT_ISS,
      audience: PUBLISH_JWT_AUD,
      algorithms: ["HS256"],
    });

    if (typeof payload.sub !== "string" || !payload.sub) {
      throw new ApiError(401, "INVALID_TOKEN", "توکن نامعتبر است");
    }

    const scope =
      typeof payload.scope === "string" ? payload.scope : "";

    return {
      ...payload,
      sub: payload.sub,
      scope,
      client_id:
        typeof payload.client_id === "string" ? payload.client_id : payload.sub,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, "INVALID_TOKEN", "توکن نامعتبر یا منقضی شده است");
  }
}

export function requireScope(claims: PublishTokenClaims, scope: string): void {
  const granted = new Set(claims.scope.split(/\s+/).filter(Boolean));
  if (!granted.has(scope)) {
    throw new ApiError(403, "INSUFFICIENT_SCOPE", `دسترسی لازم: ${scope}`);
  }
}

export function extractBearerToken(req: Request): string {
  const header = req.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match?.[1]) {
    throw new ApiError(
      401,
      "MISSING_TOKEN",
      "هدر Authorization با Bearer JWT الزامی است"
    );
  }
  return match[1].trim();
}

export async function requirePublishAuth(
  req: Request,
  scope: string
): Promise<PublishTokenClaims> {
  const token = extractBearerToken(req);
  const claims = await verifyPublishAccessToken(token);
  requireScope(claims, scope);
  return claims;
}
