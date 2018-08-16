export const onPending = (type: any) => `${type}_PENDING`;
export const onFulfilled = (type: any) => `${type}_FULFILLED`;
export const onRejected = (type: any) => `${type}_REJECTED`;

export interface IAction<Payload, Metadata = undefined> {
  type: string;
  payload?: Payload;
  metadata?: Metadata;
  error?: boolean;
}

export type ActionFunction0<R> = () => R;
export type ActionFunction1<T1, R> = (t1: T1) => R;
export type ActionFunction2<T1, T2, R> = (t1: T1, t2: T2) => R;
export type ActionFunction3<T1, T2, T3, R> = (t1: T1, t2: T2, t3: T3) => R;
export type ActionFunction4<T1, T2, T3, T4, R> = (t1: T1, t2: T2, t3: T3, t4: T4) => R;
export type ActionFunctionAny<R> = (...args: any[]) => R;

export function createAction(
  type: string
): ActionFunction0<IAction<undefined>>;

export function createAction<Payload, Metadata>(
  type: string,
  payloadCreator: () => Payload,
  metadataCreator?: () => Metadata
): ActionFunction0<IAction<Payload, Metadata>>;

export function createAction<Payload, Metadata, Arg1>(
  type: string,
  payloadCreator: ActionFunction1<Arg1, Payload>,
  metadataCreator?: ActionFunction1<Arg1, Metadata>
): ActionFunction1<Arg1, IAction<Payload, Metadata>>;

export function createAction<Payload, Metadata, Arg1, Arg2>(
  type: string,
  payloadCreator: ActionFunction2<Arg1, Arg2, Payload>,
  metadataCreator?: ActionFunction2<Arg1, Arg2, Metadata>
): ActionFunction2<Arg1, Arg2, IAction<Payload>>;

export function createAction<Payload, Metadata, Arg1, Arg2, Arg3>(
  type: string,
  payloadCreator: ActionFunction3<Arg1, Arg2, Arg3, Payload>,
  metadataCreator?: ActionFunction3<Arg1, Arg2, Arg3, Metadata>
): ActionFunction3<Arg1, Arg2, Arg3, IAction<Payload>>;

export function createAction<Payload, Metadata, Arg1, Arg2, Arg3, Arg4>(
  type: string,
  payloadCreator: ActionFunction4<Arg1, Arg2, Arg3, Arg4, Payload>,
  metadataCreator?: ActionFunction4<Arg1, Arg2, Arg3, Arg4, Metadata>
): ActionFunction4<Arg1, Arg2, Arg3, Arg4, IAction<Payload>>;

export function createAction<Payload, Metadata>(
  type: string,
  payloadCreator?: (...args: any[]) => Payload,
  metadataCreator?: (...args: any[]) => Metadata
) {
  return Object.assign(
    (...args: any[]) => ({
      type,
      ...(payloadCreator && { payload: payloadCreator(...args) }),
      ...(metadataCreator && { meta: metadataCreator(...args) }),
    }),
    { toString: () => type }
  );
}

export interface IAsyncActionFunction<Payload> extends Function {
  pending: ActionFunction0<IAction<undefined>>;
  fulfilled: ActionFunction1<Payload, IAction<Payload>>;
  rejected: (payload?: any) => IAction<any>;
}

export function createAsyncAction<Payload, Metadata>(
  type: string,
  payloadCreator: () => Promise<Payload>,
  metadataCreator?: () => Metadata
): ActionFunction0<IAction<Promise<Payload>, Metadata>> & IAsyncActionFunction<Payload>;

export function createAsyncAction<Payload, Metadata, Arg1>(
  type: string,
  payloadCreator: ActionFunction1<Arg1, Promise<Payload>>,
  metadataCreator?: ActionFunction1<Arg1, Metadata>
): ActionFunction1<Arg1, IAction<Promise<Payload>, Metadata>> & IAsyncActionFunction<Payload>;

export function createAsyncAction<Payload, Metadata, Arg1, Arg2>(
  type: string,
  payloadCreator: ActionFunction2<Arg1, Arg2, Promise<Payload>>,
  metadataCreator?: ActionFunction2<Arg1, Arg2, Metadata>
): ActionFunction2<Arg1, Arg2, IAction<Promise<Payload>, Metadata>> & IAsyncActionFunction<Payload>;

export function createAsyncAction<Payload, Metadata, Arg1, Arg2, Arg3>(
  type: string,
  payloadCreator: ActionFunction3<Arg1, Arg2, Arg3, Promise<Payload>>,
  metadataCreator?: ActionFunction3<Arg1, Arg2, Arg3, Metadata>
): ActionFunction3<Arg1, Arg2, Arg3, IAction<Promise<Payload>, Metadata>> & IAsyncActionFunction<Payload>;

export function createAsyncAction<Payload, Metadata, Arg1, Arg2, Arg3, Arg4>(
  type: string,
  payloadCreator: ActionFunction4<Arg1, Arg2, Arg3, Arg4, Promise<Payload>>,
  metadataCreator?: ActionFunction4<Arg1, Arg2, Arg3, Arg4, Metadata>
): ActionFunction4<Arg1, Arg2, Arg3, Arg4, IAction<Promise<Payload>, Metadata>> & IAsyncActionFunction<Payload>;

export function createAsyncAction<Payload, Metadata>(
  type: string,
  payloadCreator?: (...args: any[]) => Promise<Payload>,
  metadataCreator?: (...args: any[]) => Metadata
) {
  return Object.assign(
    (...args: any[]) => ({
      type,
      ...(payloadCreator && { payload: payloadCreator(...args) }),
      ...(metadataCreator && { meta: metadataCreator(...args) }),
    }),
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
