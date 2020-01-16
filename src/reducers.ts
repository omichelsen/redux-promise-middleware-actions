import { ActionCreator, AnyAction, AsyncActionCreator } from './actions';

export function getType<
  TActionCreator extends { toString(): string },
  Type extends string = TActionCreator extends { toString(): infer U } ? U : never
>(actionCreator: TActionCreator) {
  return actionCreator.toString() as Type;
}

export type Handler<
  TState,
  TAction
> = (state: TState, action: TAction) => TState;

export type HandlerMap<
  TState,
  TAction extends AnyAction
> = { [type in TAction['type']]: Handler<TState, TAction> };

export type InferActionFromHandlerMap<
  THandlerMap extends HandlerMap<any, any>
> = THandlerMap extends HandlerMap<any, infer T> ? T : never;

// export type InferNextStateFromHandlerMap<
//   THandlerMap extends HandlerMap<any, any>
// > = THandlerMap extends HandlerMap<infer T, any> ? T : never;

export type CreateHandlerMap<TState> = <
  TActionCreator extends ActionCreator<AnyAction>,
  TAction extends AnyAction = TActionCreator extends (...args: any[]) => infer T
  ? T
  : never
>(
  actionCreators: TActionCreator | TActionCreator[],
  handler: Handler<TState, TAction>
) => HandlerMap<TState, TAction>;

export function createHandlerMap<
  TActionCreator extends ActionCreator<AnyAction>,
  TState,
  TAction extends AnyAction = TActionCreator extends (...args: any[]) => infer T
  ? T
  : never
>(
  actionCreators: TActionCreator | TActionCreator[],
  handler: Handler<TState, TAction>
) {
  return (Array.isArray(actionCreators) ? actionCreators : [actionCreators])
    .map(getType)
    .reduce<HandlerMap<TState, TAction>>(
      (acc, type) => {
        acc[type] = handler;
        return acc;
      },
      {} as any
    );
}

export function createReducer<
  TState,
  THandlerMap extends HandlerMap<TState, any>
>(
  defaultState: TState,
  handlerMapsCreator: (handle: CreateHandlerMap<TState>) => THandlerMap[]
) {
  const handlerMap: any = { ...handlerMapsCreator(createHandlerMap) };

  return (
    state = defaultState,
    action: InferActionFromHandlerMap<THandlerMap>
  ): TState => {
    const handler = handlerMap[action.type];

    return handler ? handler(state, action) : state;
  };
}

export interface State<Payload> {
  error?: Error;
  data?: Payload;
  pending?: boolean;
}

export const asyncReducer = <
  Type extends string,
  Payload,
  Metadata
>(fn: AsyncActionCreator<Type, Payload, Metadata>) => {
  const defaultState: State<Payload> = {};

  return createReducer(defaultState, (handleAction) => [
    handleAction(fn.pending, (state) => ({
      ...state,
      pending: true,
    })),
    handleAction(fn.fulfilled, (state, { payload }: any) => ({
      ...state,
      pending: false,
      error: undefined,
      data: payload,
    })),
    handleAction(fn.rejected, (state, { payload }) => ({
      ...state,
      pending: false,
      error: payload,
    })),
  ]);
};
