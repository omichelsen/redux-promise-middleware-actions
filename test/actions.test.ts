import * as assert from 'assert';
import {
  createAction,
  createAsyncAction,
  onFulfilled,
  onPending,
  onRejected
} from '../src/actions';

describe('actions', () => {
  const TYPE = 'TEST_ACTION';

  describe('createAction', () => {
    it('should create an action object with type', () => {
      assert.equal(createAction(TYPE)().type, TYPE);
    });

    it('should create an action object with no payload', () => {
      assert.equal(createAction(TYPE)().payload, undefined);
    });

    it('should output action name on toString()', () => {
      assert.equal(createAction(TYPE).toString(), TYPE);
    });

    it('should add the input to the payload', () => {
      const action = createAction(TYPE, (input: number) => input);
      assert.equal(action(1234).payload, 1234);
    });

    it('should execute the action creator and add it to the payload', () => {
      const action = createAction(TYPE, (a: number, b: number) => a + b);
      assert.equal(action(40, 2).payload, 42);
    });
  });

  describe('createAsyncAction', () => {
    const action = createAsyncAction(TYPE, (s: string) => Promise.resolve(s));

    it('should create an action with correct type', () => {
      assert.equal(action('x').type, TYPE);
    });

    it('should create an action with Promise payload', async () => {
      assert(action('x').payload instanceof Promise);
    });

    it('should create an action with correct payload', async () => {
      assert.equal(await action('x').payload, 'x');
    });

    it('should throw on toString()', () => {
      assert.throws(
        () => action.toString(),
        `Async action ${TYPE} must be handled with pending, fulfilled or rejected`
      );
    });

    describe('pending', () => {
      it('should have a pending action prop', () => {
        assert('pending' in action);
      });

      it('should output pending action name on toString()', () => {
        assert.equal(action.pending.toString(), onPending(TYPE));
      });
    });

    describe('fulfilled', () => {
      it('should have a fulfilled action prop', () => {
        assert('fulfilled' in action);
      });

      it('should output fulfilled action name on toString()', () => {
        assert.equal(action.fulfilled.toString(), onFulfilled(TYPE));
      });

      it('should create a fulfilled action with payload', () => {
        assert.deepEqual(action.fulfilled('payload'), {
          type: onFulfilled(TYPE),
          payload: 'payload',
        });
      });
    });

    describe('rejected', () => {
      it('should have a rejected action prop', () => {
        assert('rejected' in action);
      });

      it('should output rejected action name on toString()', () => {
        assert.equal(action.rejected.toString(), onRejected(TYPE));
      });

      it('should create a rejected action with payload', () => {
        assert.deepEqual(action.rejected('error'), {
          type: onRejected(TYPE),
          payload: 'error',
        });
      });
    });
  });
});
