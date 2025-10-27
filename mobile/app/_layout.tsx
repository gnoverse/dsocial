import { Stack } from "expo-router";

import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Guard } from "@gno/components/auth/guard";
import { GnoNativeProvider } from "@gnolang/gnonative";
import { IndexerProvider } from "@gno/provider/indexer-provider";
import { NotificationProvider } from "@gno/provider/notification-provider";
import { ReduxProvider } from "redux/redux-provider";
import { LinkingProvider } from "@gno/provider/linking-provider";

const gnoDefaultConfig = {
  // @ts-ignore
  remote: '', // It will be set dynamically from linking state
  // @ts-ignore
  chain_id: '', // It will be set dynamically from linking state
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
                </Guard>
              </ThemeProvider>
            </LinkingProvider>
          </ReduxProvider>
        </IndexerProvider>
      </NotificationProvider>
    </GnoNativeProvider>
  );
}
