// @ts-ignore
import { polyfill as polyfillReadableStream } from "react-native-polyfill-globals/src/readable-stream";
polyfillReadableStream();
// @ts-ignore
import { fetch as fetchPolyfill, Headers as HeadersPolyfill } from "react-native-fetch-api";

import type {
  BinaryReadOptions,
  BinaryWriteOptions,
  JsonReadOptions,
  JsonValue,
  JsonWriteOptions,
  DescMessage,
  DescMethodUnary,
  DescMethodStreaming,
  MessageShape,
  MessageInitShape,
} from '@bufbuild/protobuf';
import { fromJson } from "@bufbuild/protobuf";
import type { Interceptor, ContextValues, StreamResponse, Transport, UnaryRequest, UnaryResponse } from "@connectrpc/connect";
import { appendHeaders, createContextValues } from "@connectrpc/connect";
import {
  createClientMethodSerializers,
  createEnvelopeReadableStream,
  createMethodUrl,
  encodeEnvelope,
  runStreamingCall,
  runUnaryCall,
  getJsonOptions,
} from "@connectrpc/connect/protocol";
import {
  endStreamFlag,
  endStreamFromJson,
  validateResponse,
  requestHeader,
  transformConnectPostToGetRequest,
  errorFromJson,
  trailerDemux,
} from "@connectrpc/connect/protocol-connect";
import { MethodOptions_IdempotencyLevel } from "@bufbuild/protobuf/wkt";

// Polyfill async.Iterator. For some reason, the Babel presets and plugins are not doing the trick.
// Code from here: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html#caveats
// Symbol.asyncIterator is read-only on Hermes V1 (the default since Expo SDK 56), so only define it when missing.
if (!Symbol.asyncIterator) {
  Object.defineProperty(Symbol, "asyncIterator", { value: Symbol.for("Symbol.asyncIterator") });
}

export interface ConnectTransportOptions {
  /**
   * Base URI for all HTTP requests.
   *
   * Requests will be made to <baseUrl>/<package>.<service>/method
   *
   * Example: `baseUrl: "https://example.com/my-api"`
   *
   * This will make a `POST /my-api/my_package.MyService/Foo` to
   * `example.com` via HTTPS.
   *
   * If your API is served from the same domain as your site, use
   * `baseUrl: window.location.origin` or simply "/".
   */
  baseUrl: string;

  /**
   * By default, connect-web clients use the JSON format.
   */
  useBinaryFormat?: boolean;

  /**
   * Interceptors that should be applied to all calls running through
   * this transport. See the Interceptor type for details.
   */
  interceptors?: Interceptor[];

  /**
   * Options for the JSON format.
   * By default, unknown fields are ignored.
   */
  jsonOptions?: Partial<JsonReadOptions & JsonWriteOptions>;

  /**
   * Options for the binary wire format.
   */
  binaryOptions?: Partial<BinaryReadOptions & BinaryWriteOptions>;

  /**
   * Optional override of the fetch implementation used by the transport.
   *
   * This option can be used to set fetch options such as "credentials".
   */
  fetch?: typeof globalThis.fetch;

  /**
   * Controls whether or not Connect GET requests should be used when
   * available, on side-effect free methods. Defaults to false.
   */
  useHttpGet?: boolean;

  /**
   * The timeout in milliseconds to apply to all requests.
   *
   * This can be overridden on a per-request basis by passing a timeoutMs.
   */
  defaultTimeoutMs?: number;
}

class AbortError extends Error {
  name = "AbortError";
}

interface FetchXHRResponse {
  status: number;
  headers: Headers;
  body: Uint8Array;
}

const fetchOptions: RequestInit = {
  redirect: "error",
};

export function createWebTransport(
  options: ConnectTransportOptions,
): Transport {
  const useBinaryFormat = options.useBinaryFormat ?? false;
  return {
    async unary<I extends DescMessage, O extends DescMessage>(
      method: DescMethodUnary<I, O>,
      signal: AbortSignal | undefined,
      timeoutMs: number | undefined,
      header: Headers,
      message: MessageInitShape<I>,
      contextValues?: ContextValues
    ): Promise<UnaryResponse<I, O>> {
      const { serialize, parse } = createClientMethodSerializers(
        method,
        useBinaryFormat,
        options.jsonOptions,
        options.binaryOptions
      );

      return await runUnaryCall<I, O>({
        signal,
        interceptors: options.interceptors,
        req: {
          stream: false,
          service: method.parent,
          method,
          requestMethod: 'POST',
          url: createMethodUrl(options.baseUrl, method),
          header: requestHeader(method.methodKind, useBinaryFormat, timeoutMs, header, false),
          contextValues: contextValues ?? createContextValues(),
          message,
        },
        next: async (req: UnaryRequest<I, O>): Promise<UnaryResponse<I, O>> => {
          const useGet =
            options.useHttpGet === true &&
            method.idempotency ===
              MethodOptions_IdempotencyLevel.NO_SIDE_EFFECTS;
          let body: BodyInit | null = null;
          if (useGet) {
            req = transformConnectPostToGetRequest(
              req,
              serialize(req.message),
              useBinaryFormat,
            );
          } else {
            body = serialize(req.message);
          }
          const fetch = options.fetch ?? globalThis.fetch;
          const response = await fetch(req.url, {
            ...fetchOptions,
            method: req.requestMethod,
            headers: req.header,
            signal: req.signal,
            body,
          });
          const { isUnaryError, unaryError } = validateResponse(
            method.methodKind,
            useBinaryFormat,
            response.status,
            response.headers,
          );
          if (isUnaryError) {
            throw errorFromJson(
              (await response.json()) as JsonValue,
              appendHeaders(...trailerDemux(response.headers)),
              unaryError,
            );
          }
          const [demuxedHeader, demuxedTrailer] = trailerDemux(
            response.headers,
          );

          return {
            stream: false,
            service: method.parent,
            method,
            header: demuxedHeader,
            message: useBinaryFormat
              ? parse(new Uint8Array(await response.arrayBuffer()))
              : fromJson(
                  method.output,
                  (await response.json()) as JsonValue,
                  getJsonOptions(options.jsonOptions),
                ),
            trailer: demuxedTrailer,
          };
        },
      });
    },

    async stream<I extends DescMessage, O extends DescMessage>(
      method: DescMethodStreaming<I, O>,
      signal: AbortSignal | undefined,
      timeoutMs: number | undefined,
      header: HeadersInit | undefined,
      input: AsyncIterable<MessageInitShape<I>>,
      contextValues?: ContextValues
    ): Promise<StreamResponse<I, O>> {
      const { serialize, parse } = createClientMethodSerializers(
        method,
        useBinaryFormat,
        options.jsonOptions,
        options.binaryOptions
      );

      async function* parseResponseBody(body: ReadableStream<Uint8Array>, trailerTarget: HeadersPolyfill) {
        const reader = createEnvelopeReadableStream(body).getReader();
        let endStreamReceived = false;

        for (;;) {
          const result = await reader.read();
          if (result.done) {
            break;
          }

          const { flags, data } = result.value;
          if ((flags & endStreamFlag) === endStreamFlag) {
            endStreamReceived = true;

            const endStream = endStreamFromJson(data);
            if (endStream.error) {
              throw endStream.error;
            }

            endStream.metadata.forEach((value:any, key:any) => trailerTarget.set(key, value));
            continue;
          }

          yield parse(data);
        }

        if (!endStreamReceived) {
          throw "missing EndStreamResponse";
        }
      }

      async function createRequestBody(
        input: AsyncIterable<MessageShape<I>>,
      ): Promise<Uint8Array> {
        if (method.methodKind !== 'server_streaming') {
          throw 'The fetch API does not support streaming request bodies';
        }

        const r = await input[Symbol.asyncIterator]().next();
        if (r.done == true) {
          throw "missing request message";
        }

        return encodeEnvelope(0, serialize(r.value));
      }

      return await runStreamingCall<I, O>({
        interceptors: options.interceptors,
        timeoutMs,
        signal,
        req: {
          stream: true,
          service: method.parent,
          method,
          requestMethod: 'POST',
          url: createMethodUrl(options.baseUrl, method),
          header: requestHeader(method.methodKind, useBinaryFormat, timeoutMs, header, false),
          contextValues: contextValues ?? createContextValues(),
          message: input,
        },
        next: async (req) => {
          const fRes = await fetchPolyfill(req.url, {
            ...fetchOptions,
            headers: req.header,
            signal: req.signal,
            body: await createRequestBody(req.message),
            reactNative: { textStreaming: true }, // allows streaming in the polyfill fetch function
          });

          validateResponse(method.methodKind, useBinaryFormat, fRes.status, fRes.headers);
          if (fRes.body === null) {
            throw "missing response body";
          }

          const trailer = new HeadersPolyfill();

          // We have to implement the `*[Symbol.asyncIterator]()` of the object we give to the StreamResponse.message field.
          // It seems that react-native lacks the feature.
          const generator = {
            async *[Symbol.asyncIterator]() {
              yield* parseResponseBody(fRes.body, trailer);
            },
          };

          const res: StreamResponse<I, O> = {
            ...req,
            header: fRes.headers,
            trailer,
            message: generator,
          };
          return res;
        },
      });
    },
  };
}
