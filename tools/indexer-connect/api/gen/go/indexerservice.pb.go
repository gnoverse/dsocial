// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.33.0
// 	protoc        (unknown)
// source: indexerservice.proto

package _go

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

// The ErrCode enum defines errors for gRPC API functions. These are converted
// from the Go error types returned by gnoclient.
type ErrCode int32

const (
	// Undefined is the default value. It should never be set manually
	ErrCode_Undefined ErrCode = 0
	// TODO indicates that you plan to create an error later
	ErrCode_TODO ErrCode = 1
	// ErrNotImplemented indicates that a method is not implemented yet
	ErrCode_ErrNotImplemented ErrCode = 2
	// ErrInternal indicates an unknown error (without Code), i.e. in gRPC
	ErrCode_ErrInternal        ErrCode = 3
	ErrCode_ErrInvalidInput    ErrCode = 100
	ErrCode_ErrMissingInput    ErrCode = 101
	ErrCode_ErrSerialization   ErrCode = 102
	ErrCode_ErrDeserialization ErrCode = 103
	ErrCode_ErrInitService     ErrCode = 104
	ErrCode_ErrRunGRPCServer   ErrCode = 105
)

// Enum value maps for ErrCode.
var (
	ErrCode_name = map[int32]string{
		0:   "Undefined",
		1:   "TODO",
		2:   "ErrNotImplemented",
		3:   "ErrInternal",
		100: "ErrInvalidInput",
		101: "ErrMissingInput",
		102: "ErrSerialization",
		103: "ErrDeserialization",
		104: "ErrInitService",
		105: "ErrRunGRPCServer",
	}
	ErrCode_value = map[string]int32{
		"Undefined":          0,
		"TODO":               1,
		"ErrNotImplemented":  2,
		"ErrInternal":        3,
		"ErrInvalidInput":    100,
		"ErrMissingInput":    101,
		"ErrSerialization":   102,
		"ErrDeserialization": 103,
		"ErrInitService":     104,
		"ErrRunGRPCServer":   105,
	}
)

func (x ErrCode) Enum() *ErrCode {
	p := new(ErrCode)
	*p = x
	return p
}

func (x ErrCode) String() string {
	return protoimpl.X.EnumStringOf(x.Descriptor(), protoreflect.EnumNumber(x))
}

func (ErrCode) Descriptor() protoreflect.EnumDescriptor {
	return file_indexerservice_proto_enumTypes[0].Descriptor()
}

func (ErrCode) Type() protoreflect.EnumType {
	return &file_indexerservice_proto_enumTypes[0]
}

func (x ErrCode) Number() protoreflect.EnumNumber {
	return protoreflect.EnumNumber(x)
}

// Deprecated: Use ErrCode.Descriptor instead.
func (ErrCode) EnumDescriptor() ([]byte, []int) {
	return file_indexerservice_proto_rawDescGZIP(), []int{0}
}

type GetHomePostsRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	UserPostAddr string `protobuf:"bytes,1,opt,name=userPostAddr,json=UserPostAddr,proto3" json:"userPostAddr,omitempty"`
	StartIndex   uint64 `protobuf:"varint,2,opt,name=startIndex,json=StartIndex,proto3" json:"startIndex,omitempty"`
	EndIndex     uint64 `protobuf:"varint,3,opt,name=endIndex,json=EndIndex,proto3" json:"endIndex,omitempty"`
}

func (x *GetHomePostsRequest) Reset() {
	*x = GetHomePostsRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_indexerservice_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetHomePostsRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetHomePostsRequest) ProtoMessage() {}

func (x *GetHomePostsRequest) ProtoReflect() protoreflect.Message {
	mi := &file_indexerservice_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetHomePostsRequest.ProtoReflect.Descriptor instead.
func (*GetHomePostsRequest) Descriptor() ([]byte, []int) {
	return file_indexerservice_proto_rawDescGZIP(), []int{0}
}

func (x *GetHomePostsRequest) GetUserPostAddr() string {
	if x != nil {
		return x.UserPostAddr
	}
	return ""
}

func (x *GetHomePostsRequest) GetStartIndex() uint64 {
	if x != nil {
		return x.StartIndex
	}
	return 0
}

func (x *GetHomePostsRequest) GetEndIndex() uint64 {
	if x != nil {
		return x.EndIndex
	}
	return 0
}

type UserPost struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	UserPostAddr string `protobuf:"bytes,1,opt,name=userPostAddr,json=UserPostAddr,proto3" json:"userPostAddr,omitempty"`
	PostId       uint64 `protobuf:"varint,2,opt,name=postId,json=PostId,proto3" json:"postId,omitempty"`
}

func (x *UserPost) Reset() {
	*x = UserPost{}
	if protoimpl.UnsafeEnabled {
		mi := &file_indexerservice_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *UserPost) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*UserPost) ProtoMessage() {}

func (x *UserPost) ProtoReflect() protoreflect.Message {
	mi := &file_indexerservice_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use UserPost.ProtoReflect.Descriptor instead.
func (*UserPost) Descriptor() ([]byte, []int) {
	return file_indexerservice_proto_rawDescGZIP(), []int{1}
}

func (x *UserPost) GetUserPostAddr() string {
	if x != nil {
		return x.UserPostAddr
	}
	return ""
}

func (x *UserPost) GetPostId() uint64 {
	if x != nil {
		return x.PostId
	}
	return 0
}

type GetHomePostsResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	UserPosts []*UserPost `protobuf:"bytes,1,rep,name=userPosts,json=UserPosts,proto3" json:"userPosts,omitempty"`
}

func (x *GetHomePostsResponse) Reset() {
	*x = GetHomePostsResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_indexerservice_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetHomePostsResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetHomePostsResponse) ProtoMessage() {}

func (x *GetHomePostsResponse) ProtoReflect() protoreflect.Message {
	mi := &file_indexerservice_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetHomePostsResponse.ProtoReflect.Descriptor instead.
func (*GetHomePostsResponse) Descriptor() ([]byte, []int) {
	return file_indexerservice_proto_rawDescGZIP(), []int{2}
}

func (x *GetHomePostsResponse) GetUserPosts() []*UserPost {
	if x != nil {
		return x.UserPosts
	}
	return nil
}

type HelloRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name string `protobuf:"bytes,1,opt,name=name,json=Name,proto3" json:"name,omitempty"`
}

func (x *HelloRequest) Reset() {
	*x = HelloRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_indexerservice_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *HelloRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*HelloRequest) ProtoMessage() {}

func (x *HelloRequest) ProtoReflect() protoreflect.Message {
	mi := &file_indexerservice_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use HelloRequest.ProtoReflect.Descriptor instead.
func (*HelloRequest) Descriptor() ([]byte, []int) {
	return file_indexerservice_proto_rawDescGZIP(), []int{3}
}

func (x *HelloRequest) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

type HelloResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Greeting string `protobuf:"bytes,1,opt,name=greeting,json=Greeting,proto3" json:"greeting,omitempty"`
}

func (x *HelloResponse) Reset() {
	*x = HelloResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_indexerservice_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *HelloResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*HelloResponse) ProtoMessage() {}

func (x *HelloResponse) ProtoReflect() protoreflect.Message {
	mi := &file_indexerservice_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use HelloResponse.ProtoReflect.Descriptor instead.
func (*HelloResponse) Descriptor() ([]byte, []int) {
	return file_indexerservice_proto_rawDescGZIP(), []int{4}
}

func (x *HelloResponse) GetGreeting() string {
	if x != nil {
		return x.Greeting
	}
	return ""
}

type HelloStreamRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name string `protobuf:"bytes,1,opt,name=name,json=Name,proto3" json:"name,omitempty"`
}

func (x *HelloStreamRequest) Reset() {
	*x = HelloStreamRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_indexerservice_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *HelloStreamRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*HelloStreamRequest) ProtoMessage() {}

func (x *HelloStreamRequest) ProtoReflect() protoreflect.Message {
	mi := &file_indexerservice_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use HelloStreamRequest.ProtoReflect.Descriptor instead.
func (*HelloStreamRequest) Descriptor() ([]byte, []int) {
	return file_indexerservice_proto_rawDescGZIP(), []int{5}
}

func (x *HelloStreamRequest) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

type HelloStreamResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Greeting string `protobuf:"bytes,1,opt,name=greeting,json=Greeting,proto3" json:"greeting,omitempty"`
}

func (x *HelloStreamResponse) Reset() {
	*x = HelloStreamResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_indexerservice_proto_msgTypes[6]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *HelloStreamResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*HelloStreamResponse) ProtoMessage() {}

func (x *HelloStreamResponse) ProtoReflect() protoreflect.Message {
	mi := &file_indexerservice_proto_msgTypes[6]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use HelloStreamResponse.ProtoReflect.Descriptor instead.
func (*HelloStreamResponse) Descriptor() ([]byte, []int) {
	return file_indexerservice_proto_rawDescGZIP(), []int{6}
}

func (x *HelloStreamResponse) GetGreeting() string {
	if x != nil {
		return x.Greeting
	}
	return ""
}

type ErrDetails struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Codes []ErrCode `protobuf:"varint,1,rep,packed,name=codes,proto3,enum=land.gno.gnosocial.indexerservice.v1.ErrCode" json:"codes,omitempty"`
}

func (x *ErrDetails) Reset() {
	*x = ErrDetails{}
	if protoimpl.UnsafeEnabled {
		mi := &file_indexerservice_proto_msgTypes[7]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ErrDetails) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ErrDetails) ProtoMessage() {}

func (x *ErrDetails) ProtoReflect() protoreflect.Message {
	mi := &file_indexerservice_proto_msgTypes[7]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ErrDetails.ProtoReflect.Descriptor instead.
func (*ErrDetails) Descriptor() ([]byte, []int) {
	return file_indexerservice_proto_rawDescGZIP(), []int{7}
}

func (x *ErrDetails) GetCodes() []ErrCode {
	if x != nil {
		return x.Codes
	}
	return nil
}

var File_indexerservice_proto protoreflect.FileDescriptor

var file_indexerservice_proto_rawDesc = []byte{
	0x0a, 0x14, 0x69, 0x6e, 0x64, 0x65, 0x78, 0x65, 0x72, 0x73, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65,
	0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x24, 0x6c, 0x61, 0x6e, 0x64, 0x2e, 0x67, 0x6e, 0x6f,
	0x2e, 0x67, 0x6e, 0x6f, 0x73, 0x6f, 0x63, 0x69, 0x61, 0x6c, 0x2e, 0x69, 0x6e, 0x64, 0x65, 0x78,
	0x65, 0x72, 0x73, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x2e, 0x76, 0x31, 0x22, 0x75, 0x0a, 0x13,
	0x47, 0x65, 0x74, 0x48, 0x6f, 0x6d, 0x65, 0x50, 0x6f, 0x73, 0x74, 0x73, 0x52, 0x65, 0x71, 0x75,
	0x65, 0x73, 0x74, 0x12, 0x22, 0x0a, 0x0c, 0x75, 0x73, 0x65, 0x72, 0x50, 0x6f, 0x73, 0x74, 0x41,
	0x64, 0x64, 0x72, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0c, 0x55, 0x73, 0x65, 0x72, 0x50,
	0x6f, 0x73, 0x74, 0x41, 0x64, 0x64, 0x72, 0x12, 0x1e, 0x0a, 0x0a, 0x73, 0x74, 0x61, 0x72, 0x74,
	0x49, 0x6e, 0x64, 0x65, 0x78, 0x18, 0x02, 0x20, 0x01, 0x28, 0x04, 0x52, 0x0a, 0x53, 0x74, 0x61,
	0x72, 0x74, 0x49, 0x6e, 0x64, 0x65, 0x78, 0x12, 0x1a, 0x0a, 0x08, 0x65, 0x6e, 0x64, 0x49, 0x6e,
	0x64, 0x65, 0x78, 0x18, 0x03, 0x20, 0x01, 0x28, 0x04, 0x52, 0x08, 0x45, 0x6e, 0x64, 0x49, 0x6e,
	0x64, 0x65, 0x78, 0x22, 0x46, 0x0a, 0x08, 0x55, 0x73, 0x65, 0x72, 0x50, 0x6f, 0x73, 0x74, 0x12,
	0x22, 0x0a, 0x0c, 0x75, 0x73, 0x65, 0x72, 0x50, 0x6f, 0x73, 0x74, 0x41, 0x64, 0x64, 0x72, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0c, 0x55, 0x73, 0x65, 0x72, 0x50, 0x6f, 0x73, 0x74, 0x41,
	0x64, 0x64, 0x72, 0x12, 0x16, 0x0a, 0x06, 0x70, 0x6f, 0x73, 0x74, 0x49, 0x64, 0x18, 0x02, 0x20,
	0x01, 0x28, 0x04, 0x52, 0x06, 0x50, 0x6f, 0x73, 0x74, 0x49, 0x64, 0x22, 0x64, 0x0a, 0x14, 0x47,
	0x65, 0x74, 0x48, 0x6f, 0x6d, 0x65, 0x50, 0x6f, 0x73, 0x74, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f,
	0x6e, 0x73, 0x65, 0x12, 0x4c, 0x0a, 0x09, 0x75, 0x73, 0x65, 0x72, 0x50, 0x6f, 0x73, 0x74, 0x73,
	0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x2e, 0x2e, 0x6c, 0x61, 0x6e, 0x64, 0x2e, 0x67, 0x6e,
	0x6f, 0x2e, 0x67, 0x6e, 0x6f, 0x73, 0x6f, 0x63, 0x69, 0x61, 0x6c, 0x2e, 0x69, 0x6e, 0x64, 0x65,
	0x78, 0x65, 0x72, 0x73, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x2e, 0x76, 0x31, 0x2e, 0x55, 0x73,
	0x65, 0x72, 0x50, 0x6f, 0x73, 0x74, 0x52, 0x09, 0x55, 0x73, 0x65, 0x72, 0x50, 0x6f, 0x73, 0x74,
	0x73, 0x22, 0x22, 0x0a, 0x0c, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73,
	0x74, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x04, 0x4e, 0x61, 0x6d, 0x65, 0x22, 0x2b, 0x0a, 0x0d, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x52, 0x65,
	0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x1a, 0x0a, 0x08, 0x67, 0x72, 0x65, 0x65, 0x74, 0x69,
	0x6e, 0x67, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x47, 0x72, 0x65, 0x65, 0x74, 0x69,
	0x6e, 0x67, 0x22, 0x28, 0x0a, 0x12, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x53, 0x74, 0x72, 0x65, 0x61,
	0x6d, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65,
	0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x4e, 0x61, 0x6d, 0x65, 0x22, 0x31, 0x0a, 0x13,
	0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x53, 0x74, 0x72, 0x65, 0x61, 0x6d, 0x52, 0x65, 0x73, 0x70, 0x6f,
	0x6e, 0x73, 0x65, 0x12, 0x1a, 0x0a, 0x08, 0x67, 0x72, 0x65, 0x65, 0x74, 0x69, 0x6e, 0x67, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x47, 0x72, 0x65, 0x65, 0x74, 0x69, 0x6e, 0x67, 0x22,
	0x51, 0x0a, 0x0a, 0x45, 0x72, 0x72, 0x44, 0x65, 0x74, 0x61, 0x69, 0x6c, 0x73, 0x12, 0x43, 0x0a,
	0x05, 0x63, 0x6f, 0x64, 0x65, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0e, 0x32, 0x2d, 0x2e, 0x6c,
	0x61, 0x6e, 0x64, 0x2e, 0x67, 0x6e, 0x6f, 0x2e, 0x67, 0x6e, 0x6f, 0x73, 0x6f, 0x63, 0x69, 0x61,
	0x6c, 0x2e, 0x69, 0x6e, 0x64, 0x65, 0x78, 0x65, 0x72, 0x73, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65,
	0x2e, 0x76, 0x31, 0x2e, 0x45, 0x72, 0x72, 0x43, 0x6f, 0x64, 0x65, 0x52, 0x05, 0x63, 0x6f, 0x64,
	0x65, 0x73, 0x2a, 0xcc, 0x01, 0x0a, 0x07, 0x45, 0x72, 0x72, 0x43, 0x6f, 0x64, 0x65, 0x12, 0x0d,
	0x0a, 0x09, 0x55, 0x6e, 0x64, 0x65, 0x66, 0x69, 0x6e, 0x65, 0x64, 0x10, 0x00, 0x12, 0x08, 0x0a,
	0x04, 0x54, 0x4f, 0x44, 0x4f, 0x10, 0x01, 0x12, 0x15, 0x0a, 0x11, 0x45, 0x72, 0x72, 0x4e, 0x6f,
	0x74, 0x49, 0x6d, 0x70, 0x6c, 0x65, 0x6d, 0x65, 0x6e, 0x74, 0x65, 0x64, 0x10, 0x02, 0x12, 0x0f,
	0x0a, 0x0b, 0x45, 0x72, 0x72, 0x49, 0x6e, 0x74, 0x65, 0x72, 0x6e, 0x61, 0x6c, 0x10, 0x03, 0x12,
	0x13, 0x0a, 0x0f, 0x45, 0x72, 0x72, 0x49, 0x6e, 0x76, 0x61, 0x6c, 0x69, 0x64, 0x49, 0x6e, 0x70,
	0x75, 0x74, 0x10, 0x64, 0x12, 0x13, 0x0a, 0x0f, 0x45, 0x72, 0x72, 0x4d, 0x69, 0x73, 0x73, 0x69,
	0x6e, 0x67, 0x49, 0x6e, 0x70, 0x75, 0x74, 0x10, 0x65, 0x12, 0x14, 0x0a, 0x10, 0x45, 0x72, 0x72,
	0x53, 0x65, 0x72, 0x69, 0x61, 0x6c, 0x69, 0x7a, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x10, 0x66, 0x12,
	0x16, 0x0a, 0x12, 0x45, 0x72, 0x72, 0x44, 0x65, 0x73, 0x65, 0x72, 0x69, 0x61, 0x6c, 0x69, 0x7a,
	0x61, 0x74, 0x69, 0x6f, 0x6e, 0x10, 0x67, 0x12, 0x12, 0x0a, 0x0e, 0x45, 0x72, 0x72, 0x49, 0x6e,
	0x69, 0x74, 0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x10, 0x68, 0x12, 0x14, 0x0a, 0x10, 0x45,
	0x72, 0x72, 0x52, 0x75, 0x6e, 0x47, 0x52, 0x50, 0x43, 0x53, 0x65, 0x72, 0x76, 0x65, 0x72, 0x10,
	0x69, 0x32, 0x91, 0x03, 0x0a, 0x0e, 0x49, 0x6e, 0x64, 0x65, 0x78, 0x65, 0x72, 0x53, 0x65, 0x72,
	0x76, 0x69, 0x63, 0x65, 0x12, 0x85, 0x01, 0x0a, 0x0c, 0x47, 0x65, 0x74, 0x48, 0x6f, 0x6d, 0x65,
	0x50, 0x6f, 0x73, 0x74, 0x73, 0x12, 0x39, 0x2e, 0x6c, 0x61, 0x6e, 0x64, 0x2e, 0x67, 0x6e, 0x6f,
	0x2e, 0x67, 0x6e, 0x6f, 0x73, 0x6f, 0x63, 0x69, 0x61, 0x6c, 0x2e, 0x69, 0x6e, 0x64, 0x65, 0x78,
	0x65, 0x72, 0x73, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x2e, 0x76, 0x31, 0x2e, 0x47, 0x65, 0x74,
	0x48, 0x6f, 0x6d, 0x65, 0x50, 0x6f, 0x73, 0x74, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74,
	0x1a, 0x3a, 0x2e, 0x6c, 0x61, 0x6e, 0x64, 0x2e, 0x67, 0x6e, 0x6f, 0x2e, 0x67, 0x6e, 0x6f, 0x73,
	0x6f, 0x63, 0x69, 0x61, 0x6c, 0x2e, 0x69, 0x6e, 0x64, 0x65, 0x78, 0x65, 0x72, 0x73, 0x65, 0x72,
	0x76, 0x69, 0x63, 0x65, 0x2e, 0x76, 0x31, 0x2e, 0x47, 0x65, 0x74, 0x48, 0x6f, 0x6d, 0x65, 0x50,
	0x6f, 0x73, 0x74, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x70, 0x0a, 0x05,
	0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x12, 0x32, 0x2e, 0x6c, 0x61, 0x6e, 0x64, 0x2e, 0x67, 0x6e, 0x6f,
	0x2e, 0x67, 0x6e, 0x6f, 0x73, 0x6f, 0x63, 0x69, 0x61, 0x6c, 0x2e, 0x69, 0x6e, 0x64, 0x65, 0x78,
	0x65, 0x72, 0x73, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x2e, 0x76, 0x31, 0x2e, 0x48, 0x65, 0x6c,
	0x6c, 0x6f, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x33, 0x2e, 0x6c, 0x61, 0x6e, 0x64,
	0x2e, 0x67, 0x6e, 0x6f, 0x2e, 0x67, 0x6e, 0x6f, 0x73, 0x6f, 0x63, 0x69, 0x61, 0x6c, 0x2e, 0x69,
	0x6e, 0x64, 0x65, 0x78, 0x65, 0x72, 0x73, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x2e, 0x76, 0x31,
	0x2e, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x84,
	0x01, 0x0a, 0x0b, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x53, 0x74, 0x72, 0x65, 0x61, 0x6d, 0x12, 0x38,
	0x2e, 0x6c, 0x61, 0x6e, 0x64, 0x2e, 0x67, 0x6e, 0x6f, 0x2e, 0x67, 0x6e, 0x6f, 0x73, 0x6f, 0x63,
	0x69, 0x61, 0x6c, 0x2e, 0x69, 0x6e, 0x64, 0x65, 0x78, 0x65, 0x72, 0x73, 0x65, 0x72, 0x76, 0x69,
	0x63, 0x65, 0x2e, 0x76, 0x31, 0x2e, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x53, 0x74, 0x72, 0x65, 0x61,
	0x6d, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x39, 0x2e, 0x6c, 0x61, 0x6e, 0x64, 0x2e,
	0x67, 0x6e, 0x6f, 0x2e, 0x67, 0x6e, 0x6f, 0x73, 0x6f, 0x63, 0x69, 0x61, 0x6c, 0x2e, 0x69, 0x6e,
	0x64, 0x65, 0x78, 0x65, 0x72, 0x73, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x2e, 0x76, 0x31, 0x2e,
	0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x53, 0x74, 0x72, 0x65, 0x61, 0x6d, 0x52, 0x65, 0x73, 0x70, 0x6f,
	0x6e, 0x73, 0x65, 0x30, 0x01, 0x42, 0x45, 0x5a, 0x3d, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e,
	0x63, 0x6f, 0x6d, 0x2f, 0x67, 0x6e, 0x6f, 0x6c, 0x61, 0x6e, 0x67, 0x2f, 0x67, 0x6e, 0x6f, 0x73,
	0x6f, 0x63, 0x69, 0x61, 0x6c, 0x2f, 0x74, 0x6f, 0x6f, 0x6c, 0x73, 0x2f, 0x69, 0x6e, 0x64, 0x65,
	0x78, 0x65, 0x72, 0x2d, 0x63, 0x6f, 0x6e, 0x6e, 0x65, 0x63, 0x74, 0x2f, 0x61, 0x70, 0x69, 0x2f,
	0x67, 0x65, 0x6e, 0x2f, 0x67, 0x6f, 0xa2, 0x02, 0x03, 0x52, 0x54, 0x47, 0x62, 0x06, 0x70, 0x72,
	0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_indexerservice_proto_rawDescOnce sync.Once
	file_indexerservice_proto_rawDescData = file_indexerservice_proto_rawDesc
)

func file_indexerservice_proto_rawDescGZIP() []byte {
	file_indexerservice_proto_rawDescOnce.Do(func() {
		file_indexerservice_proto_rawDescData = protoimpl.X.CompressGZIP(file_indexerservice_proto_rawDescData)
	})
	return file_indexerservice_proto_rawDescData
}

var file_indexerservice_proto_enumTypes = make([]protoimpl.EnumInfo, 1)
var file_indexerservice_proto_msgTypes = make([]protoimpl.MessageInfo, 8)
var file_indexerservice_proto_goTypes = []interface{}{
	(ErrCode)(0),                 // 0: land.gno.gnosocial.indexerservice.v1.ErrCode
	(*GetHomePostsRequest)(nil),  // 1: land.gno.gnosocial.indexerservice.v1.GetHomePostsRequest
	(*UserPost)(nil),             // 2: land.gno.gnosocial.indexerservice.v1.UserPost
	(*GetHomePostsResponse)(nil), // 3: land.gno.gnosocial.indexerservice.v1.GetHomePostsResponse
	(*HelloRequest)(nil),         // 4: land.gno.gnosocial.indexerservice.v1.HelloRequest
	(*HelloResponse)(nil),        // 5: land.gno.gnosocial.indexerservice.v1.HelloResponse
	(*HelloStreamRequest)(nil),   // 6: land.gno.gnosocial.indexerservice.v1.HelloStreamRequest
	(*HelloStreamResponse)(nil),  // 7: land.gno.gnosocial.indexerservice.v1.HelloStreamResponse
	(*ErrDetails)(nil),           // 8: land.gno.gnosocial.indexerservice.v1.ErrDetails
}
var file_indexerservice_proto_depIdxs = []int32{
	2, // 0: land.gno.gnosocial.indexerservice.v1.GetHomePostsResponse.userPosts:type_name -> land.gno.gnosocial.indexerservice.v1.UserPost
	0, // 1: land.gno.gnosocial.indexerservice.v1.ErrDetails.codes:type_name -> land.gno.gnosocial.indexerservice.v1.ErrCode
	1, // 2: land.gno.gnosocial.indexerservice.v1.IndexerService.GetHomePosts:input_type -> land.gno.gnosocial.indexerservice.v1.GetHomePostsRequest
	4, // 3: land.gno.gnosocial.indexerservice.v1.IndexerService.Hello:input_type -> land.gno.gnosocial.indexerservice.v1.HelloRequest
	6, // 4: land.gno.gnosocial.indexerservice.v1.IndexerService.HelloStream:input_type -> land.gno.gnosocial.indexerservice.v1.HelloStreamRequest
	3, // 5: land.gno.gnosocial.indexerservice.v1.IndexerService.GetHomePosts:output_type -> land.gno.gnosocial.indexerservice.v1.GetHomePostsResponse
	5, // 6: land.gno.gnosocial.indexerservice.v1.IndexerService.Hello:output_type -> land.gno.gnosocial.indexerservice.v1.HelloResponse
	7, // 7: land.gno.gnosocial.indexerservice.v1.IndexerService.HelloStream:output_type -> land.gno.gnosocial.indexerservice.v1.HelloStreamResponse
	5, // [5:8] is the sub-list for method output_type
	2, // [2:5] is the sub-list for method input_type
	2, // [2:2] is the sub-list for extension type_name
	2, // [2:2] is the sub-list for extension extendee
	0, // [0:2] is the sub-list for field type_name
}

func init() { file_indexerservice_proto_init() }
func file_indexerservice_proto_init() {
	if File_indexerservice_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_indexerservice_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetHomePostsRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_indexerservice_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*UserPost); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_indexerservice_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetHomePostsResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_indexerservice_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*HelloRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_indexerservice_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*HelloResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_indexerservice_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*HelloStreamRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_indexerservice_proto_msgTypes[6].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*HelloStreamResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_indexerservice_proto_msgTypes[7].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ErrDetails); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_indexerservice_proto_rawDesc,
			NumEnums:      1,
			NumMessages:   8,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_indexerservice_proto_goTypes,
		DependencyIndexes: file_indexerservice_proto_depIdxs,
		EnumInfos:         file_indexerservice_proto_enumTypes,
		MessageInfos:      file_indexerservice_proto_msgTypes,
	}.Build()
	File_indexerservice_proto = out.File
	file_indexerservice_proto_rawDesc = nil
	file_indexerservice_proto_goTypes = nil
	file_indexerservice_proto_depIdxs = nil
}
