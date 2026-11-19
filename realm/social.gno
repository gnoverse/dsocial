package social

import (
	"strings"

	"gno.land/p/nt/bptree/v0"
)

var (
	gUserPostsByAddress bptree.BPTree // user's address -> *UserPosts
	gUserAddressByName  bptree.BPTree // user's username -> address
	gPostsByHashtag     bptree.BPTree // hashtag (lowercase, without #) -> *bptree.BPTree of PostID -> *Post
	postsCtr            uint64        // increments Post.id globally

	// gRealmPath is the realm's relative URL path (e.g. "/r/g1.../social"),
	// derived from the deployed package path at init time.
	gRealmPath string
)

func init(cur realm) {
	pkgPath := cur.PkgPath()
	// Strip the chain domain (everything before the first "/") to get the
	// relative path suitable for markdown links: "/r/g1.../social".
	if idx := strings.Index(pkgPath, "/"); idx >= 0 {
		gRealmPath = pkgPath[idx:]
	}
}
