import { ErrCode } from "@gnolang/gnonative";

/** Describe the wallet's refusal. The set of codes is open: an unknown one must still say something useful. */
export const describeWalletFailure = ({ status, code }: { status: string; code?: string }): string => {
  if (status === "cancelled") return "Cancelled in the wallet.";

  switch (code) {
    case "network_declined":
      return "The wallet stayed on its own network. dSocial needs it on the network selected here.";
    case "no_signer":
      return "The wallet has no account to sign with.";
    case "signer_unavailable":
      return "The wallet doesn't have the account you are signed in with.";
    case "invalid_request":
      return "The wallet rejected the request as malformed.";
    case "unsupported_host":
      return "This wallet does not support the requested action.";
    case "tx_failed":
      return "The wallet could not sign the transaction.";
    default:
      return code ? `The wallet reported an error (${code}).` : "The wallet reported an error.";
  }
};

// Wording which names the network settings, that gnonative doesn't know about.
const OVERRIDES: Partial<Record<ErrCode, string>> = {
  [ErrCode.ErrRemoteUnreachable]: "Cannot reach the network. Check the RPC address in the network settings, or your connection.",
  [ErrCode.ErrSetRemote]: "That RPC address could not be used. Check it in the network settings.",
};

// Framing added by the layers which an error without a code crosses. It nests.
const FRAMING = /^(?:\[unknown\]|unknown:|(?:invoke|stream) bridge method error:|stream receive error:)\s*/i;

const MAX_LENGTH = 200;

/** Describe the error of a rejected thunk (see createAppAsyncThunk) in one sentence. */
export const describeError = (error: { message?: string; code?: string } | undefined): string => {
  const code = error?.code === undefined ? undefined : (Number(error.code) as ErrCode);
  const override = code === undefined ? undefined : OVERRIDES[code];
  if (override) return override;

  let message = error?.message?.trim() ?? "";
  while (FRAMING.test(message)) message = message.replace(FRAMING, "").trim();
  if (!message) return "Something went wrong.";
  if (message.length > MAX_LENGTH) message = `${message.slice(0, MAX_LENGTH - 1)}…`;

  // The text is the realm's. Attribute it so that a realm can't speak in the app's own voice.
  return code === ErrCode.ErrChainRejected ? `The chain replied: ${message}` : message;
};
