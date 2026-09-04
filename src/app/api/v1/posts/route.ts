import { jsonError, jsonOk, ApiError } from "@/lib/api-v1/errors";
import {
  PUBLISH_SCOPE_POSTS_WRITE,
  requirePublishAuth,
} from "@/lib/api-v1/jwt";
import { clientIp, rateLimit } from "@/lib/api-v1/rate-limit";
import {
  createOrUpsertPost,
  publishPostBodySchema,
} from "@/lib/api-v1/posts-service";

/** Create or upsert a blog post (Bearer JWT required). */
export async function POST(req: Request) {
  try {
    await requirePublishAuth(req, PUBLISH_SCOPE_POSTS_WRITE);

    const ip = clientIp(req);
    const limited = rateLimit({
      key: `v1:posts:${ip}`,
      limit: 60,
      windowMs: 60_000,
    });
    if (!limited.ok) {
      throw new ApiError(429, "RATE_LIMITED", "تعداد درخواست‌ها بیش از حد مجاز است");
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      throw new ApiError(400, "INVALID_JSON", "بدنه درخواست JSON معتبر نیست");
    }

    const parsed = publishPostBodySchema.safeParse(raw);
    if (!parsed.success) {
      throw new ApiError(422, "VALIDATION_ERROR", "داده‌ی ورودی نامعتبر است", {
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    const result = await createOrUpsertPost(parsed.data);
    return jsonOk(
      {
        data: result.post,
        meta: { created: result.created },
      },
      result.created ? 201 : 200
    );
  } catch (error) {
    return jsonError(error);
  }
}
