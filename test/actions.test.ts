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
    it('should create an action object with type and no payload', () => {
      const action = createAction(TYPE);
      assert.deepEqual(action(), { type: TYPE });
    });

    it('should output action name on toString()', () => {
      const action = createAction(TYPE);
      assert.equal(action.toString(), TYPE);
    });

    it('should add the input to the payload', () => {
      const action = createAction(TYPE, (input: number) => input);
      assert.equal(action(1234).payload, 1234);
    });

    it('should execute the action creator and add it to the payload', () => {
      const action = createAction(TYPE, (a: number, b: number) => a + b);
      assert.equal(action(40, 2).payload, 42);
    });

    describe('metadataCreator', () => {
      it('should not have metadata', () => {
        const action = createAction(TYPE, (n: number) => ({ n }));
        assert.equal('meta' in action(42), false);
      });

      it('should forward same payload and metadata', () => {
        const action = createAction(TYPE, (n: number) => ({ n }), (n: number) => ({ n }));
        assert.deepEqual(action(42), {
          type: TYPE,
          payload: { n: 42 },
          meta: { n: 42 },
        });
      });

      it('should have different payload and metadata', () => {
        const action = createAction(TYPE, (n: number) => ({ n }), () => ({ asdf: 1234 }));
        assert.deepEqual(action(42), {
          type: TYPE,
          payload: { n: 42 },
          meta: { asdf: 1234 },
        });
      });

      it('should have only metadata', () => {
        const action = createAction(TYPE, () => undefined, () => ({ asdf: 1234 }));
        assert.deepEqual(action(), {
          type: TYPE,
          payload: undefined,
          meta: { asdf: 1234 },
        });
      });
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
        new RegExp(`Async action ${TYPE} must be handled with pending, fulfilled or rejected`)
      );
    });

    it('should create action with 0 arguments', async () => {
      const action0 = createAsyncAction(TYPE, () => Promise.resolve(42));
      assert.equal(await action0().payload, 42);
    });

    it('should create action with 1 arguments', async () => {
      const action1 = createAsyncAction(TYPE, (n: number) => Promise.resolve(n));
      assert.equal(await action1(42).payload, 42);
    });

    it('should create action with 2 arguments', async () => {
      const action1 = createAsyncAction(TYPE, (n: number, s: string) => Promise.resolve({ n, s }));
      assert.deepEqual(await action1(42, 'hello').payload, { n: 42, s: 'hello' });
    });

    it('should create action with 3 arguments', async () => {
      const action1 = createAsyncAction(TYPE, (n: number, s: string, b: boolean) => Promise.resolve({ n, s, b }));
      assert.deepEqual(await action1(42, 'hello', true).payload, { n: 42, s: 'hello', b: true });
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

    describe('promiseTypeDelimiter', () => {
      const actionDelimiter = createAsyncAction(
        TYPE,
        (s: string) => Promise.resolve(s),
        undefined,
        { promiseTypeDelimiter: '#' }
      );

      it('should use custom delimiter in pending action type', () => {
        assert.equal(actionDelimiter.pending.toString(), onPending(TYPE, '#'));
      });

      it('should use custom delimiter in fulfilled action type', () => {
        assert.equal(actionDelimiter.fulfilled.toString(), onFulfilled(TYPE, '#'));
      });

      it('should use custom delimiter in rejected action type', () => {
        assert.equal(actionDelimiter.rejected.toString(), onRejected(TYPE, '#'));
      });
    });
  });
});
