import { useEffect } from "react";
import { reportFeedback, switchNetwork, useAppDispatch } from "@gno/redux";
import { findPreset } from "@gno/constants/networks";
import { getActiveNetwork } from "@gno/utils/network-store";
import { fetchChainId } from "@gno/utils/tm2-rpc";

/** At startup, if the active network's chain can change over time then check if it did. */
const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      const { id, label, rpc, chainId } = getActiveNetwork();
      if (findPreset(id)?.chainId !== undefined || !findPreset(id)) return;

      try {
        const currentChainId = await fetchChainId(rpc);
        // The user might have switched in the meantime.
        if (currentChainId === chainId || getActiveNetwork().id !== id) return;

        await dispatch(switchNetwork({ id, rpc, chainId: currentChainId })).unwrap();
        dispatch(reportFeedback("success", `${label} is now on chain ${currentChainId}.`));
      } catch (error) {
        // Offline, most likely. Keep the last known chain ID.
        console.log("Can't check the chain ID", error);
      }
    })();
  }, []);

  return <>{children}</>;
};

export { NetworkProvider };
