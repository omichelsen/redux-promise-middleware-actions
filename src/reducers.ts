import { ActionCreator, AnyAction, AsyncActionCreator } from './actions';

export function getType<
  TActionCreator extends { toString(): string },
  Type extends string = TActionCreator extends { toString(): infer U }
    ? U
    : never
>(actionCreator: TActionCreator) {
  return actionCreator.toString() as Type;
}

export type Handler<
  TPrevState,
  TAction,
  TNextState extends TPrevState = TPrevState
> = (prevState: TPrevState, action: TAction) => TNextState;

export type HandlerMap<
  TPrevState,
  TAction extends AnyAction,
  TNextState extends TPrevState = TPrevState
> = { [type in TAction['type']]: Handler<TPrevState, TAction, TNextState> };

export type InferActionFromHandlerMap<
  THandlerMap extends HandlerMap<any, any>
> = THandlerMap extends HandlerMap<any, infer T> ? T : never;

export type InferNextStateFromHandlerMap<
  THandlerMap extends HandlerMap<any, any>
> = THandlerMap extends HandlerMap<any, any, infer T> ? T : never;

export type CreateHandlerMap<TPrevState> = <
  TActionCreator extends ActionCreator<AnyAction>,
  TNextState extends TPrevState,
  TAction extends AnyAction = TActionCreator extends (...args: any[]) => infer T
    ? T
    : never
>(
  actionCreators: TActionCreator | TActionCreator[],
  handler: Handler<TPrevState, TAction, TNextState>
) => HandlerMap<TPrevState, TAction, TNextState>;

export function createHandlerMap<
  TActionCreator extends ActionCreator<AnyAction>,
  TPrevState,
  TNextState extends TPrevState,
  TAction extends AnyAction = TActionCreator extends (...args: any[]) => infer T
    ? T
    : never
>(
  actionCreators: TActionCreator | TActionCreator[],
  handler: Handler<TPrevState, TAction, TNextState>
) {
  return (Array.isArray(actionCreators) ? actionCreators : [actionCreators])
    .map(getType)
    .reduce<HandlerMap<TPrevState, TAction, TNextState>>((acc, type) => {
      acc[type] = handler;
      return acc;
    }, {} as any);
}

export function createReducer<
  TState,
  THandlerMap extends HandlerMap<TState, any, any>
>(
  defaultState: TState,
  handlerMapsCreator: (handle: CreateHandlerMap<TState>) => THandlerMap[]
) {
  const handlerMap = Object.assign({}, ...handlerMapsCreator(createHandlerMap));

  return (
    state = defaultState,
    action: InferActionFromHandlerMap<THandlerMap>
  ): InferNextStateFromHandlerMap<THandlerMap> => {
    const handler = handlerMap[action.type];

    return handler ? handler(state, action) : state;
  };
}

export interface State<Payload> {
  error?: Error;
  data?: Payload;
  date?: number;
  pending?: boolean;
}

export const asyncReducer = <Type extends string, Payload, Metadata>(
  fn: AsyncActionCreator<Type, Payload, Metadata>
) => {
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
      date: Date.now(),
    })),
    handleAction(fn.rejected, (state, { payload }) => ({
      ...state,
      pending: false,
      error: payload,
    })),
  ]);
};
