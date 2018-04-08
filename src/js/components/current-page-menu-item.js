import React from 'react';
import { Route, Switch } from 'react-router';
import { withRouter, Redirect } from 'react-router-dom';
import { Menu, Icon, Header, Popup, Responsive } from 'semantic-ui-react';
import copy from 'copy-to-clipboard';
import { version } from '../../../package';
import { get, linkToCurrentPage, showInfo } from '../romeo';
import { formatIOTAAmount } from '../utils';
import PageMenuItem from './page-menu-item';

class CurrentPageMenuItem extends React.Component {
  render() {
    const { pages, match: { params }, onClick, history, mobile } = this.props;
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
        'Latest address copied!',
        'at'
      );
    const closeOnMobileClick = (f) => {
      if (mobile) onClick();
      f();
    }

    const addressItem = currentAddress ? (
      <Menu.Item onClick={() => closeOnMobileClick(copyAddress)} key='address'>
        <Icon name="at" color="pink" size="big" />
        { mobile ? 'Copy latest addr' : ''}
      </Menu.Item>
    ) : null;
    const refreshItem = (
      <Menu.Item onClick={() => closeOnMobileClick(sync)} key='refresh'>
        <Icon
          name="refresh"
          color={isSyncing ? 'green' : 'yellow'}
          size="big"
          loading={isSyncing}
        />
        { mobile ? 'Sync page' : ''}
      </Menu.Item>
    );
    const balanceItem = (
      <Menu.Item
        key='balance'
        onClick={() => closeOnMobileClick(() =>
          copyData(balance, 'Current balance copied!', 'balance'))
        }
      >
        {
          mobile
            ? ([
                <Icon key='a' name="balance" color="violet" />,
                <span key='b'>
                  Balance: {formatIOTAAmount(balance).short}
                </span>
              ])
            : (
              <Header as="h3" color="violet">
                <Icon name="balance" />
                <Header.Content>
                  {formatIOTAAmount(balance).short}
                </Header.Content>
              </Header>
            )
        }
      </Menu.Item>
    );
    const seedItem = (
      <Menu.Item
        key='seed'
        onClick={() => closeOnMobileClick(() =>
          copyData(page.page.seed, 'Current seed copied!', 'key'))
        }
      >
        <Icon name="key" color="grey" size="big" />
        { mobile ? 'Copy page seed' : ''}
      </Menu.Item>
    );
    const transferItem = (
      <Menu.Item
        key='transfer'
        onClick={() => closeOnMobileClick(() => {
          history.push(`/page/${currentIndex + 1}/transfer`);
        })}
        disabled={balance < 0}
      >
        <Icon
          name="send"
          color={balance >= 0 ? 'green' : 'grey'}
          size="big"
        />
        { mobile ? 'Send transfer' : ''}
      </Menu.Item>
    );

    if (mobile) {
      return [ refreshItem, balanceItem, seedItem, addressItem, transferItem ];
    }

    const addressButton = currentAddress ? (
      <Responsive as={Popup} minWidth={600}
        position="bottom center"
        trigger={addressItem}
        content="Copy latest address to clipboard."
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
        <Responsive as={Popup} minWidth={425}
          position="bottom center"
          trigger={refreshItem}
          content={popupContent}
        />
        <Responsive as={Popup} minWidth={755}
          position="bottom center"
          trigger={balanceItem}
          content="Current page balance. Click to copy."
        />
        <Responsive as={Popup} minWidth={665}
          position="bottom center"
          trigger={seedItem}
          content={
            <span>
              Copy page seed to clipboard. <br />
              <strong>Keep your seeds SAFE and NEVER share them!</strong>
            </span>
          }
        />
        {addressButton}
        <Responsive as={Popup} minWidth={535}
          position="bottom center"
          trigger={transferItem}
          content={
            balance >= 0
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
