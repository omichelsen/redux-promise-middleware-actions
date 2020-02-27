# redux-promise-middleware-actions

[![Build Status](https://img.shields.io/travis/omichelsen/redux-promise-middleware-actions/master.svg)](https://travis-ci.org/omichelsen/redux-promise-middleware-actions)
[![Coverage Status](https://coveralls.io/repos/omichelsen/redux-promise-middleware-actions/badge.svg?branch=master&service=github)](https://coveralls.io/github/omichelsen/redux-promise-middleware-actions?branch=master)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/redux-promise-middleware-actions.svg)](https://bundlephobia.com/result?p=redux-promise-middleware-actions)

Create Redux actions with a `type` and `payload` in a standardized way. Inspired by [redux-actions](https://www.npmjs.com/package/redux-actions) but simpler and with special support for asynchronous actions (promises).

Has no dependencies and is tiny (~680 bytes gzipped). First class TypeScript support.

Works with [redux-promise-middleware](https://www.npmjs.com/package/redux-promise-middleware) to handle asynchronous actions by dispatching `pending`, `fulfilled` and `rejected` events based on the state of the input promise.

Goals of this library:

* Reference action creators directly - no need to maintain an action type enum/list
* Automatically generate actions for pending, fulfilled and rejected outcomes of a promise payload
* Have statically typed access to all action types - no need to manually add a type suffix like "_PENDING"
* TypeScript support so asynchronous actions can't be confused for normal synchronous actions

Note: If you are using TypeScript this library requires TypeScript 3. For TypeScript 2 use version 1 of this library.

## Installation

You need to install this library as well as [redux-promise-middleware](https://www.npmjs.com/package/redux-promise-middleware).

```
npm install redux-promise-middleware-actions redux-promise-middleware
```

Include redux-promise-middleware when you create your store:

```js
import promiseMiddleware from 'redux-promise-middleware';

composeStoreWithMiddleware = applyMiddleware(
  promiseMiddleware,
)(createStore);
```
NOTE: This library is *not* yet compatible with the `promiseTypeSuffixes` option of `redux-promise-middleware`

## Usage

### Synchronous action

Synchronous actions works exactly like redux-actions. You supply a function that returns whatever payload the action should have (if any).

```js
import { createAction } from 'redux-promise-middleware-actions';

export const foo = createAction('FOO', (num) => num);

dispatch(foo(5)); // { type: 'FOO', payload: 5 }
```

When handling the action in a reducer, you simply cast the action function to a string to return the type. This ensures type safety (no spelling errors) and you can use code navigation to find all uses of an action.

```js
const fooType = foo.toString(); // 'FOO'
```

### Asynchronous action

When you create an asynchronous action you need to return a promise payload. If your action is called `FOO` the following events will be dispatched:

1. `FOO_PENDING` is dispatched immediately
2. `FOO_FULFILLED` is dispatched when the promise is resolved
    * ... or `FOO_REJECTED` is dispatched instead if the promise is rejected

```js
import { createAsyncAction } from 'redux-promise-middleware-actions';

export const fetchData = createAsyncAction('FETCH_DATA', async () => {
  const res = await fetch(...);
  return res.json();
});

dispatch(fetchData()); // { type: 'FETCH_DATA_PENDING' }
```

An async action function has three properties to access the possible outcome actions: `pending`, `fulfilled` and `rejected`. You can dispatch them directly (in tests etc.):

```js
dispatch(fetchData.pending());          // { type: 'FETCH_DATA_PENDING' }
dispacth(fetchData.fulfilled(payload)); // { type: 'FETCH_DATA_FULFILLED', payload: ... }
dispacth(fetchData.rejected(err));      // { type: 'FETCH_DATA_REJECTED', payload: err, error: true }
```

But normally you only need them when you are writing reducers:

```js
case fetchData.pending.toString():   // 'FETCH_DATA_PENDING'
case fetchData.fulfilled.toString(): // 'FETCH_DATA_FULFILLED'
case fetchData.rejected.toString():  // 'FETCH_DATA_REJECTED'
```

Note that if you try and use the base function in a reducer, an error will be thrown to ensure you are not listening for an action that will never happen:

```js
case fetchData.toString(): // throws an error
```

### Reducer

To create a type safe reducer, `createReducer` takes a list of handlers that accept one or more actions and returns the new state. You can use it with both synchronous and asynchronous action creators.

#### `createReducer(defaultState, handlerMapsCreator)`

```js
import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

const fetchData = createAsyncAction('GET', () => fetch(...));

const defaultState = {};

const reducer = createReducer(defaultState, (handleAction) => [
  handleAction(fetchData.pending, (state) => ({ ...state, pending: true })),
  handleAction(fetchData.fulfilled, (state, { payload }) => ({ ...state, pending: false, data: payload })),
  handleAction(fetchData.rejected, (state, { payload }) => ({ ...state, pending: false, error: payload })),
]);

reducer(undefined, fetchData()); // { pending: true, data: ..., error: ... }
```

#### `asyncReducer(asyncActionCreator)`

It can get tedious writing the same reducer for every single async action so we've included a simple reducer that does the same as the example above:

```js
import { asyncReducer } from 'redux-promise-middleware-actions';

const fetchData = createAsyncAction('GET', () => fetch(...));
const fetchReducer = asyncReducer(fetchData);

fetchReducer() // { data?: Payload, error?: Error, pending?: boolean }
```

You can also combine it with an existing reducer:

```js
export default (state, action) => {
  const newState = fetchReducer(state, action);

  switch (action.type) {
    case 'SOME_OTHER_ACTION':
      return { ... };
    default:
      return newState;
  }
};
```

### Metadata

You can add metadata to any action by supplying an additional metadata creator function. The metadata creator will receive the same arguments as the payload creator:

#### `createAction(type, payloadCreator, metadataCreator)`

```js
const foo = createAction(
  'FOO',
  (num) => num,
  (num) => num + num
);

dispatch(foo(5)); // { type: 'FOO', meta: 10, payload: 5 }
```

#### `createAsyncAction(type, payloadCreator, metadataCreator)`

```js
const fetchData = createAsyncAction(
  'FETCH_DATA',
  (n: number) => fetch(...),
  (n: number) => ({ n })
);

dispatch(fetchData(42));
// { type: 'FETCH_DATA_PENDING', meta: { n: 42 } }
// { type: 'FETCH_DATA_FULFILLED', meta: { n: 42 }, payload: Promise<...> }
// { type: 'FETCH_DATA_REJECTED', meta: { n: 42 }, payload: Error(...) }
```

### Custome Type Delimiters

You can specify a different type delimiter for your async actions:

#### `createAsyncAction(type, payloadCreator, metadataCreator, options)`

```js
const foo = createAsyncAction(
  'FETCH_DATA',
  (n: number) => fetch(num),
  undefined,
  { promiseTypeDelimiter: '/' }
);

dispatch(foo());
// { type: 'FETCH_DATA/PENDING' }
// { type: 'FETCH_DATA/FULFILLED', payload: ... }
// { type: 'FETCH_DATA/REJECTED', payload: ... }
```

## Acknowledgements

Thanks to [Deox](https://github.com/thebrodmann/deox/) for a lot of inspiration for the TypeScript types.
