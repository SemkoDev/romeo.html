import React from 'react';
import { withRouter } from 'react-router-dom';
import { Icon, Header, Button, Menu } from 'semantic-ui-react';
import { get } from '../romeo';
import PageMenuItem from './page-menu-item';
import deepHoc from './deep-hoc';

class PageMenu extends React.Component {
  render() {
    const { pages, match: { params }, onClick, history } = this.props;
    const currentIndex = parseInt((params && params.page) || 0) - 1;
    const pageNotification =
      pages.length < 2 ? (
        <Header as="h4" icon color="grey" style={{ padding: 10 }}>
          <Icon name="search" />
          No more pages
          <Header.Subheader>
            <p>
              As you add new pages, they will appear here. Missing some pages?
              First, make sure your login details (checksum:{' '}
              <strong>{get().keys.checksum}</strong>) are correct. If there was
              a snapshot, use your backup on login. If you did not create a
              backup, use the manual restoration tool:
            </p>
            <Button>Manual Page Restore coming soon!</Button>
          </Header.Subheader>
        </Header>
      ) : null;

    return (
      <div>
        <Menu.Item
          onClick={() => {
            history.push('/page/new');
            onClick();
          }}
        >
          <Header as="h4" textAlign="left" color="green">
            <Icon name="asterisk" />
            <Header.Content>
              Add a new page
              <Header.Subheader>
                +transfer all funds from the previous page
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Menu.Item>
        {pages.map(page => (
          <PageMenuItem
            page={page}
            key={page.page.index}
            onClick={onClick}
            current={currentIndex === page.page.index}
          />
        ))}
        {pageNotification}
      </div>
    );
  }
}

export default withRouter(deepHoc(PageMenu));
