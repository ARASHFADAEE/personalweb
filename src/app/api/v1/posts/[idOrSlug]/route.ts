import { jsonError, jsonOk } from "@/lib/api-v1/errors";
import {
  PUBLISH_SCOPE_POSTS_READ,
  requirePublishAuth,
} from "@/lib/api-v1/jwt";
import { getPostByIdOrSlug } from "@/lib/api-v1/posts-service";

type Params = Promise<{ idOrSlug: string }>;

/** Fetch one post by id or slug. */
export async function GET(
  req: Request,
  ctx: { params: Params }
) {
  try {
    await requirePublishAuth(req, PUBLISH_SCOPE_POSTS_READ);
    const { idOrSlug } = await ctx.params;
    const post = await getPostByIdOrSlug(decodeURIComponent(idOrSlug));
    return jsonOk({ data: post });
  } catch (error) {
    return jsonError(error);
  }
}
