/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Function, MaybePromise, PartialStrict, UnionMerge } from '@unshared/types'
import type { ApplicationOrModule, EventStream, InferModule, RouteParser } from '@unserved/server'

/**
 * Infer the routes of the application.
 *
 * @template T The application to infer the routes from.
 * @returns A union of the routes in the application.
 * @example type AppRoute = ApplicationRoute<App> // Route
 */
export type InferRoute<T extends ApplicationOrModule> =
  InferModule<T> extends { routes: Record<string, infer Route> }
    ? Route extends Function<infer R> ? R : Route
    : never

/** Infer the path of the application. */
export type InferRouteName<T extends ApplicationOrModule> =
  InferRoute<T> extends { name: infer U extends string } ? U : never

/** Infer the input data given a route name. */
export type InferInput<T extends ApplicationOrModule, N extends InferRouteName<T>> =
  InferRoute<T> extends infer Route ? Route extends { name: N }
    ? UnionMerge<PartialStrict<(
      (Route extends { body: RouteParser<infer B> } ? B : never) |
      (Route extends { formData: RouteParser<infer F> } ? F : never) |
      (Route extends { parameters: RouteParser<infer P> } ? P : never) |
      (Route extends { query: RouteParser<infer Q> } ? Q : never)
    )>>
    : never
    : never

/** Infer the payload data given a WebSocket route name. */
export type InferPayload<T extends ApplicationOrModule, N extends InferRouteName<T>> =
  InferRoute<T> extends infer Route
    ? Route extends { name: N; parseMessage: RouteParser<infer Payload> }
      ? Payload
      : never
    : never

/** Infer the output data given a route name. */
export type InferOutput<T extends ApplicationOrModule, N extends InferRouteName<T>> =
  InferRoute<T> extends infer Route
    ? Route extends { name: N; callback: (...args: any[]) => MaybePromise<infer Output> }
      ? Output extends EventStream<infer U> ? AsyncIterable<U> : Output
      : never
    : never
