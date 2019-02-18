# reflaction

Simple React js state management using the flux pattern.

# Overview

Reflaction allows developers to easily (and [simply](https://www.infoq.com/presentations/Simple-Made-Easy)) manage shared state within their React js applications. The goal of this library is to provide shared state management for React js apps, without hassle or excess boilerplate.

# Installation

`npm i reflaction`

or

`yarn add reflaction`

Refer to the docs for your version of npm or yarn if you encounter issues installing this package.

# Key terms

## Store

State shared between components within the application.

## Action

Something which can be 'dispatched' (read: triggered) by a component which will be handled by a developer defined function (or functions), resulting in an update to the store. An action has a `type` and a `payload`.

## Action Handler

A user defined function which handles a specific action. Action handlers receive the current store and the action payload, and should return the new store for updating.

## Action Flow

A flow of logic which can be triggered by a component, which results in the dispatching of multiple actions – for example, an asynchronous network call to fetch data, where different actions are dispatched along the way to track progress (pending, fulfilled, rejected etc.).

## Action Middleware

User or third party defined functions, which are run when an action is dispatched, before it is handled by the action handlers. Middleware functions can be used to intercept and modify actions before they are handled, or perform helpful tasks such as logging.

## Provider

Provides access to reflaction functionality for descendent components (access to the store, ability to dispatch actions and trigger action flows). Also note that almost all functionality within reflaction is handled by the Provider, including initialisation, action dispatching and action flow triggering.

# Example

## actionHandlers.js

Action handlers are stored in an object where the keys are the action types/names and the values are the handler functions. These functions receive the current state and the action payload (if any), and should return the new state.

```js
const actionHandlers = {
  fetchTodosPending: state => ({
    ...state,
    todosFetching: true,
  }),
  fetchTodosFulfilled: (state, todos) => ({
    ...state,
    todosFetching: false,
    todos,
  }),
};

export default actionHandlers;
```

Note that you can define many of these objects, perhaps each one related to a different part of the store. Also note that you may define handlers for the same action type across different action handler objects.

## actionFlows.js

Like action handlers, action flows are also stored in an object. The keys are the flow names and the values are the flow functions. The flow functions take the `dispatchAction` function and also a flow payload (if any).

```js
const actionFlows = {
  fetchTodos: async (dispatchAction, waitTime) => {
    dispatchAction({ type: 'fetchTodosPending' });

    const todos = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([{ title: 'Do laundry' }, { title: 'Mow lawn' }]);
      }, waitTime);
    });

    dispatchAction({ type: 'fetchTodosFulfilled', payload: todos });
  },
};

export default actionFlows;
```

Note that the `fetchTodos` flow above makes use of `async` and `await`. You could also use traditional callbacks and promise chains if you wish. Also note that an action flow doesn't have to be asynchronous at all.

## index.js

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { ReflactionProvider } from 'reflaction';

import TodoList from './TodoList';

import actionHandlers from './actionHandlers';
import actionFlows from './actionFlows';

const initialState = { todosFetching: false, todos: [] };

const logger = (nextMiddleware, getState, dispatchAction) => action => {
  console.group(action.type);
  console.log('Dispatched with payload:', action.payload);
  console.log('Old state:', getState());

  const newState = nextMiddleware(action);

  console.log('New state:', newState);
  console.groupEnd(action.type);

  return newState;
};

ReactDOM.render(
  <ReflactionProvider
    initialState={initialState}
    actionHandlers={actionHandlers}
    actionFlows={actionFlows}
    actionMiddleware={[logger]}
  >
    <TodoList />
  </ReflactionProvider>,
  document.getElementById('root')
);
```

Note that you can also provide an array as the `actionHandlers` prop, if you have split up your action handlers (perhaps based on which part of the store they affect) – this is what allows you to have multiple handlers for the same action.

Also, you can define your initial state object wherever you want, you can even split it up into multiple objects (perhaps storing each within an associated action handlers file if you decided to split up your action handlers as well) and then combine the parts together when providing the `initialState` prop here.

In the above code, we have an example of a middleware function: `logger`. Middleware functions are 'curried' functions, consisting of an inner and outer function. The inner function receives the action that was dispatched and contains logic that the middleware performs. The outer function receives the next middleware in the chain (`nextMiddleware`), which should be called once the current middleware logic has been performed, a function (`getState`) allowing the middleware to retrieve the current state (before action handling), and also a function allowing the middleware to dispatch a different action (`dispatchAction`), separate to the current chain of processing. Note that while not required, it is best to always return the result of `nextMiddleware` (which, down the chain, will eventually be set to the new state by the action handlers), for better compatability between different middleware functions.

## TodoList.js

This component is connected to reflaction. It can access the store, dispatch actions and trigger action flows. In this example, when the component is mounted we'll trigger the `fetchTodos` action flow with a payload (in this example the payload is a millsecond value indicating how long we want our mock function to wait before returning the todos).

```js
import React from 'react';

import { connectToReflaction } from 'reflaction';

class TodoList extends React.Component {
  componentDidMount() {
    this.props.fetchTodos(1000);
  }

  render() {
    const { todosFetching, todos } = this.props;

    return todosFetching ? (
      <p>Loading todos...</p>
    ) : (
      <ul>{todos.map(todo => <li key={todo.title}>{todo.title}</li>)}</ul>
    );
  }
}

export default connectToReflaction(
  TodoList,
  ({ store, triggerActionFlow }) => ({
    fetchTodos: (...args) => triggerActionFlow('fetchTodos', ...args),
    todosFetching: store.todosFetching,
    todos: store.todos,
  })
);
```

The `connectToReflaction` function takes the component to connect as well as a mapper function, which maps the props provided by reflaction (`store`, `dispatchAction` and `triggerActionFlow`) into the props that the connected component will receive.
Note that you can connect pure functional components in the same way as we have connected the above component.
