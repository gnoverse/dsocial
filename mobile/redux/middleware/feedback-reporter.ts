import { isRejected } from "@reduxjs/toolkit";
import { reportFeedback } from "../features/feedbackSlice";
import { broadcastTx, walletFailed } from "../features/linkingSlice";
import { reloadAvatar } from "../features/accountSlice";
import { describeError, describeWalletFailure } from "@gno/utils/describe-error";

// The thunks whose failure isn't reported. An avatar is best-effort.
const SILENT = [reloadAvatar.typePrefix];

// The `redux` directory shadows the package's types, so RTK's Middleware type is not usable here.
type ReportableAction = { type: string; payload?: unknown; error?: { message?: string }; meta?: { condition?: boolean } };

/**
 * Tell the user about every rejected thunk, every refusal by the wallet and every committed transaction.
 *
 * This isn't in the screens since the outcome comes after a round trip through the wallet, when the
 * screen which made the request may be gone.
 */
export const feedbackReporter =
  (store: { dispatch: (action: unknown) => unknown }) =>
  (next: (action: ReportableAction) => unknown) =>
  (action: ReportableAction) => {
    const result = next(action);

    if (walletFailed.match(action)) {
      store.dispatch(reportFeedback("error", describeWalletFailure(action.payload)));
    } else if (broadcastTx.fulfilled.match(action)) {
      store.dispatch(reportFeedback("success", "Transaction confirmed."));
    } else if (isRejected(action) && !action.meta.condition) {
      if (!SILENT.some((prefix) => action.type.startsWith(prefix))) {
        store.dispatch(reportFeedback("error", describeError(action.error)));
      }
    }

    return result;
  };
