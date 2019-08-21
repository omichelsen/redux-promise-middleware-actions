export const onPending = (type: any, delimiter = '_') => `${type}${delimiter}PENDING`;
export const onFulfilled = (type: any, delimiter = '_') => `${type}${delimiter}FULFILLED`;
export const onRejected = (type: any, delimiter = '_') => `${type}${delimiter}REJECTED`;

export interface IAction<Payload, Metadata = undefined> {
  type: string;
  payload?: Payload;
  error?: boolean;
  meta?: Metadata;
}

export function createAction(
  type: string
): () => IAction<undefined>;

export function createAction<Payload, U extends any[]>(
  type: string,
  payloadCreator: (...args: U) => Payload
): (...args: U) => IAction<Payload>;

export function createAction<Payload, Metadata, U extends any[]>(
  type: string,
  payloadCreator: (...args: U) => Payload,
  metadataCreator?: (...args: U) => Metadata
): (...args: U) => IAction<Payload, Metadata>;

/**
 * Standard action creator factory.
 * @param type Action type.
 * @example
 * const addTodo = createAction('TODO_ADD', (name) => ({ name }));
 */
export function createAction<Payload, Metadata, U extends any[]>(
  type: string,
  payloadCreator?: (...args: U) => Payload,
  metadataCreator?: (...args: U) => Metadata
): (...args: U) => IAction<Payload, Metadata> {
  return Object.assign(
    (...args: U) => ({
      type,
      ...(payloadCreator && { payload: payloadCreator(...args) }),
      ...(metadataCreator && { meta: metadataCreator(...args) }),
    }),
    { toString: () => type }
  );
}

export interface IAsyncActionFunction<Payload> extends Function {
  pending: () => IAction<undefined>;
  fulfilled: (payload: Payload) => IAction<Payload>;
  rejected: (payload?: any) => IAction<any>;
}

/**
 * Asynchronous action creator factory.
 * @param type Action type.
 * @example
 * const getTodos = createAsyncAction('TODOS_GET', () => fetch('https://todos.com/todos'));
 */
export function createAsyncAction<Payload, Metadata, U extends any[]>(
  type: string,
  payloadCreator: (...args: U) => Promise<Payload>,
  metadataCreator?: (...args: U) => Metadata,
  options: {
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
      pending: createAction(onPending(type, options.promiseTypeDelimiter)),
      fulfilled: createAction(onFulfilled(type, options.promiseTypeDelimiter), (payload: Payload) => payload),
      rejected: createAction(onRejected(type, options.promiseTypeDelimiter), (payload: any) => payload),
    }
  );
}
