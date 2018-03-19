import React from 'react';
import PropTypes from 'prop-types';

export function connectToReflaction(wrappedComponent) {
  class ReflactionConnector extends React.Component {
    render() {
      return React.createElement(
        wrappedComponent,
        Object.assign({}, this.props, {
          store: this.context.store,
          dispatchAction: this.context.dispatchAction,
          triggerActionFlow: this.context.triggerActionFlow,
        })
      );
    }
  }

  ReflactionConnector.contextTypes = {
    store: PropTypes.any,
    dispatchAction: PropTypes.func,
    triggerActionFlow: PropTypes.func,
  };

  return ReflactionConnector;
}
