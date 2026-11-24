import { DefaultTheme, Stack, ThemeProvider } from "expo-router";

import { Guard } from "@gno/components/auth/guard";
import { GnoNativeProvider } from "@gnolang/gnonative";
import { IndexerProvider } from "@gno/provider/indexer-provider";
import { NotificationProvider } from "@gno/provider/notification-provider";
import { ReduxProvider } from "redux/redux-provider";
import { LinkingProvider } from "@gno/provider/linking-provider";
import { NetworkProvider } from "@gno/provider/network-provider";
import { getActiveNetwork } from "@gno/utils/network-store";
import FeedbackSnackbar from "@gno/components/feedback/feedback-snackbar";

// The network is also set in gnonative by switchNetwork.
const activeNetwork = getActiveNetwork();

const gnoDefaultConfig = {
  // @ts-ignore
  remote: activeNetwork.rpc,
  // @ts-ignore
  chain_id: activeNetwork.chainId,
};

const notificationDefaultConfig = {
  // @ts-ignore
  remote: process.env.EXPO_PUBLIC_NOTIFICATION_REMOTE!,
};

export default function AppLayout() {
  return (
    <GnoNativeProvider config={gnoDefaultConfig}>
      <NotificationProvider config={notificationDefaultConfig}>
        <IndexerProvider>
          <ReduxProvider>
            <NetworkProvider>
              <LinkingProvider>
                <ThemeProvider value={DefaultTheme}>
                  <Guard>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        headerLargeTitle: true,
                        headerBackVisible: false,
                      }}
                    />
                    <FeedbackSnackbar />
                  </Guard>
                </ThemeProvider>
              </LinkingProvider>
            </NetworkProvider>
          </ReduxProvider>
        </IndexerProvider>
      </NotificationProvider>
    </GnoNativeProvider>
  );
}
