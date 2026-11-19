package social

import (
	"bytes"
	"sort"
	"strconv"
	"strings"
	"time"

	"gno.land/p/moul/txlink/v0"
	"gno.land/p/nt/bptree/v0"
	"gno.land/p/nt/ufmt/v0"
	"gno.land/r/sys/users"
)

type FollowingInfo struct {
	startedFollowingAt time.Time
	startedPostsCtr    PostID
}

// UserPosts is similar to boards.Board where each user has their own "board" for
// posts which come from the user. The list of posts is identified by the user's address .
// A user's "home feed" may contain other posts (from followed users, etc.) but this only
// has the top-level posts from the user (not replies to other user's posts).
type UserPosts struct {
	url           string
	userAddr      address
	threads       bptree.BPTree // PostID -> *Post
	homePosts     bptree.BPTree // PostID -> *Post. Includes this user's threads posts plus posts of users being followed.
	lastRefreshId PostID        // Updated by refreshHomePosts
	followers     bptree.BPTree // address -> ""
	following     bptree.BPTree // address -> *FollowingInfo
}

// Create a new userPosts for the user. Panic if there is already a userPosts for the user.
func newUserPosts(url string, userAddr address) *UserPosts {
	if gUserPostsByAddress.Has(userAddr.String()) {
		panic("userPosts already exists")
	}
	return &UserPosts{
		url:           url,
		userAddr:      userAddr,
		threads:       bptree.BPTree{},
		homePosts:     bptree.BPTree{},
		lastRefreshId: PostID(postsCtr), // Ignore past messages of followed users.
		followers:     bptree.BPTree{},
		following:     bptree.BPTree{},
	}
}

func (userPosts *UserPosts) GetThread(pid PostID) *Post {
	pidkey := postIDKey(pid)
	postI := userPosts.threads.Get(pidkey)
	if postI == nil {
		return nil
	}
	return postI.(*Post)
}

// Add a new top-level thread to the userPosts. Return the new Post.
func (userPosts *UserPosts) addThread(body string) *Post {
	pid := userPosts.incGetPostID()
	pidkey := postIDKey(pid)
	thread := newPost(userPosts, pid, userPosts.userAddr, body, pid, 0, "")
	userPosts.threads.Set(pidkey, thread)
	// Also add to the home posts.
	userPosts.homePosts.Set(pidkey, thread)
	addPostToHashtags(thread)
	return thread
}

// If already following followedAddr, then do nothing and return 0.
// If there is a UserPosts for followedAddr, then add it to following,
// and add this user to its followers.
// If there is no UserPosts for followedAddr, then do nothing and return 0. (We don't expect
// this because this is usually called by clicking on the display page of followedAddr.)
// Return the value of startedPostsCtr in the added FollowingInfo.
func (userPosts *UserPosts) follow(followedAddr address) PostID {
	if userPosts.following.Has(followedAddr.String()) {
		// Already following.
		return PostID(0)
	}

	followedUserPosts := getUserPosts(followedAddr)
	if followedUserPosts != nil {
		userPosts.following.Set(followedAddr.String(), &FollowingInfo{
			startedFollowingAt: time.Now(),
			startedPostsCtr:    PostID(postsCtr), // Ignore past messages.
		})
		followedUserPosts.followers.Set(userPosts.userAddr.String(), "")
		return PostID(postsCtr)
	}

	return PostID(0)
}

// Remove followedAddr from following.
// If there is a UserPosts for followedAddr, then remove this user from its followers.
// If there is no UserPosts for followedAddr, then do nothing. (We don't expect this usually.)
func (userPosts *UserPosts) unfollow(followedAddr address) {
	userPosts.following.Remove(followedAddr.String())

	followedUserPosts := getUserPosts(followedAddr)
	if followedUserPosts != nil {
		followedUserPosts.followers.Remove(userPosts.userAddr.String())
	}
}

// Renders the userPosts for display suitable as plaintext in
// console.  This is suitable for demonstration or tests,
// but not for prod.
func (userPosts *UserPosts) RenderUserPosts(includeFollowed bool) string {
	str := ""
	followers := strconv.Itoa(userPosts.followers.Size()) + " Followers"
	following := "Following " + strconv.Itoa(userPosts.following.Size())
	user := users.ResolveAddress(userPosts.userAddr)
	nameOrAddr := userPosts.userAddr.String()
	if user != nil {
		nameOrAddr = user.Name()
	}
	followers = "[" + followers + "](" + gRealmPath + ":" + nameOrAddr + "/followers)"
	following = "[" + following + "](" + gRealmPath + ":" + nameOrAddr + "/following)"
	str += followers + " &nbsp;" + following + "\n\n"

	str += "\\[[post](" + userPosts.GetPostFormURL() + ")] \\[[follow](" + userPosts.GetFollowFormURL() + ")]"
	if includeFollowed {
		str += " \\[[refresh](" + userPosts.GetRefreshFormURL() + ")]"
	}
	str += "\n\n"

	var posts *bptree.BPTree
	if includeFollowed {
		posts = &userPosts.homePosts
	} else {
		posts = &userPosts.threads
	}
	posts.ReverseIterate("", "", func(key string, postI interface{}) bool {
		str += "----------------------------------------\n"
		str += postI.(*Post).RenderSummary() + "\n"
		return false
	})

	return str
}

func (userPosts *UserPosts) RenderFollowers() string {
	str := ""
	user := users.ResolveAddress(userPosts.userAddr)
	ownerRef := userPosts.userAddr.String()
	if user != nil {
		ownerRef = user.Name()
	}
	str += "[@" + ownerRef + "](" + gRealmPath + ":" + ownerRef + ") Followers\n\n"

	// List the followers, sorted by name/addr.
	names := []string{}
	userPosts.followers.Iterate("", "", func(key string, value interface{}) bool {
		if u := users.ResolveAddress(address(key)); u != nil {
			names = append(names, u.Name())
		} else {
			names = append(names, key)
		}
		return false
	})
	sort.Strings(names)
	for _, name := range names {
		str += " * [@" + name + "](" + gRealmPath + ":" + name + ")" + "\n"
	}

	return str
}

func (userPosts *UserPosts) RenderFollowing() string {
	str := ""
	user := users.ResolveAddress(userPosts.userAddr)
	ownerRef := userPosts.userAddr.String()
	if user != nil {
		ownerRef = user.Name()
	}
	str += "[@" + ownerRef + "](" + gRealmPath + ":" + ownerRef + ") Following\n\n"

	// List the following, sorted by name/addr.
	nameAddrs := []string{}
	userPosts.following.Iterate("", "", func(addr string, infoI interface{}) bool {
		info := infoI.(*FollowingInfo)
		ref := addr
		if u := users.ResolveAddress(address(addr)); u != nil {
			ref = u.Name()
		}
		nameAddrs = append(nameAddrs, ref+"/"+addr+"/"+info.startedFollowingAt.Format("2006-01-02"))
		return false
	})
	sort.Strings(nameAddrs)
	for _, nameAddr := range nameAddrs {
		parts := strings.Split(nameAddr, "/")
		name := parts[0]
		addr := parts[1]
		since := parts[2]
		str += " * [@" + name + "](" + gRealmPath + ":" + name + ") since " + since +
			"  \\[[unfollow](" + userPosts.GetUnfollowFormURL(address(addr)) + ")]\n"
	}

	return str
}

func (userPosts *UserPosts) incGetPostID() PostID {
	postsCtr++
	return PostID(postsCtr)
}

func (userPosts *UserPosts) GetURLFromThreadAndReplyID(threadID, replyID PostID) string {
	if replyID == 0 {
		return userPosts.url + "/" + threadID.String()
	} else {
		return userPosts.url + "/" + threadID.String() + "/" + replyID.String()
	}
}

func (userPosts *UserPosts) GetPostFormURL() string {
	return txlink.Call("PostMessage")
}

func (userPosts *UserPosts) GetFollowFormURL() string {
	return txlink.Call("Follow", "followedAddr", userPosts.userAddr.String())
}

func (userPosts *UserPosts) GetUnfollowFormURL(followedAddr address) string {
	return txlink.Call("Unfollow", "followedAddr", followedAddr.String())
}

func (userPosts *UserPosts) GetRefreshFormURL() string {
	return txlink.Call("RefreshHomePosts", "userPostsAddr", userPosts.userAddr.String())
}

// Scan userPosts.following for all posts from all followed users starting from lastRefreshId+1 .
// Add the posts to the homePosts bptree.BPTree, which is sorted by the post ID which is unique for every post and
// increases in time. When finished, update lastRefreshId.
func (userPosts *UserPosts) refreshHomePosts() {
	minStartKey := postIDKey(userPosts.lastRefreshId + 1)

	userPosts.following.Iterate("", "", func(followedAddr string, infoI interface{}) bool {
		followedUserPosts := getUserPosts(address(followedAddr))
		if followedUserPosts == nil {
			return false
		}

		info := infoI.(*FollowingInfo)
		startKey := minStartKey
		if info.startedPostsCtr > userPosts.lastRefreshId {
			// Started following after the last refresh. Ignore messages before started following.
			startKey = postIDKey(info.startedPostsCtr + 1)
		}

		followedUserPosts.threads.Iterate(startKey, "", func(id string, postI interface{}) bool {
			userPosts.homePosts.Set(id, postI.(*Post))
			return false
		})

		return false
	})

	userPosts.lastRefreshId = PostID(postsCtr)
}

// MarshalJSON implements the json.Marshaler interface.
func (userPosts *UserPosts) MarshalJSON() ([]byte, error) {
	json := new(bytes.Buffer)
	json.WriteString(ufmt.Sprintf(`{"address": "%s", "url": %s, "n_threads": %d, "n_followers": %d, "n_following": %d}`,
		userPosts.userAddr.String(), strconv.Quote(userPosts.url), userPosts.threads.Size(),
		userPosts.followers.Size(), userPosts.following.Size()))

	return json.Bytes(), nil
}
