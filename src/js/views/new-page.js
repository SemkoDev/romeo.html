import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import {
  Grid,
  Message,
  Header,
  Segment,
  Button,
  Icon
} from 'semantic-ui-react';
import { get, linkToCurrentPage, showInfo } from '../romeo';

class NewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      adding: false
    };
    this.addPage = this.addPage.bind(this);
  }

  render() {
    const { adding } = this.state;
    return (
      <span>
        <Grid>
          <Grid.Row>
            <Grid.Column computer={12} tablet={16}>
              <Header as="h2">Add a new page</Header>
              <Segment basic style={{ padding: 0 }} loading={adding}>
                <Message
                  info
                  icon="file"
                  header="As your current page gets bigger, create a new one!"
                  content={
                    <span>
                      Big pages sync slower. To make sure your ledger is updated
                      and loaded as fast as possible, it is a good idea to
                      create a new page once in a while. The process is
                      following:
                      <ol>
                        <li>
                          A new page seed is generated and attached to your
                          ledger.
                        </li>
                        <li>A new address is generated on the new page.</li>
                        <li>
                          The balance from the oldest page (if any) is
                          transferred to the new page's address.
                        </li>
                      </ol>
                      The whole process should not take more than a few minutes.
                      The old balance should be available to spend on the new
                      page within 5-10 minutes (as soon as the transaction is
                      confirmed).
                      <p>Are you ready?</p>
                      <center>
                        <Button
                          onClick={this.addPage}
                          color="olive"
                          size="large"
                          loading={adding}
                          disabled={adding}
                        >
                          Add a new page
                        </Button>
                      </center>
                    </span>
                  }
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </span>
    );
  }

  addPage() {
    const { history } = this.props;
    const romeo = get();

    this.setState({ adding: true });
    romeo.newPage().then(() => {
      this.setState({ adding: false });
      history.push(linkToCurrentPage());
      showInfo(
        <span>
          <Icon name="file" /> New page added!
        </span>
      );
    });
  }
}

function mapStateToProps(state, props) {
  return {};
}

export default connect(mapStateToProps)(NewPage);
