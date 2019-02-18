import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

export function connectToReflaction(wrappedComponent, mapReflactionToProps) {
  if (!mapReflactionToProps || typeof mapReflactionToProps !== 'function') {
    mapReflactionToProps = identity => identity;
  }

  class ReflactionConnector extends React.Component {
    render() {
      return React.createElement(
        wrappedComponent,
        Object.assign(
          {},
          this.props,
          mapReflactionToProps({
            store: this.context.store,
            dispatchAction: this.context.dispatchAction,
            triggerActionFlow: this.context.triggerActionFlow,
          })
        )
      );
    }
  }

  ReflactionConnector.contextTypes = {
    store: PropTypes.any,
    dispatchAction: PropTypes.func,
    triggerActionFlow: PropTypes.func,
  };

  ReflactionConnector.displayName = `Connected(${getDisplayName(
    wrappedComponent
  )})`;

  hoistNonReactStatics(ReflactionConnector, wrappedComponent);

  return ReflactionConnector;
}

function getDisplayName(wrappedComponent) {
  return wrappedComponent.displayName || wrappedComponent.name || 'Component';
}
