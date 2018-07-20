import * as assert from 'assert';
import { createAsyncAction } from '../src/actions';
import { asyncReducer } from '../src/reducers';

describe('reducers', () => {
  const TYPE = 'TEST_ACTION';

  describe('asyncReducer', () => {
    const action = createAsyncAction(TYPE, () => Promise.resolve(42));
    const reducer = asyncReducer(action);

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
      assert.equal(state.pending, false);
    });

    it('should set data on fulfilled', () => {
      const state = reducer(undefined, action.fulfilled(42));
      assert.equal(state.data, 42);
    });

    it('should set error to undefined on fulfilled', () => {
      const state = reducer({ error: new Error('oops!') }, action.fulfilled(42));
      assert.equal(state.data, 42);
    });

    it('should set pending to false on rejected', () => {
      const state = reducer(undefined, action.rejected());
      assert.equal(state.pending, false);
    });

    it('should set error on rejected', () => {
      const state = reducer(undefined, action.rejected(new Error('oops!')));
      assert.deepEqual(state.error, new Error('oops!'));
    });
  });
});
