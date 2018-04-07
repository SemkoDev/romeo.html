import React from 'react';
import { Route, Switch } from 'react-router';
import { withRouter, Redirect } from 'react-router-dom';
import { Menu, Icon, Header, Popup } from 'semantic-ui-react';
import copy from 'copy-to-clipboard';
import { version } from '../../../package';
import { get, linkToCurrentPage, showInfo } from '../romeo';
import { formatIOTAAmount } from '../utils';
import PageMenuItem from './page-menu-item';

class CurrentPageMenuItem extends React.Component {
  render() {
    const { pages, match: { params }, onClick, history } = this.props;
    const currentIndex = parseInt((params && params.page) || 0) - 1;
    const romeo = get();

    if (currentIndex < 0 || isNaN(currentIndex)) {
      return null;
    }

    const page = pages.find(p => p.page.index === currentIndex);
    if (!page) {
      return <Redirect to={linkToCurrentPage()} />;
    }
    const { isSyncing, index } = page.page;
    const pageObject = romeo.pages.getByIndex(index).page;
    const sync = () => {
      !isSyncing && romeo.pages.syncPage(pageObject, true, 40);
    };
    const balance = pageObject.getBalance();
    const currentAddress = pageObject.getCurrentAddress();
    const copyAddress = () =>
      copyData(
        romeo.iota.utils.addChecksum(currentAddress.address),
        'Current address copied!',
        'at'
      );

    const addressButton = currentAddress ? (
      <Popup
        position="bottom center"
        trigger={
          <Menu.Item onClick={copyAddress}>
            <Icon name="at" color="pink" size="big" />
          </Menu.Item>
        }
        content="Copy current address to clipboard."
      />
    ) : null;

    const popupContent = isSyncing ? (
      'This page is currently syncing.'
    ) : (
      <span>
        <strong>Sync this page</strong>. Note: the most recent page periodically
        auto-synchronises!
      </span>
    );

    return (
      <Menu.Menu position="left">
        <PageMenuItem page={page} topMenu onClick={onClick} />
        <Popup
          position="bottom center"
          trigger={
            <Menu.Item onClick={sync}>
              <Icon
                name="refresh"
                color={isSyncing ? 'green' : 'yellow'}
                size="big"
                loading={isSyncing}
              />
            </Menu.Item>
          }
          content={popupContent}
        />
        <Popup
          position="bottom center"
          trigger={
            <Menu.Item
              onClick={() =>
                copyData(balance, 'Current balance copied!', 'balance')
              }
            >
              <Header as="h3" color="violet">
                <Icon name="balance" />
                <Header.Content>
                  {formatIOTAAmount(balance).short}
                </Header.Content>
              </Header>
            </Menu.Item>
          }
          content="Current page balance. Click to copy."
        />
        <Popup
          position="bottom center"
          trigger={
            <Menu.Item
              onClick={() =>
                copyData(page.page.seed, 'Current seed copied!', 'key')
              }
            >
              <Icon name="key" color="grey" size="big" />
            </Menu.Item>
          }
          content={
            <span>
              Copy page seed to clipboard. <br />
              <strong>Keep your seeds SAFE and NEVER share them!</strong>
            </span>
          }
        />
        {addressButton}
        <Popup
          position="bottom center"
          trigger={
            <Menu.Item
              onClick={() => {
                history.push(`/page/${currentIndex + 1}/transfer`);
              }}
              disabled={balance < 1}
            >
              <Icon
                name="send"
                color={balance > 0 ? 'green' : 'grey'}
                size="big"
              />
            </Menu.Item>
          }
          content={
            balance > 0
              ? 'Send a new transfer'
              : 'Not enough funds to send transfers!'
          }
        />
      </Menu.Menu>
    );
  }
}

export function copyData(data, message = 'Copied!', icon = 'check') {
  copy(data);
  showInfo(
    <span>
      <Icon name={icon} />
      {message}
    </span>
  );
}

export default withRouter(CurrentPageMenuItem);
