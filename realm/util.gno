package social

import (
	"std"
	"strconv"
	"strings"

	"gno.land/p/demo/avl"
	"gno.land/p/demo/ufmt"
	"gno.land/r/sys/users"
)

//----------------------------------------
// private utility methods

// Get the UserPosts for the user.
func getUserPosts(userAddr std.Address) *UserPosts {
	userPosts, exists := gUserPostsByAddress.Get(userAddr.String())
	if !exists {
		return nil
	}

	return userPosts.(*UserPosts)
}

// Get the UserPosts for the userAddr. If not found, add a new UserPosts to
// gUserPostsByAddress and update gUserAddressByName with the username.
// (The caller usually has already called usernameOf to get the username, but if
// it is "" then this will get it.)
func getOrCreateUserPosts(userAddr std.Address, username string) *UserPosts {
	userPosts := getUserPosts(userAddr)
	if userPosts != nil {
		return userPosts
	}

	if username == "" {
		username := usernameOf(userAddr)
		if username == "" {
			panic("no username for address " + userAddr.String())
		}
	}

	userPosts = newUserPosts("/r/berty/social:"+username, userAddr)
	gUserPostsByAddress.Set(userAddr.String(), userPosts)
	gUserAddressByName.Set(username, userAddr)

	return userPosts
}

func padZero(u64 uint64, length int) string {
	str := strconv.Itoa(int(u64))
	if len(str) >= length {
		return str
	} else {
		return strings.Repeat("0", length-len(str)) + str
	}
}

func postIDKey(pid PostID) string {
	return padZero(uint64(pid), 10)
}

func reactionKey(reaction Reaction) string {
	return strconv.Itoa(int(reaction))
}

// If reactions has an value for the given reaction, then return it.
// Otherwise, add the reaction key to reactions, set the value to an empty avl.Tree and return it.
func getOrCreateReactionValue(reactions *avl.Tree, reaction Reaction) *avl.Tree {
	key := reactionKey(reaction)
	valueI, exists := reactions.Get(key)
	if exists {
		return valueI.(*avl.Tree)
	} else {
		value := avl.NewTree()
		reactions.Set(key, value)
		return value
	}
}

func indentBody(indent string, body string) string {
	lines := strings.Split(body, "\n")
	res := ""
	for i, line := range lines {
		if i > 0 {
			res += "\n"
		}
		res += indent + line
	}
	return res
}

// NOTE: length must be greater than 3.
func summaryOf(str string, length int) string {
	lines := strings.SplitN(str, "\n", 2)
	line := lines[0]
	if len(line) > length {
		line = line[:(length-3)] + "..."
	} else if len(lines) > 1 {
		// len(line) <= 80
		line = line + "..."
	}
	return line
}

func displayAddressMD(addr std.Address) string {
	user := users.ResolveAddress(addr)
	if user == nil {
		return "[" + addr.String() + "](/r/gnoland/users/v1:" + addr.String() + ")"
	} else {
		return "[@" + user.Name() + "](/r/berty/social:" + user.Name() + ")"
	}
}

func usernameOf(addr std.Address) string {
	user := users.ResolveAddress(addr)
	if user == nil {
		return ""
	} else {
		return user.Name()
	}
}

// Return the User info as a JSON string.
// (This is a temporary utility until gno.land supports returning structured data directly.)
func marshalJsonUser(user *users.UserData) string {
	return ufmt.Sprintf(
		"{\"address\": \"%s\", \"name\": \"%s\", \"deleted\": %t}",
		user.Addr().String(), user.Name(), user.IsDeleted())
}
