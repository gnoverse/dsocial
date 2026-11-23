package social

import (
	"strings"
	"testing"

	"gno.land/p/nt/bptree/v0"
	"gno.land/p/nt/ufmt/v0"
)

func TestPostLookups(t *testing.T) {
	addr := address("g1jg8mtutu9khhfwc4nxmuhcpftf0pajdhfvsqf5")
	if getUserPosts(addr) != nil {
		t.Fatal("unexpected posts for an unknown user")
	}
	userPosts := getOrCreateUserPosts(addr, "alice")
	if getUserPosts(addr) != userPosts {
		t.Fatal("stored user posts were not found")
	}
	if userPosts.GetThread(1) != nil {
		t.Fatal("unexpected thread in an empty user feed")
	}
	thread := userPosts.addThread("Hello")
	if userPosts.GetThread(thread.id) != thread {
		t.Fatal("stored thread was not found")
	}
	if thread.GetReply(thread.id+1) != nil {
		t.Fatal("unexpected reply in an empty thread")
	}
	reply := thread.addReply(addr, "Reply")
	if thread.GetReply(reply.id) != reply {
		t.Fatal("stored reply was not found")
	}
}

func TestParseHashtags(t *testing.T) {
	tests := []struct {
		body string
		want []string
	}{
		{"", nil},
		{"no tags here", nil},
		{"#gno", []string{"gno"}},
		{"Hello #Gno and #dSocial!", []string{"gno", "dsocial"}},
		{"#a #A #a", []string{"a"}},
		{"(#paren) [#bracket], #comma,", []string{"paren", "bracket", "comma"}},
		{"line1\n#next_line", []string{"next_line"}},
		{"#café #日本 #v2", []string{"café", "日本", "v2"}},
		{"#foo#bar", []string{"foo"}},
		{"#don't #Bob’s '#quoted'", []string{"don", "bob", "quoted"}},
		{"issue #1 and #_ and # alone and #", nil},
		{"a#b &#39; /#anchor ##double", nil},
		{"# Heading\n## Sub", nil},
	}
	for _, tc := range tests {
		got := parseHashtags(tc.body)
		if len(got) != len(tc.want) {
			t.Fatalf("parseHashtags(%q) = %v, want %v", tc.body, got, tc.want)
		}
		for i := range got {
			if got[i] != tc.want[i] {
				t.Fatalf("parseHashtags(%q) = %v, want %v", tc.body, got, tc.want)
			}
		}
	}

	userPosts := newUserPosts("/r/berty/social:alice", address("alice"))
	thread := userPosts.addThread("Hello #gno")
	reply := thread.addReply(address("bob"), "Reply #dsocial")
	if len(thread.hashtags) != 1 || thread.hashtags[0] != "gno" {
		t.Fatalf("thread hashtags = %v, want [gno]", thread.hashtags)
	}
	if len(reply.hashtags) != 1 || reply.hashtags[0] != "dsocial" {
		t.Fatalf("reply hashtags = %v, want [dsocial]", reply.hashtags)
	}
}

func TestLinkHashtags(t *testing.T) {
	tag := gRealmPath + ":_tag/"
	gno := "[#gno](" + tag + "gno)"
	tests := []struct {
		body string
		want string
	}{
		{"", ""},
		{"no tags here", "no tags here"},
		{"#Gno", "[#Gno](" + tag + "gno)"},
		{"Hi #gno, #1 and a#b #日本!", "Hi [#gno](" + tag + "gno), #1 and a#b [#日本](" + tag + "日本)!"},
		{"line1\n#next_line end", "line1\n[#next_line](" + tag + "next_line) end"},
		{"(#paren) #gno", "([#paren](" + tag + "paren)) " + gno},

		// Leave a hashtag as is in a code span or fence, link text, or a link destination or title.
		{"[Search](https://example.com?q=#gno) #gno", "[Search](https://example.com?q=#gno) " + gno},
		{"Use `#gno` or #gno", "Use `#gno` or " + gno},
		{"```go\n#include `x`\n\n#gno\n```\n#gno", "```go\n#include `x`\n\n#gno\n```\n" + gno},
		{"[about #gno](https://gno.land) ![#gno](https://gno.land/a.png) #gno",
			"[about #gno](https://gno.land) ![#gno](https://gno.land/a.png) " + gno},
		{"[a](https://gno.land \"t #gno\") #gno", "[a](https://gno.land \"t #gno\") " + gno},
		{"[w](https://en.wikipedia.org/wiki/Foo_(bar)#x) #gno", "[w](https://en.wikipedia.org/wiki/Foo_(bar)#x) " + gno},
		{"[#bracket] #gno", "[#bracket] " + gno},
		// "\#" is an escaped '#', but "\\" is an escaped '\'.
		{"\\#gno \\\\#gno", "\\#gno \\\\" + gno},
		{"\\`#gno \\[#gno", "\\`" + gno + " \\[" + gno},
		// A link after '!' would be an image.
		{"Wow!#gno", "Wow!#gno"},
		// Unbalanced delimiters leave the hashtags after them as is.
		{"a [ b #gno", "a [ b #gno"},
		{"a ` b #gno", "a ` b #gno"},
	}
	for _, tc := range tests {
		if got := linkHashtags(tc.body, len(tc.body), nil); got != tc.want {
			t.Fatalf("linkHashtags(%q) = %q, want %q", tc.body, got, tc.want)
		}
	}

	// sanitize.Block in RenderPost keeps the link.
	userPosts := newUserPosts("/r/berty/social:alice", address("alice"))
	thread := userPosts.addThread("#Hello there")
	if out := thread.RenderPost("", 0); !strings.Contains(out, "[#Hello]("+tag+"hello) there") {
		t.Fatalf("RenderPost does not link the hashtag:\n%s", out)
	}

	// sanitize.Block in RenderPost keeps the link, and the Markdown around it.
	body := "[Search](https://example.com?q=#gno) `#gno` #gno\n```\n#gno\n```"
	thread = userPosts.addThread(body)
	want := "[Search](https://example.com?q=#gno) `#gno` " + gno + "\n```\n#gno\n```"
	if out := thread.RenderPost("", 0); !strings.Contains(out, want) {
		t.Fatalf("RenderPost does not preserve the Markdown:\n%s", out)
	}
}

func TestSummary(t *testing.T) {
	// Don't cut a multi-byte character.
	if got, want := summaryOf(strings.Repeat("a", 76)+"日本", 80), strings.Repeat("a", 76)+"..."; got != want {
		t.Fatalf("summaryOf = %q, want %q", got, want)
	}

	tag := gRealmPath + ":_tag/"
	a70 := strings.Repeat("a", 70)
	tests := []struct {
		body string
		want string
	}{
		{"Hi #gno, a_b *c*", "Hi [\\#gno](" + tag + "gno), a\\_b \\*c\\*"},
		// The hashtag on the second line is not in the summary.
		{"#Gno\nmore #line", "[\\#Gno](" + tag + "gno)\\.\\.\\."},
		// The cut at 77 bytes is right after "#gnoxx", which ends there, so link it.
		{a70 + " #gnoxx rocks", a70 + " [\\#gnoxx](" + tag + "gnoxx)\\.\\.\\."},
		// The cut is in "#gnoland", so don't link it to "gnola".
		{a70 + " #gnoland rocks", a70 + " \\#gnola\\.\\.\\."},
		// The cut is between the characters of "#日本", so don't link it to "日".
		{a70 + "aa #日本 rocks", a70 + "aa \\#日\\.\\.\\."},
	}
	userPosts := newUserPosts("/r/berty/social:alice", address("alice"))
	for _, tc := range tests {
		thread := userPosts.addThread(tc.body)
		if got := thread.summaryMD(); got != tc.want {
			t.Fatalf("summaryMD of %q = %q, want %q", tc.body, got, tc.want)
		}
		if out := thread.RenderSummary(); !strings.HasPrefix(out, tc.want+"\n") {
			t.Fatalf("RenderSummary of %q does not start with the summary:\n%s", tc.body, out)
		}
	}
}

func TestPostsByHashtag(t *testing.T) {
	alice := newUserPosts("/r/berty/social:alice", address("alice"))
	bob := newUserPosts("/r/berty/social:bob", address("bob"))
	thread := alice.addThread("Thread #Topic #other")
	reply := thread.addReply(address("bob"), "Reply #topic")
	repost := thread.addRepostTo(address("bob"), "Repost #topic", bob)
	alice.addThread("No tags")

	checkPosts := func(hashtag string, want []*Post) {
		postsI := gPostsByHashtag.Get(hashtag)
		if postsI == nil {
			t.Fatalf("no posts for hashtag %q", hashtag)
		}
		posts := postsI.(*bptree.BPTree)
		if posts.Size() != len(want) {
			t.Fatalf("hashtag %q has %d posts, want %d", hashtag, posts.Size(), len(want))
		}
		for i, post := range want {
			key, postI := posts.GetByIndex(i)
			if key != postIDKey(post.id) || postI.(*Post) != post {
				t.Fatalf("hashtag %q post %d is %s, want %s", hashtag, i, key, postIDKey(post.id))
			}
		}
	}
	checkPosts("topic", []*Post{thread, reply, repost})
	checkPosts("other", []*Post{thread})
	if gPostsByHashtag.Get("Topic") != nil || gPostsByHashtag.Get("missing") != nil {
		t.Fatal("unexpected posts for a hashtag")
	}
}

// A reply in GetHashtagPosts must have the user_posts_addr and thread_id to open it with
// GetThreadPosts, even when the reply's creator has never posted a thread.
func TestHashtagReplyJSON(t *testing.T) {
	alice := address("g1hashtagalice")
	bob := address("g1hashtagbob")
	thread := getOrCreateUserPosts(alice, "hashtagalice").addThread("Thread #ReplyJSON")
	reply := thread.addReply(bob, "Reply #ReplyJSON")
	reply.addReply(alice, "Sub reply")

	out := GetHashtagPosts("replyjson", 0, 10)
	for _, want := range []string{
		ufmt.Sprintf(`"creator": "%s", "user_posts_addr": "%s", "thread_id": %d,`, alice, alice, uint64(thread.id)),
		ufmt.Sprintf(`"creator": "%s", "user_posts_addr": "%s", "thread_id": %d,`, bob, alice, uint64(thread.id)),
	} {
		if !strings.Contains(out, want) {
			t.Fatalf("GetHashtagPosts does not contain %q:\n%s", want, out)
		}
	}

	// Open the reply the way the mobile app does, which shows the reply's sub replies.
	out = GetThreadPosts(alice, int(thread.id), int(reply.id), 0, 10)
	if !strings.Contains(out, `"n_threads": 1,`) || !strings.Contains(out, "Sub reply") {
		t.Fatalf("GetThreadPosts for the reply does not have the sub reply:\n%s", out)
	}
}

func TestRenderHashtagPosts(t *testing.T) {
	carol := newUserPosts("/r/berty/social:carol", address("carol"))
	// One more than a page, so that the oldest post is on page 2.
	for i := 1; i <= hashtagPageSize+1; i++ {
		carol.addThread("Post " + padZero(uint64(i), 2) + " #PageTest")
	}

	checkRender := func(path string, want []string, notWant []string) {
		out := Render(path)
		for _, s := range want {
			if !strings.Contains(out, s) {
				t.Fatalf("Render(%q) does not contain %q:\n%s", path, s, out)
			}
		}
		for _, s := range notWant {
			if strings.Contains(out, s) {
				t.Fatalf("Render(%q) contains %q:\n%s", path, s, out)
			}
		}
	}
	// Page 1 is newest first, and links to page 2.
	checkRender("_tag/pagetest", []string{"Posts with #pagetest", "Post 21", "Post 02", "?page=2"}, []string{"Post 01"})
	checkRender("_tag/PageTest", []string{"Post 21"}, nil)
	checkRender("_tag/pagetest?page=2", []string{"Post 01"}, []string{"Post 02"})
	// "?size=" is ignored.
	checkRender("_tag/pagetest?size=100", []string{"Post 02"}, []string{"Post 01"})
	checkRender("_tag/missing", []string{"No posts with hashtag: missing"}, nil)
}

func TestReactionLookups(t *testing.T) {
	userPosts := newUserPosts("/r/berty/social:alice", address("alice"))
	thread := userPosts.addThread("Hello")
	if thread.GetReactionCount(Gnod) != 0 {
		t.Fatal("unexpected reactions on a new post")
	}
	if !thread.addReaction(address("bob"), Gnod) {
		t.Fatal("first reaction was not added")
	}
	if thread.addReaction(address("bob"), Gnod) {
		t.Fatal("duplicate reaction was added")
	}
	if thread.GetReactionCount(Gnod) != 1 {
		t.Fatal("stored reaction was not counted")
	}
	if !thread.removeReaction(address("bob"), Gnod) || thread.GetReactionCount(Gnod) != 0 {
		t.Fatal("reaction was not removed")
	}
}
