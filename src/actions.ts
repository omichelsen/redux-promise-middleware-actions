export const onPending = (type: any) => `${type}_PENDING`;
export const onFulfilled = (type: any) => `${type}_FULFILLED`;
export const onRejected = (type: any) => `${type}_REJECTED`;

export interface IAction<Payload> {
  type: string;
  payload?: Payload;
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

export function createAction<Payload>(
  type: string,
  payloadCreator: () => Payload
): ActionFunction0<IAction<Payload>>;

export function createAction<Payload, Arg1>(
  type: string,
  payloadCreator: ActionFunction1<Arg1, Payload>
): ActionFunction1<Arg1, IAction<Payload>>;

export function createAction<Payload, Arg1, Arg2>(
  type: string,
  payloadCreator: ActionFunction2<Arg1, Arg2, Payload>
): ActionFunction2<Arg1, Arg2, IAction<Payload>>;

export function createAction<Payload, Arg1, Arg2, Arg3>(
  type: string,
  payloadCreator: ActionFunction3<Arg1, Arg2, Arg3, Payload>
): ActionFunction3<Arg1, Arg2, Arg3, IAction<Payload>>;

export function createAction<Payload, Arg1, Arg2, Arg3, Arg4>(
  type: string,
  payloadCreator: ActionFunction4<Arg1, Arg2, Arg3, Arg4, Payload>
): ActionFunction4<Arg1, Arg2, Arg3, Arg4, IAction<Payload>>;

export function createAction<Payload>(type: string, payloadCreator?: (...args: any[]) => Payload) {
  return Object.assign(
    (...args: any[]) => ({
      type,
      ...(payloadCreator && { payload: payloadCreator(...args) }),
    }),
    { toString: () => type }
  );
}

export interface IAsyncActionFunction<Payload> extends Function {
  pending: ActionFunction0<IAction<undefined>>;
  fulfilled: ActionFunction1<Payload, IAction<Payload>>;
  rejected: (payload?: any) => IAction<any>;
}

export function createAsyncAction<Payload>(
  type: string,
  payloadCreator: () => Promise<Payload>
): ActionFunction0<IAction<Promise<Payload>>> & IAsyncActionFunction<Payload>;

export function createAsyncAction<Payload, Arg1>(
  type: string,
  payloadCreator: ActionFunction1<Arg1, Promise<Payload>>
): ActionFunction1<Arg1, IAction<Promise<Payload>>> & IAsyncActionFunction<Payload>;

export function createAsyncAction<Payload, Arg1, Arg2>(
  type: string,
  payloadCreator: ActionFunction2<Arg1, Arg2, Promise<Payload>>
): ActionFunction2<Arg1, Arg2, IAction<Promise<Payload>>> & IAsyncActionFunction<Payload>;

export function createAsyncAction<Payload, Arg1, Arg2, Arg3>(
  type: string,
  payloadCreator: ActionFunction3<Arg1, Arg2, Arg3, Promise<Payload>>
): ActionFunction3<Arg1, Arg2, Arg3, IAction<Promise<Payload>>> & IAsyncActionFunction<Payload>;

export function createAsyncAction<Payload, Arg1, Arg2, Arg3, Arg4>(
  type: string,
  payloadCreator: ActionFunction4<Arg1, Arg2, Arg3, Arg4, Promise<Payload>>
): ActionFunction4<Arg1, Arg2, Arg3, Arg4, IAction<Promise<Payload>>> & IAsyncActionFunction<Payload>;

export function createAsyncAction<Payload>(type: string, payloadCreator?: (...args: any[]) => Payload) {
  return Object.assign(
    (...args: any[]) => ({
      type,
      ...(payloadCreator && { payload: payloadCreator(...args) }),
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
