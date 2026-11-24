import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Layout from "@gno/components/layout";
import NetworkForm from "@gno/components/settings/network/network-form";

export default function Page() {
  const router = useRouter();

  const onClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <Layout.Container>
      <Layout.Header title="Network" iconType="back" onCloseHandler={onClose} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView keyboardShouldPersistTaps="handled">
          {/* Switching signs the user out, so go to the sign-in screen. */}
          <NetworkForm onSwitched={() => router.dismissTo("/")} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout.Container>
  );
}
