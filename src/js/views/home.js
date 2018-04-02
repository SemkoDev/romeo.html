import React from 'react'
import {connect} from 'react-redux'
import {Route, Switch} from 'react-router'
import {Link, Redirect} from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import {Sidebar, Menu, Segment, Icon, Header, Popup, Modal, Button } from 'semantic-ui-react'
import {version} from '../../../package'
import {terminateRomeo} from '../reducers/romeo';
import {logout, get, linkToCurrentPage} from '../romeo';
import PageMenu from '../components/page-menu';
import CurrentPageMenuItem from '../components/current-page-menu-item';
import OnlineMonitor from '../components/online-monitor';
import Page from "./page";
import Loading from "./loading";

import classes from './home.css';

class Home extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      showMenu: false,
      backingUp: false
    };
    this.toggleMenu = this.toggleMenu.bind(this);
    this.backupLedger = this.backupLedger.bind(this);
    this._downloadTxtFile = this._downloadTxtFile.bind(this);
  }

  render() {
    const { showMenu } = this.state;
    const { pages } = this.props;
    const pageMenu = () => <PageMenu pages={pages} onClick={this.toggleMenu} />;

    if (!pages || !pages.length) {
      return <Loading/>
    }
    return (
      <Sidebar.Pushable as={Segment}>
        <Sidebar as={Menu} animation='push' width='wide' visible={showMenu} icon='labeled' vertical>
          <Switch>
            <Route path='/page/:page' component={pageMenu}/>
            <Route component={pageMenu}/>
          </Switch>
        </Sidebar>
        <Sidebar.Pusher className='pusher'>
          {this.renderTopMenu()}
          <Segment basic className='mainContent'>
            <ToastContainer autoClose={3000} />
            <Switch>
              <Route path='/page/:page/address/:address' component={Page}/>
              <Route path='/page/:page' component={Page}/>
              <Route component={() => <Redirect to={linkToCurrentPage()}/>} />
            </Switch>
          </Segment>
          {this.renderBottomMenu()}
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    )
  }

  renderTopMenu () {
    const { showMenu, backingUp } = this.state;
    const { pages } = this.props;
    const romeo = get();

    if (!pages || !pages.length) {
      return <div>loading...</div>
    }

    return (
      <Menu attached='top' icon className='mainMenu'>
        <Popup position='bottom center'
               trigger={
                 <Menu.Item onClick={this.toggleMenu}>
                   <Icon color='grey' name={showMenu ? 'folder open' : 'folder'} size='big' />
                 </Menu.Item>
               }
               content='Show/hide pages menu'
        />
        <Menu.Item>
          <Header as='h4' textAlign='left' color='purple'>
            <Icon name='book' />
            <Header.Content>
              Ultra-Light Ledger
              <Header.Subheader>
                CarrIOTA Romeo v.{version}
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Menu.Item>
        <Route path='/page/:page' component={
          () => <CurrentPageMenuItem pages={pages} onClick={this.toggleMenu}/>
        }/>
        <Menu.Menu position='right'>
          <Popup position='bottom center'
                 trigger={
                   <Menu.Item>
                     <Header as='h3' color='violet'>
                       {romeo.keys.checksum}
                     </Header>
                   </Menu.Item>
                 }
                 content={
                   <span>
                  Next time you login this checksum should match! &nbsp;
                     <strong>Remember it!</strong>
                </span>
                 }
          />
          <Popup position='bottom center'
                 trigger={
                   <Menu.Item onClick={this.backupLedger}>
                     <Icon name={backingUp ? 'spinner' : 'save'}
                           color='violet' size='big' loading={backingUp} />
                   </Menu.Item>
                 }
                 content='Save cached encrypted ledger from browser database to a file. Useful in case of a snapshot or if you want to restore the whole database in a new browser without waiting for sync.'
          />
          {this.renderLogout()}
        </Menu.Menu>
      </Menu>
    )
  }

  renderLogout () {
    const { backingUp } = this.state;
    const trigger = (
     <Menu.Item><Icon name='power' color='red' size='big' /></Menu.Item>
    );
    return (
      <Modal trigger={trigger} basic size='tiny' className='mainModal' style={{ marginTop: 0 }}>
        <Header icon='save' content='Have you backed up the cached ledger?' />
        <Modal.Content>
          <p>
            The backup is useful if you want to use Romeo on another computer/browser.
            You can restore the cached ledger on login using the backup file.
          </p>
          <p>
            The ledger is also easier to restore after the snapshot if there is a backup
            file. In case you clear your browser's cache right before the snapshot and
            you do not have a backup file, the restoration will take manual steps.
          </p>
          <p>
            Generally, it is a good idea to backup at least every other login.
            The backup is stored encrypted and is as secure as any seed protection.
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button basic color='green'
            inverted onClick={this.backupLedger} disabled={backingUp}>
            <Icon name={backingUp ? 'spinner' : 'save'} loading={backingUp} />
            Download backup
          </Button>
          <Button color='red' inverted  onClick={() => location.reload()}>
            <Icon name='checkmark' /> Yes, logout
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  renderBottomMenu () {
    const romeo = get();

    return (
      <Menu attached='bottom' className='bottomMenu'>
        <Menu.Menu position='right'>
          <Popup position='top center'
           trigger={
             <Menu.Item onClick={romeo.checkOnline}>
             <OnlineMonitor/>
             </Menu.Item>}
           content='Click to check connectivity' />
        </Menu.Menu>
      </Menu>
    )
  }

  toggleMenu () {
    const { showMenu } = this.state;
    this.setState({ showMenu: !showMenu })
  }

  backupLedger () {
    this.setState({ backingUp: true });
    get().db.backup(true).then(this._downloadTxtFile);
  }

  _downloadTxtFile (data) {
    const element = document.createElement("a");
    const file = new Blob([data], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `romeo.backup.txt`;
    element.click();
    this.setState({ backingUp: false });
  }
}

function mapStateToProps(state) {
  return {
    romeo: state.romeo,
    pages: state.romeo && state.romeo.pages
      .slice().sort((a, b) => b.keyIndex - a.keyIndex)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    logout: () => logout().then(() => dispatch(terminateRomeo()))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

function old() {
  return <div>Home!
    <Link to="/page/abcd">Page</Link>
    <Route path='/page/:page' component={Page}/>
  </div>
}
