import { useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import Button from "@gno/components/button";
import Icons from "@gno/components/icons";
import Spacer from "@gno/components/spacer";
import Text from "@gno/components/text";
import TextInput from "@gno/components/textinput";
import { colors } from "@gno/styles/colors";
import { CUSTOM_NETWORK_ID, findPreset, NETWORK_PRESETS } from "@gno/constants/networks";
import { switchNetwork, switchToPreset, useAppDispatch } from "@gno/redux";
import { getIndexer, getNetwork, setIndexer, useActiveNetwork } from "@gno/utils/network-store";

interface Props {
  onSwitched: () => void;
}

/** Choose the network which dSocial talks to, and the indexer for each network. */
export default function NetworkForm({ onSwitched }: Props) {
  const dispatch = useAppDispatch();
  const active = useActiveNetwork();
  const [pendingId, setPendingId] = useState<string | undefined>(undefined);

  const savedCustom = getNetwork(CUSTOM_NETWORK_ID);
  const [customRpc, setCustomRpc] = useState(savedCustom?.rpc ?? "");
  const [customChainId, setCustomChainId] = useState(savedCustom?.chainId ?? "");

  const custom = { id: CUSTOM_NETWORK_ID, rpc: customRpc.trim(), chainId: customChainId.trim() };
  const isCustomReady = custom.rpc !== "" && custom.chainId !== "";
  const isCustomActive = active.id === custom.id && active.rpc === custom.rpc && active.chainId === custom.chainId;

  const select = async (id: string, action: unknown) => {
    if (pendingId) return;
    setPendingId(id);
    try {
      await dispatch(action).unwrap();
      onSwitched();
    } catch (error) {
      // Already reported. See feedbackReporter.
      console.log("Can't switch the network", error);
    } finally {
      setPendingId(undefined);
    }
  };

  return (
    <View style={styles.container}>
      <Text.Body>Changing the network signs you out. Changing its indexer does not.</Text.Body>

      {NETWORK_PRESETS.map((preset) => {
        const isActive = active.id === preset.id;
        const chainId = getNetwork(preset.id)?.chainId ?? "read from the node";
        return (
          <View key={preset.id} style={[styles.card, isActive && styles.activeCard]}>
            <TouchableOpacity
              style={styles.cardHeader}
              disabled={isActive || pendingId !== undefined}
              onPress={() => select(preset.id, switchToPreset(preset.id))}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={preset.label}
            >
              <View style={styles.cardContent}>
                <Text.BodyMedium>{preset.label}</Text.BodyMedium>
                <Text.Subheadline>{preset.rpc}</Text.Subheadline>
                <Text.Subheadline>Chain ID: {chainId}</Text.Subheadline>
              </View>
              {pendingId === preset.id ? <ActivityIndicator /> : isActive ? <Icons.CheckMark color={colors.primary} /> : null}
            </TouchableOpacity>
            <IndexerInput networkId={preset.id} />
          </View>
        );
      })}

      <View style={[styles.card, isCustomActive && styles.activeCard]}>
        <View style={styles.cardHeader}>
          <Text.BodyMedium style={styles.cardContent}>Custom</Text.BodyMedium>
          {isCustomActive ? <Icons.CheckMark color={colors.primary} /> : null}
        </View>
        <Text.Subheadline>RPC (without a scheme, http:// is assumed)</Text.Subheadline>
        <TextInput
          value={customRpc}
          onChangeText={setCustomRpc}
          placeholder="https://rpc.example.com"
          placeholderTextColor={colors.text.tertiary}
          accessibilityLabel="Custom RPC"
          {...urlInputProps}
        />
        <Text.Subheadline>Chain ID served by this RPC</Text.Subheadline>
        <TextInput
          value={customChainId}
          onChangeText={setCustomChainId}
          placeholder="dev"
          placeholderTextColor={colors.text.tertiary}
          accessibilityLabel="Custom chain ID"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <IndexerInput networkId={CUSTOM_NETWORK_ID} />
        <Button.TouchableOpacity
          title={isCustomActive ? "Custom network in use" : "Use custom network"}
          variant={isCustomReady && !isCustomActive ? "primary" : "secondary"}
          loading={pendingId === CUSTOM_NETWORK_ID}
          disabled={!isCustomReady || isCustomActive || pendingId !== undefined}
          onPress={() => select(CUSTOM_NETWORK_ID, switchNetwork(custom))}
        />
      </View>
      <Spacer space={24} />
    </View>
  );
}

const urlInputProps = { autoCapitalize: "none", autoCorrect: false, inputMode: "url" } as const;

const normalizeIndexer = (text: string) => text.trim().replace(/\/+$/, "");
const isValidIndexer = (indexer: string) => indexer === "" || /^https?:\/\/[^\s/]+/i.test(indexer);

/** The network's indexer. It is saved while typing, since pressing a button can leave the screen without a blur. */
function IndexerInput({ networkId }: { networkId: string }) {
  const [value, setValue] = useState(getIndexer(networkId));
  const [error, setError] = useState(false);

  const onChangeText = (text: string) => {
    setValue(text);
    setError(false);
    const indexer = normalizeIndexer(text);
    if (isValidIndexer(indexer)) setIndexer(networkId, indexer);
  };

  const onBlur = () => {
    const isValid = isValidIndexer(normalizeIndexer(value));
    setError(!isValid);
    // If emptied, this shows the preset's indexer again.
    if (isValid) setValue(getIndexer(networkId));
  };

  return (
    <>
      <Text.Subheadline>dSocial indexer</Text.Subheadline>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={error}
        placeholder={findPreset(networkId)?.indexer || "https://indexer.example.com"}
        placeholderTextColor={colors.text.tertiary}
        accessibilityLabel={`Indexer of ${findPreset(networkId)?.label ?? "Custom"}`}
        {...urlInputProps}
      />
      {error ? <Text.Body style={{ color: colors.red[700] }}>Must start with http:// or https://</Text.Body> : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, padding: 16 },
  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: colors.grayscale[100],
    backgroundColor: colors.white,
  },
  activeCard: { borderColor: colors.primary },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardContent: { flex: 1 },
});
