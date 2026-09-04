import { jsonError, jsonOk } from "@/lib/api-v1/errors";
import {
  PUBLISH_SCOPE_POSTS_READ,
  requirePublishAuth,
} from "@/lib/api-v1/jwt";
import { listTagsForApi } from "@/lib/api-v1/posts-service";

/** List tags for mapping. */
export async function GET(req: Request) {
  try {
    await requirePublishAuth(req, PUBLISH_SCOPE_POSTS_READ);
    const data = await listTagsForApi();
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}
