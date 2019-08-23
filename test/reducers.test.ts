import assert from 'assert';
import { createAction, createAsyncAction } from '../src/actions';
import { asyncReducer, createReducer } from '../src/reducers';

describe('reducers', () => {
  const TYPE = 'TEST_ACTION';

  describe('createReducer', () => {
    it('should handle a number reducer', () => {
      const increment = createAction('INCREMENT');
      const decrement = createAction('DECREMENT');
      const reset = createAction('RESET', (count: number) => count);

      const reducer = createReducer(0, (handleAction) => [
        handleAction(increment, (state) => state + 1),
        handleAction(decrement, (state) => state - 1),
        handleAction(reset, (_, { payload }) => payload),
      ]);

      assert.strictEqual(reducer(undefined, increment()), 1, 'increment state by one');
      assert.strictEqual(reducer(undefined, decrement()), -1, 'decrement state by one');
      assert.strictEqual(reducer(3, reset(0)), 0, 'reset state to zero');
    });

    it('should handle multiple actions', () => {
      const a = createAction('A');
      const b = createAction('B');

      const reducer = createReducer(0, (handleAction) => [
        handleAction([a, b], (state) => state + 1),
      ]);

      assert.strictEqual(reducer(undefined, a()), 1);
      assert.strictEqual(reducer(undefined, b()), 1);
    });

    it('should handle unknown actions', () => {
      const known = createAction('KNOWN');
      const unknown = createAction('UNKNOWN');

      const reducer = createReducer(0, (handleAction) => [
        handleAction(known, (state) => state + 1),
      ]);

      assert.strictEqual(reducer(0, unknown() as any), 0);
    });

    describe('createAsyncAction', () => {
      const get = createAsyncAction('GET', (value: string) => Promise.resolve(value));

      const defaultState = {
        data: '',
        error: undefined as unknown as Error,
        pending: false,
      };

      const reducer = createReducer(defaultState, (handleAction) => [
        handleAction(get.pending, (state) => ({ ...state, pending: true })),
        handleAction(get.fulfilled, (state, { payload }) => ({ ...state, pending: false, data: payload })),
        handleAction(get.rejected, (state) => ({ ...state, pending: false, error: new Error('fail') })),
      ]);

      it('should set pending to true', () => {
        assert.deepEqual(
          reducer(undefined, get.pending()),
          { ...defaultState, pending: true }
        );
      });

      it('should set pending to false and sets data', () => {
        assert.deepEqual(
          reducer(undefined, get.fulfilled('data')),
          { ...defaultState, pending: false, data: 'data' }
        );
      });

      it('should set pending to false and sets error', () => {
        assert.deepEqual(
          reducer(undefined, get.rejected(new Error('fail'))),
          { ...defaultState, pending: false, error: new Error('fail') }
        );
      });
    });
  });

  describe('asyncReducer', () => {
    const action = createAsyncAction(TYPE, () => Promise.resolve(42));
    const reducer = asyncReducer(action as any);

    it('should return default state if unknown action', () => {
      const state = reducer({}, { type: 'UNKNOWN' });
      assert.deepEqual(state, {});
    });

    it('should set pending to true on pending', () => {
      const state = reducer(undefined, action.pending());
      assert.deepEqual(state, { pending: true });
    });

    it('should set pending to false on fulfilled', () => {
      const state = reducer(undefined, action.fulfilled(42));
      assert.strictEqual(state.pending, false);
    });

    it('should set data on fulfilled', () => {
      const state = reducer(undefined, action.fulfilled(42));
      assert.strictEqual(state.data, 42);
    });

    it('should set error to undefined on fulfilled', () => {
      const state = reducer({ error: new Error('oops!') }, action.fulfilled(42));
      assert.strictEqual(state.error, undefined);
    });

    it('should set pending to false on rejected', () => {
      const state = reducer(undefined, action.rejected(new Error('err')));
      assert.strictEqual(state.pending, false);
    });

    it('should set error on rejected', () => {
      const state = reducer(undefined, action.rejected(new Error('oops!')));
      assert.deepEqual(state.error, new Error('oops!'));
    });
  });
});
