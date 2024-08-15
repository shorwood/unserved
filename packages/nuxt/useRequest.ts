import type { InferInput, InferOutput, InferRouteName, RequestOptions } from '@unserved/client'
import type { ApplicationOrModule, Server } from '@unserved/server'
import type { AsyncDataOptions } from 'nuxt/app'
import type { Ref } from 'vue'
import { useAsyncData } from 'nuxt/app'
import { useClient } from './useClient'

/** Extract the keys of an object but only if they are strings. */
export type KeysOf<T> = Array<T extends T
  ? keyof T extends string ? keyof T
    : never : never
>

/** Matches a ref or an object with a nested ref. */
type MaybeReferenceDeep<T> =
  T extends Record<string, unknown>
    ? { [K in keyof T]: MaybeReferenceDeep<T[K]>; }
    : Ref<T> | T

/**
 * The options to pass to the `useRequest` function. It extends the `AsyncDataOptions` and `RequestOptions` types
 * with the `data` and `key` properties. The `data` property is the data to pass to the request, and the `key` property
 * is the key to use for caching the request.
 *
 * @template T The application or module type.
 * @template P The route name type.
 * @template O The output type.
 * @template U The output type or a nested output type.
 * @template K The keys of the output type.
 * @template D The default data type.
 * @returns The options to pass to the `useRequest` function.
 */
export type UseRequestOptions<
  T extends ApplicationOrModule = never,
  P extends InferRouteName<T> = never,
  O extends InferOutput<T, P> = InferOutput<T, P>,
  U = O,
  K extends KeysOf<U> = KeysOf<U>,
  D = null,
> = { data?: MaybeReferenceDeep<InferInput<T, P>> } & { key?: string } & AsyncDataOptions<O, U, K, D> & RequestOptions<T, P>

/**
 * Request a route from the server and return the result. This function is a wrapper around `useAsyncData` that
 * will call the `@unserved/client`'s `request` method with the given route name and options. The result will be
 * cached and returned as a reactive value.
 *
 * @param name The route name to request.
 * @param options The options to pass to the request.
 * @returns The result of the request.
 * @example
 *
 * // Request the 'GET /api/users' route.
 * const { data: users } = useRequest('GET /api/users')
 *
 * // Request the 'GET /api/users/:id' route with the given ID.
 * const { data: user } = useRequest('GET /api/users/:id', { data: { id: '123' } })
 */
export function useRequest<
  T extends ApplicationOrModule = Server['application'],
  P extends InferRouteName<T> = never,
  O extends InferOutput<T, P> = InferOutput<T, P>,
  U = O,
  K extends KeysOf<U> = KeysOf<U>,
  D = null,
>(
  name: P,
  options: UseRequestOptions<T, P, O, U, K, D> = {},
) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return useAsyncData(
    options.key ?? name as string,
    async() => useClient<T>().request(name, options),
    options,

    // --- This is a workaround for a TypeScript bug where the type is not inferred correctly.
  ) as ReturnType<typeof useAsyncData<InferOutput<T, P>, unknown, U, K, D>>
}
