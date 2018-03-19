import React from 'react';
import PropTypes from 'prop-types';

export function connectComponentToStore(wrappedComponent) {
  class StoreConnector extends React.Component {
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

  StoreConnector.contextTypes = {
    store: PropTypes.any,
    dispatchAction: PropTypes.func,
    triggerActionFlow: PropTypes.func,
  };

  return StoreConnector;
}
