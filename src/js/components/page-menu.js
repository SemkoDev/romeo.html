import React from 'react'
import { withRouter } from 'react-router-dom'
import { Icon, Header, Button, Menu } from 'semantic-ui-react'
import { get } from '../romeo'
import PageMenuItem from './page-menu-item'

// TODO: link to manual restoration tool
// TODO: link to new page tool
class PageMenu extends React.Component {
  render () {
    const { pages, match: { params }, onClick } = this.props;
    const currentIndex = parseInt((params && params.page) || 0) - 1;
    const pageNotification = pages.length < 2
      ? (
        <Header as='h2' icon color='grey'>
          <Icon name='search' />
          No more pages
          <Header.Subheader>
            <p>
              As you add new pages, they will appear here.
              Missing some pages? First, make sure your login details
              (checksum: <strong>{get().keys.checksum}</strong>) are correct.
              If there was a snapshot, use your backup on login. If you
              did not create a backup, try our manual restore tool:
            </p>
            <Button>
              Manual Page Restore
            </Button>
          </Header.Subheader>
        </Header>
      )
      : null;

    return (
      <div>
        <Menu.Item>
          <Header as='h4' textAlign='left' color='green'>
            <Icon name='asterisk' />
            <Header.Content>
              Add new page
              <Header.Subheader>
               +transfer all funds from the previous page
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Menu.Item>
        {pages.map(page => (
          <PageMenuItem page={page} key={page.page.index}
            onClick={onClick}
            current={currentIndex === page.page.index}/>
        ))}
        {pageNotification}
      </div>
    )
  }
}

export default withRouter(PageMenu);
