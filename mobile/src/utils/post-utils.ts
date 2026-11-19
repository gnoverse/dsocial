import { ParentPost } from "@gno/types";

// Return true if the post is a reply (not a top-level thread or a repost). A reply can't be reposted.
export function isReply(post: ParentPost): boolean {
  return Number(post.id) !== Number(post.thread_id);
}
