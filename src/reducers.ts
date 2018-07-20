import { IAction, IAsyncActionFunction } from './actions';

export interface IState<Payload> {
  error?: Error;
  data?: Payload;
  pending?: boolean;
}

export const asyncReducer = <Payload>(fn: IAsyncActionFunction<Payload>) =>
  (state: IState<Payload> = {}, action: IAction<any>): IState<Payload> => {
    switch (action.type) {
      case String(fn.pending):
        return {
          ...state,
          pending: true,
        };
      case String(fn.fulfilled):
        return {
          ...state,
          data: action.payload,
          error: undefined,
          pending: false,
        };
      case String(fn.rejected):
        return {
          ...state,
          error: action.payload,
          pending: false,
        };
      default:
        return state;
    }
  };
