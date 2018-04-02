import React from 'react'
import { Route, Switch } from 'react-router'
import { withRouter } from 'react-router-dom'
import { Menu, Icon, Header, Label } from 'semantic-ui-react'
import { get } from '../romeo'
import { formatIOTAAmount } from '../utils'

import classes from './page-menu-item.css';

class AddressMenuItem extends React.Component {
  render () {
    const {
      address: { address, balance, spent, keyIndex, transactions },
      selected,
      history,
      match: { params }
    } = this.props;
    const checkedAddress = get().iota.utils.addChecksum(address);
    const currentAddress = params && params.address;
    const pageIndex = params && params.page;
    const current = address === currentAddress && currentAddress.slice(0, 81);
    const selectAddress = () => history.push(current
      ? `/page/${pageIndex}`
      : `/page/${pageIndex}/address/${checkedAddress}`);

    const tags = (
      <span className='tags'>
          <Label size='mini'>
            <Icon name='balance'/> {formatIOTAAmount(balance).short}
          </Label>
          <Label size='mini'>
            {Object.keys(transactions).length} TXs
          </Label>
        </span>
    );

    return (
      <Menu.Item onClick={selectAddress} active={selected}>
        <Header as='h4' textAlign='left'
          color={
            spent
              ? balance > 0
                ? 'red'
                : 'grey'
              : balance > 0
                ? 'purple'
                : 'green'}>
          <Icon name={
            spent
              ? balance > 0
                ? 'exclamation triangle'
                : 'external square'
              : balance > 0
                ? 'square'
                : 'square outline' } />
          <Header.Content>
            Address #{keyIndex + 1}
            {tags}
            <Header.Subheader className='menuSubHeader'>
              {checkedAddress}
            </Header.Subheader>
          </Header.Content>
        </Header>
      </Menu.Item>
    )
  }
}

export default withRouter(AddressMenuItem);
