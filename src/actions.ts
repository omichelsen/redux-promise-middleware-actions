export const onPending = (type: any) => `${type}_PENDING`;
export const onFulfilled = (type: any) => `${type}_FULFILLED`;
export const onRejected = (type: any) => `${type}_REJECTED`;

export interface IAction<Payload> {
  type: string;
  payload?: Payload;
  error?: boolean;
}

export function createAction(
  type: string
): () => IAction<undefined>;

export function createAction<Payload, U extends any[]>(
  type: string,
  payloadCreator: (...args: U) => Payload
): (...args: U) => IAction<Payload>;

export function createAction<Payload, U extends any[]>(
  type: string,
  payloadCreator?: (...args: U) => Payload
): (...args: U) => IAction<Payload> {
  return Object.assign(
    (...args: U) => ({
      type,
      ...(payloadCreator && { payload: payloadCreator(...args) }),
    }),
    { toString: () => type }
  );
}

export interface IAsyncActionFunction<Payload> extends Function {
  pending: () => IAction<undefined>;
  fulfilled: (payload: Payload) => IAction<Payload>;
  rejected: (payload?: any) => IAction<any>;
}

export function createAsyncAction<Payload, U extends any[]>(
  type: string,
  payloadCreator: (...args: U) => Promise<Payload>
) {
  return Object.assign(
    createAction(type, payloadCreator),
    {
      toString: () => {
        throw new Error(`Async action ${type} must be handled with pending, fulfilled or rejected`);
      },
    },
    {
      pending: createAction(onPending(type)),
      fulfilled: createAction(onFulfilled(type), (payload: Payload) => payload),
      rejected: createAction(onRejected(type), (payload: any) => payload),
    }
  );
}
