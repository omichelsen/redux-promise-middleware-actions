export const onPending = (type: any) => `${type}_PENDING`;
export const onFulfilled = (type: any) => `${type}_FULFILLED`;
export const onRejected = (type: any) => `${type}_REJECTED`;

export interface IAction<Payload, Metadata = undefined> {
  type: string;
  payload?: Payload;
  error?: boolean;
  meta?: Metadata;
}

export type IThunk = (
  dispatch: (action: any) => any,
  getState: () => any
) => any;

export function createAction<Thunk extends IThunk, U extends any[]>(
  type: string,
  payloadCreator: (...args: U) => Thunk
): (...args: U) => Thunk;

export function createAction<Thunk extends IThunk, Metadata, U extends any[]>(
  type: string,
  payloadCreator: (...args: U) => Thunk,
  metadataCreator?: (...args: U) => Metadata
): (...args: U) => Thunk;

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

export function createAction<Payload, Metadata, U extends any[]>(
  type: string,
  payloadCreator?: (...args: U) => Payload,
  metadataCreator?: (...args: U) => Metadata
) {
  return Object.assign(
    (...args: U) => {
      const payload = (payloadCreator && payloadCreator(...args));
      const meta = (metadataCreator && metadataCreator(...args));

      if (typeof payload === 'function') {
        return payload;
      }

      return {
        type,
        ...(payload && { payload }),
        ...(meta && { meta }),
      };
    },
    { toString: () => type }
  );
}

export interface IAsyncActionFunction<Payload> extends Function {
  pending: () => IAction<undefined>;
  fulfilled: (payload: Payload) => IAction<Payload>;
  rejected: (payload?: any) => IAction<any>;
}

export function createAsyncAction<Payload, Metadata, U extends any[]>(
  type: string,
  payloadCreator: (...args: U) => Promise<Payload>,
  metadataCreator?: (...args: U) => Metadata
) {
  return Object.assign(
    createAction(type, payloadCreator, metadataCreator),
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
