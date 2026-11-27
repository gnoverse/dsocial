import * as Linking from "expo-linking";
import { useEffect } from "react";
import { broadcastTx, setLinkingData, useAppDispatch, walletFailed } from "@gno/redux";
import { consumeState } from "@gno/utils/callback-state";
import { isWalletCallback, parseCallback } from "@gno/utils/gnoconnect";

/** Handle the answers of the GnoConnect wallet. */
const LinkingProvider = ({ children }: { children: React.ReactNode }) => {
  // Not useURL: on Android, if the OS killed the app then React Native drops the URL which it is restored
  // with, since JavaScript isn't running yet. This one is kept on the native side.
  const url = Linking.useLinkingURL();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!url || !isWalletCallback(url)) return;

    const { state, status, code, address, chainid, signedtx } = parseCallback(url);
    if (!state || !consumeState(state)) {
      console.warn("ignoring a wallet callback with a missing or unknown state");
      return;
    }

    if (status !== "success") {
      dispatch(walletFailed({ state, status, code }));
    } else if (signedtx) {
      // Broadcast here, not in the screen which made the request: it is gone if the OS killed the app.
      dispatch(broadcastTx({ state, signedTx: signedtx }));
    } else if (address) {
      dispatch(setLinkingData({ address, chainId: chainid }));
    } else {
      dispatch(walletFailed({ state, status: "error" }));
    }
  }, [url]);

  return <>{children}</>;
};

export { LinkingProvider };
