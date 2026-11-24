import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { selectLastTx, useAppDispatch, useAppSelector } from "@gno/redux";

/** How long to wait for the wallet's answer after the user comes back without one. */
const ANSWER_GRACE_MS = 3000;

/**
 * Send a transaction through the wallet and follow its outcome.
 *
 * `send` takes a thunk action made of makeCallTx. `pending` is true until the transaction is in a block,
 * refused or failed (the user is told why elsewhere, see feedbackReporter).
 */
export const useWalletTx = (onCommitted: () => void) => {
  const dispatch = useAppDispatch();
  const lastTx = useAppSelector(selectLastTx);

  const [requestState, setRequestState] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(false);

  const isMine = requestState !== undefined && lastTx?.state === requestState;
  const status = isMine ? lastTx?.status : undefined;

  useEffect(() => {
    if (status === "broadcasting") {
      setPending(true);
    } else if (status === "committed" || status === "failed") {
      setRequestState(undefined);
      setPending(false);
      if (status === "committed") onCommitted();
    }
  }, [status]);

  // The wallet might never answer. If the user comes back without an answer, stop waiting but still
  // accept a late one.
  useEffect(() => {
    if (!pending || status) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const subscription = AppState.addEventListener("change", (appState) => {
      clearTimeout(timeout);
      if (appState === "active") timeout = setTimeout(() => setPending(false), ANSWER_GRACE_MS);
    });
    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [pending, status]);

  const send = async (action: unknown) => {
    setPending(true);
    try {
      setRequestState(await dispatch(action).unwrap());
    } catch {
      setPending(false);
    }
  };

  return { send, pending };
};
