export const onPending = (type: any, delimiter = '_') => `${type}${delimiter}PENDING`;
export const onFulfilled = (type: any, delimiter = '_') => `${type}${delimiter}FULFILLED`;
export const onRejected = (type: any, delimiter = '_') => `${type}${delimiter}REJECTED`;

export type Action<
  Type extends string,
  Payload = undefined,
  Meta = undefined
  > = Payload extends undefined
  ? (Meta extends undefined ? { type: Type } : { type: Type; meta: Meta })
  : (Payload extends Error
    ? (Meta extends undefined
      ? { type: Type; payload: Payload; error: true }
      : { type: Type; payload: Payload; meta: Meta; error: true })
    : (Meta extends undefined
      ? { type: Type; payload: Payload }
      : { type: Type; payload: Payload; meta: Meta }));

export type AnyAction = Action<string>;

export type ActionCreator<T extends AnyAction, U extends any[] = any> = {
  (...args: U): T
  toString(): T['type']
};

export function createAction<Type extends string>(
  type: Type
): ActionCreator<Action<Type>>;

export function createAction<Type extends string, Payload, U extends any[]>(
  type: Type,
  payloadCreator: (...args: U) => Payload
): ActionCreator<Action<Type, Payload>, U>;

export function createAction<Type extends string, Payload, Metadata, U extends any[]>(
  type: Type,
  payloadCreator: (...args: U) => Payload,
  metadataCreator?: (...args: U) => Metadata
): ActionCreator<Action<Type, Payload, Metadata>, U>;

/**
 * Standard action creator factory.
 * @param type Action type.
 * @example
 * const addTodo = createAction('TODO_ADD', (name) => ({ name }));
 */
export function createAction<Type extends string, Payload, Metadata, U extends any[]>(
  type: Type,
  payloadCreator?: (...args: U) => Payload,
  metadataCreator?: (...args: U) => Metadata
) {
  return Object.assign(
    (...args: U) => ({
      type,
      ...(payloadCreator && { payload: payloadCreator(...args) }),
      ...(metadataCreator && { meta: metadataCreator(...args) }),
    }),
    { toString: () => type }
  );
}

export interface AsyncActionCreator<
  Type extends string,
  Payload,
  Metadata
  > extends ActionCreator<Action<Type, Payload, Metadata>> {
  pending: ActionCreator<Action<string>>;
  fulfilled: ActionCreator<Action<string, Payload>>;
  rejected: ActionCreator<Action<string, Error>>;
}

/**
 * Asynchronous action creator factory.
 * @param type Action type.
 * @example
 * const getTodos = createAsyncAction('TODOS_GET', () => fetch('https://todos.com/todos'));
 */
export function createAsyncAction<Type extends string, Payload, Metadata, U extends any[]>(
  type: Type,
  payloadCreator: (...args: U) => Promise<Payload>,
  metadataCreator?: (...args: U) => Metadata,
  { promiseTypeDelimiter: delimiter }: {
    promiseTypeDelimiter?: string
  } = {}
) {
  return Object.assign(
    createAction(type, payloadCreator, metadataCreator),
    {
      toString: () => {
        throw new Error(`Async action ${type} must be handled with pending, fulfilled or rejected`);
      },
    },
    {
      pending: createAction(onPending(type, delimiter)),
      fulfilled: createAction(onFulfilled(type, delimiter), (payload: Payload) => payload),
      rejected: createAction(onRejected(type, delimiter), (payload: Error) => payload),
    }
  );
}
