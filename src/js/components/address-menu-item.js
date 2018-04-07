import React from 'react';
import { Route, Switch } from 'react-router';
import { withRouter } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { Menu, Icon, Header, Label, Popup } from 'semantic-ui-react';
import { get } from '../romeo';
import { formatIOTAAmount } from '../utils';
import { copyData } from './current-page-menu-item';

import classes from './page-menu-item.css';

class AddressMenuItem extends React.Component {
  render() {
    const {
      address: { address, balance, rawBalance, spent, keyIndex, transactions },
      currentPage,
      selected,
      history,
      match: { params }
    } = this.props;
    const romeo = get();
    const checkedAddress = romeo.iota.utils.addChecksum(address);
    const pageIndex = params && params.page;
    const spa = balance > 0 && rawBalance > 0;
    const selectAddress = () =>
      history.push(
        selected
          ? `/page/${pageIndex}`
          : `/page/${pageIndex}/address/${checkedAddress}`
      );
    const copyAddress = e => {
      e.stopPropagation();
      e.preventDefault();
      copyData(romeo.iota.utils.addChecksum(address), 'Address copied!', 'at');
    };
    const text = spent ? (
      spa ? (
        <span>
          <Header as="h5" color="red">
            Spent address with funds!
          </Header>
          Transfer to another address ASAP and never use this address again!
        </span>
      ) : (
        <span>
          <Header as="h5" color="red">
            NOT usable!
          </Header>
          Spent address! Do not send funds here!
        </span>
      )
    ) : balance > 0 ? (
      rawBalance > 0 ? (
        <span>
          <Header as="h5" color="green">
            Usable!
          </Header>
          Address has positive balance, but has not been spent.
        </span>
      ) : (
        <span>
          <Header as="h5" color="red">
            NOT usable!
          </Header>
          An outgoing transaction is pending. Do not send funds here!
        </span>
      )
    ) : (
      <span>
        <Header as="h5" color="green">
          Usable!
        </Header>
        Empty address with no balance.
      </span>
    );

    const tags = (
      <span className="tags">
        <Label size="mini">
          <Icon name="balance" /> {formatIOTAAmount(balance).short}
        </Label>
        <Label size="mini">{Object.keys(transactions).length} TXs</Label>
      </span>
    );
    const qrcode =
      selected && (!spent || spa) ? (
        <Popup
          position="left center"
          trigger={
            <div className="qrcode" onClick={copyAddress}>
              <QRCode value={romeo.iota.utils.addChecksum(address)} size={256} />
            </div>
          }
          content="Click to copy the address!"
        />
      ) : (
        ''
      );

    return (
      <Menu.Item onClick={selectAddress} active={selected}>
        <Popup
          position="left center"
          trigger={
            <Header
              as="h4"
              textAlign="left"
              color={
                spent
                  ? spa ? 'red' : 'grey'
                  : balance > 0 ? 'purple' : currentPage ? 'green' : 'grey'
              }
            >
              <Icon
                name={
                  spent
                    ? spa ? 'exclamation triangle' : 'external square'
                    : balance > 0 ? 'square' : 'square outline'
                }
              />
              <Header.Content>
                Address #{keyIndex + 1}
                {tags}
                <Header.Subheader className="menuSubHeader ellipsible">
                  {checkedAddress}
                </Header.Subheader>
              </Header.Content>
            </Header>
          }
          content={text}
        />
        {qrcode}
      </Menu.Item>
    );
  }
}

export default withRouter(AddressMenuItem);
