import React from 'react';
import deepEqual from 'fast-deep-equal';

export default function(WrappedComponent) {
  return class extends React.Component {
    shouldComponentUpdate(nextProps) {
      const props = { ...nextProps };
      if (!props.children || !props.children.length) {
        delete props.children;
      }
      const update = !deepEqual(this.props, props);
      return update;
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}
