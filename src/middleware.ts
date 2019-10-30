import { Dispatch, Store } from 'redux';
import { ActionCreator, AnyAction } from './actions';

export function getType<
  TActionCreator extends { toString(): string },
  Type extends string = TActionCreator extends { toString(): infer U }
    ? U
    : never
>(actionCreator: TActionCreator) {
  return actionCreator.toString() as Type;
}

export type Handler<
  TStore,
  TNext,
  TAction
> = (store: TStore, next: TNext, action: TAction) => Dispatch<AnyAction>;

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
    .reduce<HandlerMap<TPrevState, TAction, TNextState>>(
      (acc, type) => {
        acc[type] = handler;
        return acc;
      },
      {} as any
    );
}

export function createMiddleware<
  TStore extends Store,
  THandlerMap extends HandlerMap<TStore, any, any>
>(
  handlerMapsCreator: (handle: CreateHandlerMap<TStore>) => THandlerMap[]
) {
  const handlerMap = Object.assign({}, ...handlerMapsCreator(createHandlerMap));

  return (
    store: TStore
  ) => {
    return (next: Dispatch<AnyAction>) => {
      return (
        action: InferActionFromHandlerMap<THandlerMap>
      ): InferNextStateFromHandlerMap<THandlerMap> => {
        const handler = handlerMap[action.type];

        return handler ? handler(store, next, action) : next(action);
      };
    };
  };
}
