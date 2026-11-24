import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { accountSlice, profileSlice, replySlice, linkingSlice, feedbackSlice, switchNetwork } from "./features";
import { feedbackReporter } from "./middleware/feedback-reporter";
import { GnoNativeApi, useGnoNativeContext } from "@gnolang/gnonative";
import { useSearch, UseSearchReturnType } from "@gno/hooks/use-search";
import { useNotificationContext, UseNotificationReturnType } from "@gno/provider/notification-provider";
import { useUserCache } from "@gno/hooks/use-user-cache";

interface Props {
  children: React.ReactNode;
}


export interface ThunkExtra {
  extra: { gnonative: GnoNativeApi; search: UseSearchReturnType; push: UseNotificationReturnType, userCache: ReturnType<typeof useUserCache> };
}

// Reset the slice on switchNetwork, since it has data from the previous chain.
const resetOnNetworkSwitch = <R extends (state: any, action: any) => any>(sliceReducer: R): R =>
  ((state, action) => sliceReducer(action.type === switchNetwork.fulfilled.type ? undefined : state, action)) as R;

const reducer = {
  [accountSlice.reducerPath]: resetOnNetworkSwitch(accountSlice.reducer),
  [profileSlice.reducerPath]: resetOnNetworkSwitch(profileSlice.reducer),
  [replySlice.reducerPath]: resetOnNetworkSwitch(replySlice.reducer),
  [linkingSlice.reducerPath]: resetOnNetworkSwitch(linkingSlice.reducer),
  [feedbackSlice.reducerPath]: feedbackSlice.reducer,
}

export type RootState = { [K in keyof typeof reducer]: ReturnType<(typeof reducer)[K]> };

const ReduxProvider: React.FC<Props> = ({ children }) => {
  // Exposing GnoNative API to reduxjs/toolkit
  const { gnonative } = useGnoNativeContext();
  const search = useSearch();
  const push = useNotificationContext();
  const userCache = useUserCache();
  const [store, setStore] = useState<any>(null)

  useEffect(() => {
    if (store) return; // Prevent re-initialization

    const storeInstance = configureStore({
      reducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,

          thunk: {
            // To make Thunk inject gnonative in all Thunk objects.
            // https://redux.js.org/tutorials/essentials/part-6-performance-normalization#thunk-arguments
            extraArgument: {
              gnonative,
              search,
              push,
              userCache,
            },
          },
        }).concat(feedbackReporter),
    });
    setStore(storeInstance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  if (!store) return null

  return <Provider store={store}>{children}</Provider>;
};

export { ReduxProvider };
