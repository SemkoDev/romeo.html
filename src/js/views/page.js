import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { Link, Redirect } from 'react-router-dom';
import { Grid, Message, Responsive, Button } from 'semantic-ui-react';
import Nav from '../components/nav';
import { get, linkToCurrentPage, isCurrentIndex, isPageTooBig } from '../romeo';
import AddressMenu from '../components/address-menu';
import TXTable from '../components/tx-table';

import classes from './page.css';

class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAddresses: false
    }
  }
  render() {
    const { page, address, addressObject } = this.props;
    const { showAddresses } = this.state;
    const invalidAddress = address && !addressObject;

    if (!page) {
      return <Redirect to={linkToCurrentPage()} />;
    }

    const pageLink = `/page/${page.keyIndex + 1}`;

    if (invalidAddress) {
      return <Redirect to={pageLink} />;
    }

    return (
      <span>
        <Nav />
        {this.showNotifications()}
        <Responsive as={Grid} minWidth={960}>
          <Grid.Row>
            <Grid.Column largeScreen={12} computer={11} tablet={10} mobile={16}>
              <TXTable address={addressObject} page={page} />
            </Grid.Column>
            <Grid.Column largeScreen={4} computer={5} tablet={6} mobile={16}>
              <AddressMenu page={page} selectedAddress={address} />
            </Grid.Column>
          </Grid.Row>
        </Responsive>
        <Responsive as={Grid} maxWidth={959}>
          <Grid.Row>
            <Grid.Column mobile={16}>
              <Button.Group fluid>
              <Button
                active={!showAddresses}
                onClick={() => this.setState({ showAddresses: false})}>
                Transactions
              </Button>
              <Button
                active={showAddresses}
                onClick={() => this.setState({ showAddresses: true})}>
                Addresses
              </Button>
            </Button.Group>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            {
              !showAddresses
              ? (
                <Grid.Column mobile={16}>
                  <TXTable address={addressObject} page={page} />
                </Grid.Column>
                )
              : (
                <Grid.Column mobile={16}>
                  <AddressMenu page={page} selectedAddress={address} />
                </Grid.Column>
                )
            }
          </Grid.Row>
        </Responsive>
      </span>
    );
  }

  showNotifications() {
    const romeo = get();
    const { page, location } = this.props;
    const { isSyncing, index } = page.page;
    const pageObject = romeo.pages.getByIndex(index).page;
    const sync = () => {
      !isSyncing && romeo.pages.syncPage(pageObject, true, 40);
    };
    const archived = !isCurrentIndex(page.keyIndex);
    const notifications = [];

    if (!archived && isPageTooBig(page)) {
      notifications.push(
        <Message
          info
          key="toobig"
          icon="balance"
          header="This page is getting too big!"
          content={
            <span>
              This page has either to many addresses or transactions. Big pages
              tend to sync slower. You can&nbsp;
              <Link to={'/page/new'}>
                archive this page and create a new one
              </Link>, passing the whole balance to the new page. <br />
              <strong>
                Make sure there are no pending payments to any addresses on this
                page
              </strong>
              &nbsp;as archived pages should not be used any more.
            </span>
          }
        />
      );
    }

    if (archived) {
      notifications.push(
        <Message
          key="oldpage"
          icon="file outline"
          header="This page is archived"
          content={
            <span>
              It is not auto-synced any more. You can still{' '}
              <a href={`#${location.pathname}`} onClick={sync}>
                do it manually
              </a>, however.<br />
              You should not use this page to receive or send transactions any
              more. Please{' '}
              <Link to={linkToCurrentPage()}>use the latest page</Link> and its
              addresses.
            </span>
          }
        />
      );
    }

    if (archived && page.page.balance !== 0) {
      notifications.push(
        <Message
          warning
          key="oldbalance"
          icon="balance"
          header="Balance on an archived page!"
          content={
            <span>
              The archived pages should not be used any more. Make sure to give
              your payers an address from the current page. Please{' '}
              <Link to={`/page/${index + 1}/transfer`}>transfer</Link> the
              balance to the current page as soon as possible.
            </span>
          }
        />
      );
    }

    if (page.page.hasSPA) {
      notifications.push(
        <Message
          error
          key="spa"
          icon="at"
          header="Spent positive balance (SPA) address detected!"
          content={
            <span>
              A positive balance has been detected on an address({
                page.page.hasSPA.address
              }) that already has been spent from. Reusing old addresses that
              were already spent from is dangerous in a sense that the key{' '}
              <strong>of this address</strong> can be easily guessed by an evil
              party. This makes it possible for an evil party to transfer the
              funds <strong>from that address only</strong>
              should it be used again in the future. <br />
              <strong>What can you do?</strong>
              <ul>
                <li>
                  Make sure that your payers gets a new, unspent address (shown
                  green on your current page).
                </li>
                <li>
                  Make sure that no more transfers will be going into that
                  address any more.
                </li>
                <li>
                  <Link to={'/page/${index + 1}/transfer'}>
                    Transfer all the funds
                  </Link>{' '}
                  to an unspent address.
                </li>
                <li>Forget the SPA address. Forever.</li>
              </ul>
            </span>
          }
        />
      );
    }

    return <div className="notifications">{notifications}</div>;
  }
}

function mapStateToProps(state, props) {
  const { pages } = state.romeo;
  const { match: { params } } = props;
  const currentIndex = parseInt((params && params.page) || 0) - 1;
  const address = params && params.address;
  const page = pages.find(p => p.page.index === currentIndex);
  const addressObject =
    address && page && page.page.addresses[address.slice(0, 81)];
  return {
    page,
    address,
    addressObject
  };
}

export default connect(mapStateToProps)(Page);
