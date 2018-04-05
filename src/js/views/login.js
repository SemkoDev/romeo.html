import React from 'react';
import romeo from 'romeo.lib';
import { connect } from 'react-redux';
import ReactFileReader from 'react-file-reader';
import { Redirect } from 'react-router-dom';
import {
  Container,
  Grid,
  Form,
  Button,
  Label,
  Header,
  Icon,
  Transition,
  Menu
} from 'semantic-ui-react';
import { version } from '../../../package';
import { updateRomeo } from '../reducers/romeo';
import { login } from '../romeo';

import classes from './login.css';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loading: false,
      file: null,
      fileError: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFiles = this.handleFiles.bind(this);
  }

  componentDidMount() {
    if (this.userInput) {
      setTimeout(() => this.userInput.focus(), 10);
    }
  }

  render() {
    const { isLoggedIn, fromPath } = this.props;

    if (isLoggedIn) {
      return <Redirect to={{ pathname: fromPath || '/' }} />;
    }

    return (
      <div className="loginPage">
        <Container className="loginContainer">
          <Transition transitionOnMount animation="fade up">
            <Grid divided>
              <Grid.Row columns={4} centered stretched>
                <Grid.Column mobile={4} stretched>
                  <Header as="h2" icon color="purple">
                    <Icon name="book" />
                    CarrIOTA Romeo
                    <Header.Subheader>
                      Ultra-Light Ledger v.{version}
                    </Header.Subheader>
                  </Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row columns={4} centered stretched>
                <Grid.Column mobile={4} stretched>
                  {this.renderForm()}
                </Grid.Column>
                <Grid.Column mobile={4} stretched>
                  <p>
                    Please enter your username and password. If no ledgers exist
                    with the given credentials, a new one will be generated.
                  </p>
                  <p>
                    Spaces, unicode, emticons, everything is allowed. Make sure
                    to check (and remember) your checksum when the login button
                    becomes enabled - this is the only way to be sure that you
                    entered correct details!
                  </p>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Transition>
        </Container>
        {this.renderBottomMenu()}
      </div>
    );
  }

  renderForm() {
    const { username, password, loading } = this.state;

    const userLabel = romeo.utils.validate.isUsername(username).valid ? null : (
      <Label pointing color="red">
        10+ chars, 1 uppercase
      </Label>
    );

    const passwordLabel = romeo.utils.validate.isPassword(password)
      .valid ? null : (
      <Label pointing color="red">
        12+ chars, 1 uppercase, 1 number, 1 symbol
      </Label>
    );

    const ready = !userLabel && !passwordLabel;
    const checksumLabel = ready ? (
      <Label size="large" color="yellow">
        {romeo.crypto.keys.getKeys(username, password).checksum}
      </Label>
    ) : null;
    const checksumCheckLabel = ready ? (
      <Label size="large" pointing="left">
        Checksum?
      </Label>
    ) : null;

    return (
      <Form onSubmit={this.handleSubmit} loading={loading}>
        <Form.Field>{this.renderUpload()}</Form.Field>
        <Form.Field>
          <label>Username</label>
          <input
            type="password"
            name="username"
            ref={input => {
              this.userInput = input;
            }}
            onChange={this.handleChange}
          />
          {userLabel}
        </Form.Field>
        <Form.Field>
          <label>Password</label>
          <input type="password" name="password" onChange={this.handleChange} />
          {passwordLabel}
        </Form.Field>
        <Button type="submit" disabled={!ready}>
          Login
        </Button>
        {checksumLabel} {checksumCheckLabel}
      </Form>
    );
  }

  renderUpload() {
    const { file, fileError } = this.state;
    const color = file ? 'green' : fileError ? 'red' : null;
    const text = file
      ? 'Backup uploaded!'
      : fileError ? 'Wrong format!' : 'Upload backup file first (if any)';
    return (
      <ReactFileReader
        handleFiles={this.handleFiles}
        fileTypes={['.txt']}
        multipleFiles={false}
      >
        <Button icon fluid color={color} type="button">
          <Icon name="upload" /> &nbsp;
          {text}
        </Button>
      </ReactFileReader>
    );
  }

  renderBottomMenu() {
    return (
      <Menu fixed="bottom" className="bottomMenu">
        <Menu.Item>
          Crafted with &nbsp;<Icon
            name="heart"
            color="red"
            style={{ display: 'inline-block' }}
          />{' '}
          at&nbsp;
          <a href="https://twitter.com/RomanSemko" target="_blank">
            SemkoDev
          </a>
        </Menu.Item>
        <Menu.Item>
          <Icon name="paw" color="grey" /> No animals have been harmed when
          crafting this software
        </Menu.Item>
      </Menu>
    );
  }

  handleChange({ target: { name, value } }) {
    this.setState({ [name]: value });
  }

  handleSubmit() {
    const { login } = this.props;
    const { username, password, file } = this.state;
    const u = romeo.utils.validate.isUsername(username).valid;
    const p = romeo.utils.validate.isPassword(password).valid;
    if (u && p) {
      this.setState({ loading: true }, () => login(username, password, file));
    }
  }

  handleFiles(files) {
    const reader = new FileReader();
    reader.onload = e => {
      const text = reader.result;
      try {
        const json = JSON.parse(text);
        const wrongFormat = !!json.find(j => !j.data || !j._id);
        if (wrongFormat) {
          this.setState({ file: null, fileError: true });
          return;
        }
        this.setState({ file: text, fileError: false });
      } catch (e) {
        this.setState({ file: null, fileError: true });
      }
    };

    reader.readAsText(files[0], 'utf-8');
  }
}

function mapStateToProps(state) {
  return {
    isLoggedIn: state.romeo && state.romeo.keys && true,
    fromPath:
      state.router.location &&
      state.router.location.state &&
      state.router.location.state.from &&
      state.router.location.state.from.pathname
  };
}

function mapDispatchToProps(dispatch) {
  return {
    login: (username, password, file) => {
      login(username, password, romeo => dispatch(updateRomeo(romeo)), file);
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
