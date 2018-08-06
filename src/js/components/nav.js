import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import { Breadcrumb } from 'semantic-ui-react';
import { findRouteName } from '../romeo';

const BreadcrumbsItem = ({ match, history, ...rest }) => {
  const routeName = findRouteName(match.url);
  if (routeName) {
    return match.isExact ? (
      <Breadcrumb.Section active>{routeName}</Breadcrumb.Section>
    ) : (
      <span>
        <Breadcrumb.Section link onClick={() => history.push(match.url || '')}>
          {routeName}
        </Breadcrumb.Section>
        <Breadcrumb.Divider icon="right chevron" />
      </span>
    );
  }
  return null;
};

const Breadcrumbs = ({ location: { pathname }, ...rest }) => {
  const paths = [];
  pathname.split('/').reduce((prev, curr, index) => {
    paths[index] = `${prev}/${curr}`;
    return paths[index];
  });
  return (
    <div style={{ marginBottom: 10, height: 17 }}>
      <Breadcrumb size="large" className="ellipsible" style={{ width: '100%' }}>
        {paths.map(p => <Route path={p} key={p} component={BreadcrumbsItem} />)}
      </Breadcrumb>
    </div>
  );
};

export default withRouter(props => (
  <div>
    <Route path="/:path" component={Breadcrumbs} />
  </div>
));
