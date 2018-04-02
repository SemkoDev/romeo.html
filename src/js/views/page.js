import React from 'react'
import { connect } from "react-redux";
import { Route, Switch } from 'react-router'
import { withRouter, Link, Redirect } from 'react-router-dom'
import {Sidebar, Menu, Segment, Icon, Header, Popup, Modal, Button, Grid } from 'semantic-ui-react'
import Nav from '../components/nav'
import { get, linkToCurrentPage } from '../romeo'
import AddressMenu from "../components/address-menu";

class Page extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    const { page, address, addressObject } = this.props;
    const invalidAddress = address && !addressObject;

    if(!page) {
      return <Redirect to={linkToCurrentPage()}/>
    }

    const pageLink = `/page/${page.keyIndex+1}`;

    if(invalidAddress) {
      return <Redirect to={pageLink}/>
    }

    return (
      <span>
        <Nav/>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <Segment>
                TXs
              </Segment>
            </Grid.Column>
            <Grid.Column width={4}>
              <AddressMenu page={page} selectedAddress={address}/>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </span>
    );
  }
}

function mapStateToProps (state, props) {
  const { pages } = state.romeo;
  const { match: { params } } = props;
  const currentIndex = parseInt((params && params.page) || 0) - 1;
  const address = params && params.address;
  const page = pages.find(p => p.page.index === currentIndex);
  const addressObject = address && page && page.page.addresses[address.slice(0,81)];
  return {
    page,
    address,
    addressObject
  }
}

export default connect(mapStateToProps)(Page);