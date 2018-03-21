import React from 'react';
import PropTypes from 'prop-types';

export default class ReflactionProvider extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.bindFunctions();

    this.initialiseState(props.initialState);
    this.initialiseActionHandlers(props.actionHandlers);
    this.initialiseActionFlows(props.actionFlows);
    this.initialiseDispatcher(props.actionMiddleware);
  }

  bindFunctions() {
    this.handleAction = this.handleAction.bind(this);
    this.triggerActionFlow = this.triggerActionFlow.bind(this);
    this.getState = this.getState.bind(this);
  }

  initialiseState(initialState) {
    this.state = initialState || {};
  }

  initialiseActionHandlers(actionHandlers) {
    this.actionHandlers = {};
    this.addActionHandlers(actionHandlers || {});
  }

  initialiseActionFlows(actionFlows) {
    this.actionFlows = actionFlows || {};
  }

  addActionHandlers(actionHandlers) {
    if (Array.isArray(actionHandlers)) {
      actionHandlers.forEach(actionHandlersObject => {
        this.addActionHandlers(actionHandlersObject);
      });
    } else {
      Object.keys(actionHandlers).forEach(actionType => {
        if (!this.actionHandlers[actionType]) {
          this.actionHandlers[actionType] = [];
        }

        this.actionHandlers[actionType].push(actionHandlers[actionType]);
      });
    }
  }

  getChildContext() {
    return {
      store: this.state,
      dispatchAction: this.dispatchAction,
      triggerActionFlow: this.triggerActionFlow,
    };
  }

  render() {
    return React.Children.only(this.props.children);
  }

  getState() {
    return this.state;
  }

  handleAction(action) {
    const handlers = this.actionHandlers[action.type];

    if (handlers && handlers.length > 0) {
      let newState = this.state;
      handlers.forEach(
        handler => (newState = handler(newState, action.payload))
      );
      this.setState(newState);

      return newState;
    } else {
      console.error('There are no handlers for action type:', action.type);
      return this.state;
    }
  }

  initialiseDispatcher(middleware) {
    this.dispatchAction = this.handleAction;

    if (middleware && middleware.length > 0) {
      this.applyMiddleware(middleware);
    }
  }

  applyMiddleware(allMiddleware) {
    let next = this.dispatchAction;
    allMiddleware
      .concat()
      .reverse()
      .forEach(middleware => (next = middleware(next, this.getState)));

    this.dispatchAction = next;
  }

  triggerActionFlow(flowName, payload) {
    const actionFlow = this.actionFlows[flowName];

    if (actionFlow) {
      actionFlow(this.dispatchAction, payload);
    } else {
      console.error('There is no action flow with name:', flowName);
    }
  }
}

ReflactionProvider.propTypes = {
  initialState: PropTypes.any,
  actionHandlers: PropTypes.any,
  actionFlows: PropTypes.any,
  actionMiddleware: PropTypes.any,
  children: PropTypes.element,
};
ReflactionProvider.childContextTypes = {
  store: PropTypes.any,
  dispatchAction: PropTypes.func,
  triggerActionFlow: PropTypes.func,
};
