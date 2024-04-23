package main

import (
	"context"
	"time"

	"connectrpc.com/connect"
	"go.uber.org/zap"

	api_gen "github.com/gnolang/gnosocial/tools/indexer-connect/api/gen/go"
)

func (s *indexerService) GetHomePosts(ctx context.Context, req *connect.Request[api_gen.GetHomePostsRequest]) (*connect.Response[api_gen.GetHomePostsResponse], error) {
	data := []*api_gen.UserPost{
		{
			UserPostAddr: "g1jg8mtutu9khhfwc4nxmuhcpftf0pajdhfvsqf5",
			PostId:       1,
		},
		{
			UserPostAddr: "g1c48vyrcpdaj6hzfr60kwn3uthgwkuym3qxzglx",
			PostId:       2,
		},
	}

	return connect.NewResponse(&api_gen.GetHomePostsResponse{
		UserPosts: data,
	}), nil
}

// Hello is for debug purposes
func (s *indexerService) Hello(ctx context.Context, req *connect.Request[api_gen.HelloRequest]) (*connect.Response[api_gen.HelloResponse], error) {
	s.logger.Debug("Hello called")
	defer s.logger.Debug("Hello returned ok")
	return connect.NewResponse(&api_gen.HelloResponse{
		Greeting: "Hello " + req.Msg.Name,
	}), nil
}

// HelloStream is for debug purposes
func (s *indexerService) HelloStream(ctx context.Context, req *connect.Request[api_gen.HelloStreamRequest], stream *connect.ServerStream[api_gen.HelloStreamResponse]) error {
	s.logger.Debug("HelloStream called")
	for i := 0; i < 4; i++ {
		if err := stream.Send(&api_gen.HelloStreamResponse{
			Greeting: "Hello " + req.Msg.Name,
		}); err != nil {
			s.logger.Error("HelloStream returned error", zap.Error(err))
			return err
		}
		time.Sleep(2 * time.Second)
	}

	s.logger.Debug("HelloStream returned ok")
	return nil
}
