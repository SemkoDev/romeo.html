import React from 'react'
import { Route, Switch } from 'react-router'
import { withRouter } from 'react-router-dom'
import prettyMs from 'pretty-ms'
import { Menu, Icon, Header, Label } from 'semantic-ui-react'
import { version } from '../../../package'

import classes from './page-menu-item.css';

class PageMenuItem extends React.Component {
  render () {
    const { page: { page }, current, history, topMenu, onClick } = this.props;
    const jobQueued = page.jobs.find(job => !job.isStarted && !job.isFinished);
    const jobRunning = page.jobs.find(job => job.isStarted && !job.isFinished);
    const jobPending = jobRunning || jobQueued;
    const jobFailed = page.jobs.find(job => job.isFailed && job.isFinished);
    const jobFinished = page.jobs.find(job => !job.isFailed && job.isFinished);
    const { isCurrent } = page;
    const changePage = () => {
      !topMenu && !current && history.push(`/page/${page.index + 1}`);
      onClick();
    };
    const icon = jobPending || page.isSyncing
      ? <Icon name='spinner' loading />
      : <Icon name={ isCurrent ? 'file' : 'file outline' } />;
    const subtext = jobPending
      ? jobPending.opts.description
      : jobFailed
        ? `FAILED: ${jobFailed.opts.description}`
        : <LastSynced lastSynced={page.lastSynced} />;

    const addresses = Object.values(page.addresses);
    const txs = addresses.reduce((t, i) => t + Object.keys(i.transactions).length, 0);
    const tags = (
      <span className='tags'>
          <Label size='mini'>
            {addresses.length} addresses
          </Label>
          <Label size='mini'>
            {txs} TXs
          </Label>
        </span>
    );

    return (
      <Menu.Item className={topMenu ? 'topMenu' : ''}
        onClick={changePage} active={current}>
        <Header as='h4' textAlign='left' color={isCurrent ? 'purple' : 'grey'}>
          {icon}
          <Header.Content>
            Page #{page.index + 1}
            {tags}
            <Header.Subheader>
              {subtext}
            </Header.Subheader>
          </Header.Content>
        </Header>
      </Menu.Item>
    )
  }
}

class LastSynced extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      currentTime: new Date()
    };
    this.timer = null;
  }

  componentDidMount () {
    this.timer = setInterval(
      () => this.setState({ currentTime: new Date()}),
      1000);
  }

  componentWillUnmount () {
    clearInterval(this.timer);
  }

  render() {
    const { currentTime } = this.state;
    const { lastSynced } = this.props;
    return (
      <span>{
        lastSynced
          ? `Last synced ${prettyMs(currentTime - lastSynced, { compact: true })} ago`
          : 'Not synced'
      }</span>
    );
  }
}

export default withRouter(PageMenuItem);
