import React from 'react';
import PropTypes from 'prop-types';

export default class ReflactionProvider extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = props.initialState || {};

    this.actionHandlers = {};
    this.addActionHandlers(props.actionHandlers || {});

    this.actionFlows = props.actionFlows || {};

    this.dispatchAction = this.dispatchAction.bind(this);
    this.triggerActionFlow = this.triggerActionFlow.bind(this);
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

  dispatchAction(type, payload) {
    const handlers = this.actionHandlers[type];

    if (handlers && handlers.length > 0) {
      let newState = this.state;
      handlers.forEach(handler => (newState = handler(newState, payload)));
      this.setState(newState);
    } else {
      console.error('There are no handlers for action type:', type);
    }
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
  initialState: PropTypes.any.isRequired,
  actionHandlers: PropTypes.any.isRequired,
  actionFlows: PropTypes.any.isRequired,
  children: PropTypes.element.isRequired,
};
ReflactionProvider.childContextTypes = {
  store: PropTypes.any,
  dispatchAction: PropTypes.func,
  triggerActionFlow: PropTypes.func,
};
