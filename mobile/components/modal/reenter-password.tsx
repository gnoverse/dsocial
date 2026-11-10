import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from "react-native";
import Alert from "@gno/components/alert";
import { useGnoNativeContext, ErrCode, GRPCError, errDetailOf } from "@gnolang/gnonative";
import { ModalView } from ".";
import TextInput, { TextInputRef } from "../textinput";
import Text from "../text";
import Button from "../button";
import Spacer from "../spacer";

export type Props = {
  visible: boolean;
  accountName: string;
  accountAddress: Uint8Array;
  onClose: (sucess: boolean) => void;
};

const ReenterPassword = ({ visible, accountName, onClose, accountAddress }: Props) => {
  const { gnonative } = useGnoNativeContext();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const inputRef = useRef<TextInputRef>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [visible]);

  const onConfirm = async () => {
    if (!password) return;

    try {
      setError(undefined);
      await gnonative.setPassword(password, accountAddress);
      onClose(true);
    } catch (error: any) {
      const errCode = errDetailOf(error)?.code ?? new GRPCError(error).errCode();
      if (errCode === ErrCode.ErrDecryptionFailed) {
        setError("Wrong password, please try again.");
      } else {
        setError(JSON.stringify(error));
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ height: "100%" }}>
          <ModalView.Content>
            <ModalView.Header title="Re-enter your password" onClose={() => onClose(false)} />
            <Text.BodyMedium>Please, reenter the password for the selected account.</Text.BodyMedium>
            <Spacer />
            <TextInput
              ref={inputRef}
              placeholder={`Password for ${accountName}'s Account`}
              error={error}
              secureTextEntry={true}
              onChangeText={setPassword}
            />
            <Alert severity="error" message={error} />
            <Button.TouchableOpacity title="Confirm" onPress={onConfirm} variant="primary" />
            <Spacer />
          </ModalView.Content>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReenterPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: "space-around",
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },
  textInput: {
    height: 40,
    borderColor: "#000000",
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: {
    backgroundColor: "white",
    marginTop: 12,
  },
});
