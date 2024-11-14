// @generated by protoc-gen-connect-es v1.6.1
// @generated from file indexerservice.proto (package land.gno.dsocial.indexerservice.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { GetHomePostsRequest, GetHomePostsResponse, HelloRequest, HelloResponse, HelloStreamRequest, HelloStreamResponse, StreamPostReplyRequest, StreamPostReplyResponse } from "./indexerservice_pb.js";
import { MethodKind } from "@bufbuild/protobuf";

/**
 * IndexerService is the service to interact with the dSocial Indexer
 *
 * @generated from service land.gno.dsocial.indexerservice.v1.IndexerService
 */
export declare const IndexerService: {
  readonly typeName: "land.gno.dsocial.indexerservice.v1.IndexerService",
  readonly methods: {
    /**
     * @generated from rpc land.gno.dsocial.indexerservice.v1.IndexerService.GetHomePosts
     */
    readonly getHomePosts: {
      readonly name: "GetHomePosts",
      readonly I: typeof GetHomePostsRequest,
      readonly O: typeof GetHomePostsResponse,
      readonly kind: MethodKind.Unary,
    },
    /**
     * StreamPostReply returns a stream of PostReply functions that are called in the blockchain
     *
     * @generated from rpc land.gno.dsocial.indexerservice.v1.IndexerService.StreamPostReply
     */
    readonly streamPostReply: {
      readonly name: "StreamPostReply",
      readonly I: typeof StreamPostReplyRequest,
      readonly O: typeof StreamPostReplyResponse,
      readonly kind: MethodKind.ServerStreaming,
    },
    /**
     * Hello is for debug purposes
     *
     * @generated from rpc land.gno.dsocial.indexerservice.v1.IndexerService.Hello
     */
    readonly hello: {
      readonly name: "Hello",
      readonly I: typeof HelloRequest,
      readonly O: typeof HelloResponse,
      readonly kind: MethodKind.Unary,
    },
    /**
     * HelloStream is for debug purposes
     *
     * @generated from rpc land.gno.dsocial.indexerservice.v1.IndexerService.HelloStream
     */
    readonly helloStream: {
      readonly name: "HelloStream",
      readonly I: typeof HelloStreamRequest,
      readonly O: typeof HelloStreamResponse,
      readonly kind: MethodKind.ServerStreaming,
    },
  }
};

