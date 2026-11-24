/** tm2 JSON-RPC calls, for what gnonative doesn't cover. */

const REQUEST_TIMEOUT_MS = 15_000;

export const rpcEndpoint = (rpc: string): string => {
  if (/^https?:\/\//i.test(rpc)) return rpc;
  return `http://${rpc.replace(/^tcp:\/\//i, "")}`;
};

async function call(rpc: string, method: string, params: unknown[]): Promise<any> {
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), REQUEST_TIMEOUT_MS);
  try {
    let response;
    try {
      response = await fetch(rpcEndpoint(rpc), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: `dsocial-${Date.now()}`, method, params }),
        signal: abort.signal,
      });
    } catch (error) {
      // Release builds also end up here for an http:// address, which the OS forbids.
      console.log("%s %s failed", rpc, method, error);
      throw new Error(`Cannot reach ${rpc}. Check the address, or your connection.`);
    }
    if (!response.ok) throw new Error(`${method} failed: ${response.status} ${response.statusText}`);

    const body = await response.json();
    // On tm2, error.message is always the generic "Internal error". The cause is in error.data.
    if (body.error) throw new Error(`${method} rejected: ${body.error.data || body.error.message}`);
    return body.result;
  } finally {
    clearTimeout(timeout);
  }
}

/** Ask the node which chain it serves. */
export async function fetchChainId(rpc: string): Promise<string> {
  const chainId = (await call(rpc, "status", ["0"]))?.node_info?.network;
  if (typeof chainId !== "string" || !chainId) throw new Error(`${rpc} did not report its chain ID.`);
  return chainId;
}

// Turn an ABCI error into a short reason. The error itself is often only a type, with the cause in the
// log's first message trace, "    0  /file.go:12 - the cause", or in its first line.
const abciReason = (error: { "@type"?: string; value?: unknown }, log = ""): string => {
  if (typeof error.value === "string" && error.value) return error.value.split("\n")[0];
  const trace = /^\s*0\s+\S+ - (.+)$/m.exec(log)?.[1];
  const firstLine = log.startsWith("--=") ? "" : log.split("\n")[0];
  return trace || firstLine || error["@type"] || JSON.stringify(error);
};

// About how long to wait for the transaction to be in a block.
const CONFIRM_ATTEMPTS = 30;
const CONFIRM_INTERVAL_MS = 1000;

/**
 * Broadcast the wallet's `signedtx`, and return when the transaction is in a block.
 *
 * `signedtx` is base64 amino-binary, which is already what the RPC takes. It is sent untouched, not
 * through gnonative.broadcastTxCommit (which would decode and re-encode it), since that can drop the
 * fields of a session key's or multisig's signature.
 *
 * This uses broadcast_tx_sync and polls for the result since broadcast_tx_commit can report an error
 * for a transaction which is committed later.
 */
export async function broadcastSignedTx(rpc: string, signedTx: string): Promise<void> {
  const accepted = await call(rpc, "broadcast_tx_sync", [signedTx]);
  if (accepted?.error) throw new Error(`The chain rejected the transaction: ${abciReason(accepted.error, accepted.log ?? accepted.Log)}`);
  const hash = accepted?.hash;
  if (!hash) throw new Error("Broadcast returned no transaction hash.");

  for (let attempt = 0; attempt < CONFIRM_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, CONFIRM_INTERVAL_MS));

    let committed;
    try {
      committed = await call(rpc, "tx", [hash]);
    } catch {
      continue; // Not in a block yet, or a network failure.
    }

    const result = committed?.tx_result?.ResponseBase;
    if (result?.Error) throw new Error(`The chain rejected the transaction: ${abciReason(result.Error, result.Log)}`);
    return;
  }

  throw new Error("The transaction was sent but is not in a block yet. It may still land.");
}
