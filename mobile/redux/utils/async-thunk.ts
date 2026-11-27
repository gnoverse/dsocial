import { createAsyncThunk, miniSerializeError } from "@reduxjs/toolkit";
import type { AsyncThunkConfig, AsyncThunkOptions, AsyncThunkPayloadCreator } from "@reduxjs/toolkit";
import { errDetailOf } from "@gnolang/gnonative";

/**
 * Keep gnonative's error code and message on a rejected thunk. RTK flattens a rejection before any
 * middleware sees it, and keeps `code` only if it is a string.
 */
const serializeGnoError = (error: unknown) => {
  const serialized = miniSerializeError(error);
  const detail = errDetailOf(error);
  if (!detail) return serialized;
  return { ...serialized, code: String(detail.code), message: detail.message || serialized.message };
};

/** createAsyncThunk with the serializer above. Every thunk should use it. */
export function createAppAsyncThunk<Returned, ThunkArg = void, ThunkApiConfig extends AsyncThunkConfig = object>(
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkApiConfig>
) {
  return createAsyncThunk<Returned, ThunkArg, ThunkApiConfig>(typePrefix, payloadCreator, {
    serializeError: serializeGnoError,
    // TypeScript can't see that none of the thunks customize the serialized error type.
  } as unknown as AsyncThunkOptions<ThunkArg, ThunkApiConfig>);
}
