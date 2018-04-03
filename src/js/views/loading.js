import React from 'react'
import { connect } from 'react-redux'
import { Segment, Icon, Header, Dimmer } from 'semantic-ui-react'

function LoadingView ({ jobs, isOnline, provider }) {
  let info = '';
  const jobQueued = jobs.find(job => !job.isStarted && !job.isFinished);
  const jobRunning = jobs.find(job => job.isStarted && !job.isFinished);
  const pendingJob = jobRunning || jobQueued;
  const jobFailed = jobs.find(job => job.isFailed && job.isFinished);
  const jobFinished = jobs.find(job => !job.isFailed && job.isFinished);
  if (!isOnline) {
    info = `No connection to ${provider}. Connect and refresh this page!`;
  } else if (jobFailed){
    info = `FAILED: ${jobFailed.opts.description}`;
  } else if (pendingJob) {
    info = 'Syncing pages';
  } else if (jobFinished) {
    info = 'Starting Ultra-Light Ledger...'
  }
  return (
    <Dimmer.Dimmable as={Segment} dimmed>
      <div style={{ height: '100%' }}>
        &nbsp;
      </div>
      <Dimmer active style={{ paddingTop: '10%' }}>
        <Header as='h2' icon inverted>
          <Icon name='spinner' loading />
          <Header.Content>
            Loading CarrIOTA Romeo
            <Header.Subheader>
              {info}
            </Header.Subheader>
          </Header.Content>
        </Header>
      </Dimmer>
    </Dimmer.Dimmable>
  )
}

function mapStateToProps (state) {
  return {
    jobs: state.romeo.jobs,
    provider: state.romeo.provider,
    isOnline: state.romeo.isOnline
  }
}

export default connect (mapStateToProps)(LoadingView)