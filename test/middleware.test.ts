import assert from 'assert';
import { createAction } from '../src/actions';
import { createMiddleware } from '../src/middleware';

describe('middleware', () => {
  const TYPE = 'TEST_ACTION';

  describe('createMiddleware', () => {
    it('should create middleware handling an action', () => {
      const action = createAction(TYPE);
      let actual = false;

      const middleware = createMiddleware((handleAction) => [
        handleAction(action, {
          actual = true;
          return next(action);
        })
      ]);

      assert.strictEqual(actual, true, 'middleware changed value');
    });
  });
});
