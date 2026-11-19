package social

import (
	"strconv"
	"strings"

	"gno.land/p/nt/bptree/pager/v0"
	"gno.land/p/nt/bptree/v0"
	"gno.land/p/nt/markdown/sanitize/v0"
	"gno.land/r/sys/users"
)

// The number of posts on each page of a hashtag's posts.
const hashtagPageSize = 20

// resolveAddr looks up an address by registered name first, then falls back
// to treating the input as a raw address. This allows unregistered users to
// be found by their address string.
func resolveAddr(nameOrAddr string) address {
	user, _ := users.ResolveName(nameOrAddr)
	if user != nil {
		return user.Addr()
	}
	return address(nameOrAddr)
}

// Render the posts with the hashtag, newest first. rawPath may have a query like "?page=2".
func renderHashtagPosts(rawPath string, hashtag string) string {
	hashtag = strings.ToLower(hashtag)
	postsI := gPostsByHashtag.Get(hashtag)
	if postsI == nil {
		return "No posts with hashtag: " + sanitize.InlineText(hashtag)
	}

	p := pager.NewPager(postsI.(*bptree.BPTree), hashtagPageSize, true)
	// Don't allow "?size=", which could make one page with all the posts.
	p.SizeQueryParam = ""
	page, err := p.GetPageByPath(rawPath)
	if err != nil {
		return "invalid path: " + sanitize.InlineText(rawPath)
	}

	str := "Posts with #" + sanitize.InlineText(hashtag) + "\n\n"
	for _, item := range page.Items {
		str += "----------------------------------------\n"
		str += item.Value.(*Post).RenderSummary() + "\n"
	}
	if picker := page.Picker(rawPath); picker != "" {
		str += "----------------------------------------\n"
		str += picker + "\n"
	}
	return str
}

func Render(rawPath string) string {
	// Remove a query like "?page=2". (Only paginated pages use it.)
	path, _, _ := strings.Cut(rawPath, "?")
	if path == "" {
		str := "Welcome to dSocial!\n\n"

		// List the users who have posted. gUserAddressByName is already sorted by name.
		gUserAddressByName.Iterate("", "", func(name string, value interface{}) bool {
			str += " * [@" + name + "](" + gRealmPath + ":" + name + ")" + "\n"
			return false
		})

		return str
	}

	parts := strings.Split(path, "/")
	if len(parts) == 2 && parts[0] == "_tag" {
		// /r/berty/social:_tag/HASHTAG
		return renderHashtagPosts(rawPath, parts[1])
	}

	if len(parts) == 1 {
		// /r/berty/social:USER_NAME_OR_ADDR
		userAddr := resolveAddr(path)
		userPosts := getUserPosts(userAddr)
		if userPosts == nil {
			return "No posts by: " + sanitize.InlineText(path)
		}

		return userPosts.RenderUserPosts(false)
	} else if len(parts) == 2 {
		userAddr := resolveAddr(parts[0])
		userPosts := getUserPosts(userAddr)
		if userPosts == nil {
			return "No posts by: " + sanitize.InlineText(parts[0])
		}

		if parts[1] == "home" {
			// /r/berty/social:USER_NAME_OR_ADDR/home
			return userPosts.RenderUserPosts(true)
		} else if parts[1] == "followers" {
			// /r/berty/social:USER_NAME_OR_ADDR/followers
			return userPosts.RenderFollowers()
		} else if parts[1] == "following" {
			// /r/berty/social:USER_NAME_OR_ADDR/following
			return userPosts.RenderFollowing()
		} else {
			// /r/berty/social:USER_NAME_OR_ADDR/THREAD_ID
			pid, err := strconv.Atoi(parts[1])
			if err != nil {
				return "invalid thread id: " + sanitize.InlineText(parts[1])
			}
			thread := userPosts.GetThread(PostID(pid))
			if thread == nil {
				return "thread does not exist with id: " + sanitize.InlineText(parts[1])
			}
			return thread.RenderPost("", 5)
		}
	} else if len(parts) == 3 {
		// /r/berty/social:USER_NAME_OR_ADDR/THREAD_ID/REPLY_ID
		userAddr := resolveAddr(parts[0])
		userPosts := getUserPosts(userAddr)
		if userPosts == nil {
			return "No posts by: " + sanitize.InlineText(parts[0])
		}
		pid, err := strconv.Atoi(parts[1])
		if err != nil {
			return "invalid thread id: " + sanitize.InlineText(parts[1])
		}
		thread := userPosts.GetThread(PostID(pid))
		if thread == nil {
			return "thread does not exist with id: " + sanitize.InlineText(parts[1])
		}
		rid, err := strconv.Atoi(parts[2])
		if err != nil {
			return "invalid reply id: " + sanitize.InlineText(parts[2])
		}
		reply := thread.GetReply(PostID(rid))
		if reply == nil {
			return "reply does not exist with id: " + sanitize.InlineText(parts[2])
		}
		return reply.RenderInner()
	} else {
		return "unrecognized path: " + sanitize.InlineText(path)
	}
}
