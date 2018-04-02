import React from 'react'
import { connect } from "react-redux"
import { Route, Switch } from 'react-router'
import prettyMs from 'pretty-ms'
import { Icon, Header } from 'semantic-ui-react'


function OnlineMonitor ({ isOnline, checkingOnline, provider }) {
  return (
    <Header as='h5' color={isOnline ? 'green' : 'red'}>
      <Icon name={checkingOnline ? 'spinner' : 'signal'}
        loading={checkingOnline} />
      <Header.Content>
        {isOnline
          ? `online (ping: ${prettyMs(isOnline)})`
          : 'offline'}
        <Header.Subheader>
          {provider}
        </Header.Subheader>
      </Header.Content>
    </Header>
  )
}

function mapStateToProps (state) {
  return {
    isOnline: state.romeo.isOnline,
    checkingOnline: state.romeo.checkingOnline,
    provider: state.romeo.provider
  }
}

export default connect(mapStateToProps)(OnlineMonitor)