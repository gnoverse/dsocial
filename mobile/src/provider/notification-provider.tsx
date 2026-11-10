import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import { Client } from "@connectrpc/connect";
import * as Grpc from "@gno/grpc/client";

import { NotificationService } from "@buf/gnolang_dsocial-notification.bufbuild_es/notificationservice_pb";

export interface NotificationContextProps {
  getPushToken: () => string;
  registerDevice: (address: string) => Promise<void>;
}

interface ConfigProps {
  remote: string;
}

interface NotificationProviderProps {
  config: ConfigProps;
  children: React.ReactNode;
}

const NotificationContext = createContext<NotificationContextProps | null>(null);

const NotificationProvider: React.FC<NotificationProviderProps> = ({ config, children }) => {
  const [clientInstance, setClientInstance] = useState<Client<typeof NotificationService> | undefined>(undefined);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.EventSubscription>(undefined);
  const responseListener = useRef<Notifications.EventSubscription>(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => console.log(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (clientInstance) {
        return; // Prevent re-initialization
      }
      setClientInstance(initClient(config));
    })();
  }, []);

  const initClient = (config: ConfigProps): Client<typeof NotificationService> => {
    if (clientInstance) {
      return clientInstance;
    }

    return Grpc.createNotificationClient(config.remote);
  };

  const getClient = () => {
    if (!clientInstance) {
      throw new Error("web client instance not initialized.");
    }

    return clientInstance;
  };

  // registerDevice takes the address in the Bech32 format and register it to the notification service with the push token.
  const registerDevice = async (address: string): Promise<void> => {
    if (!expoPushToken) {
      throw new Error("Not registered to the Expo Notification Service yet!");
    }

    const client = getClient();

    await client.registerDevice({
      address: address,
      token: expoPushToken,
    });
  };

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        handleRegistrationError("Permission not granted to get push token for push notification!");
        return;
      }
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError("Project ID not found");
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError("Must use physical device for push notifications");
    }
  }

  const getPushToken = (): string => {
    if (!expoPushToken) {
      throw new Error("Not registered to the Notification Service yet!");
    }
    return expoPushToken;
  };

  const value = {
    getPushToken,
    registerDevice,
  };

  if (!clientInstance) {
    return null; // Prevent rendering before the client is initialized
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

function useNotificationContext() {
  const context = useContext(NotificationContext) as NotificationContextProps;

  if (context === undefined) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
}

export type UseNotificationReturnType = ReturnType<typeof useNotificationContext>;

export { NotificationProvider, useNotificationContext };
