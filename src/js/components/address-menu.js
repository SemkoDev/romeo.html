import React from 'react'
import { Icon, Header, Menu } from 'semantic-ui-react'
import { get } from '../romeo'
import AddressMenuItem from './address-menu-item'

export default class AddressMenu extends React.Component {
  constructor (props) {
    super(props);
    this.addNewAddress = this.addNewAddress.bind(this);
  }
  render () {
    const { page, selectedAddress } = this.props;
    const addresses = Object.values(page.page.addresses)
      .sort((a, b) => b.keyIndex - a.keyIndex);
    const adding = page.page.jobs.find(j => j.opts.type === 'NEW_ADDRESS' && !j.isFinished);

    return (
      <Menu vertical size='huge'>
        <Menu.Item onClick={this.addNewAddress} disabled={!!adding}>
          <Header as='h4' textAlign='left' color='green'>
            <Icon name={adding ? 'spinner' : 'asterisk'} loading={!!adding} />
            <Header.Content>
              {adding ? 'Adding new address' : 'Add new address'}
            </Header.Content>
          </Header>
        </Menu.Item>
        {addresses.map(address => (
          <AddressMenuItem address={address} key={address.address}
           selected={selectedAddress && selectedAddress === address.address}/>
        ))}
      </Menu>
    )
  }

  addNewAddress () {
    const { page } = this.props;
    const pageObject = get().pages.getByIndex(page.page.index).page;
    pageObject.getNewAddress();
  }
}
