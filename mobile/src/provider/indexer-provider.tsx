import { createContext, useContext, useState } from "react";
import * as Grpc from "@gno/grpc/client";

import { Client } from "@connectrpc/connect";
import { HelloResponse, HelloStreamResponse, UserAndPostID } from "@buf/gnolang_dsocial-indexer.bufbuild_es/indexerservice_pb";
import { IndexerService } from "@buf/gnolang_dsocial-indexer.bufbuild_es/indexerservice_pb";

export interface IndexerContextProps {
  getHomePosts: (userPostAddr: string, startIndex: bigint, endIndex: bigint) => Promise<[number, string]>;
  hello: (name: string) => Promise<HelloResponse>;
  helloStream: (name: string) => Promise<AsyncIterable<HelloStreamResponse>>;
  initIndexer: (indexerUrl: string) => void;
  indexerInstance?: Client<typeof IndexerService>;
}

interface IndexerProviderProps {
  children: React.ReactNode;
}

const IndexerContext = createContext<IndexerContextProps | null>(null);

const IndexerProvider: React.FC<IndexerProviderProps> = ({ children }) => {
  const [clientInstance, setClientInstance] = useState<Client<typeof IndexerService> | undefined>(undefined);

  const initIndexer = (indexerUrl: string) => {
    if (!indexerUrl) {
      throw new Error("indexerUrl is required to initialize indexer client.");
    }
    setClientInstance(Grpc.createIndexerClient(indexerUrl));
    console.log("Indexer client initialized with URL:", indexerUrl);
  };

  const getClient = () => {
    if (!clientInstance) {
      throw new Error("indexer client instance not initialized.");
    }

    return clientInstance;
  };

  const formatHomePost = (homePosts: UserAndPostID[]): string => {
    let result = "[]UserAndPostID{";
    for (const homePost of homePosts) {
      result += `{"${homePost.userPostAddr}", ${homePost.postID}},`;
    }
    result += "}";

    return result;
  };

  // Call getHomePosts and return [nHomePosts, addrAndIDs] where nHomePosts is the
  // total number of home posts and addrAndIDs is a Go string of the slice of
  // UserAndPostID which to use in qEval `GetJsonTopPostsByID(${addrAndIDs})`.
  const getHomePosts = async (userPostAddr: string, startIndex: bigint, endIndex: bigint): Promise<[number, string]> => {
    const client = getClient();

    const homePostsResult = await client.getHomePosts({
      userPostAddr,
      startIndex,
      endIndex,
    });
    const homePosts = formatHomePost(homePostsResult.homePosts);

    return [Number(homePostsResult.nPosts), homePosts];
  };

  const hello = async (name: string) => {
    const client = getClient();
    return client.hello({ name });
  };

  const helloStream = async (name: string) => {
    const client = getClient();
    return client.helloStream({ name });
  };

  const value = {
    getHomePosts,
    hello,
    helloStream,
    initIndexer,
    indexerInstance: clientInstance,
  };

  return <IndexerContext.Provider value={value}>{children}</IndexerContext.Provider>;
};

function useIndexerContext() {
  const context = useContext(IndexerContext) as IndexerContextProps;

  if (context === undefined) {
    throw new Error("useIndexerContext must be used within a IndexerProvider");
  }
  return context;
}

export { IndexerProvider, useIndexerContext };
