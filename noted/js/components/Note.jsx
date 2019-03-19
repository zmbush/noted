// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import axios from 'axios';
import PropTypes from 'prop-types';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import InputBase from '@material-ui/core/InputBase';
import { withStyles } from '@material-ui/core/styles';

import BindKeyboard from 'components/BindKeyboard';

const styles = {
  bodyRoot: {
    width: '100%',
  },
  bodyEditor: {
    fontFamily: 'Roboto Mono',
  },
};

class Note extends React.Component {
  static propTypes = {
    new: PropTypes.bool,
    note: PropTypes.exact({
      id: PropTypes.number,
      title: PropTypes.string.isRequired,
      body: PropTypes.string,
    }),
    updateNote: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      edit: false,
    };
  }

  saveShortcut = e => {
    e.preventDefault();
    this.save();
  };

  save = async () => {
    let result;
    if (this.props.new) {
      result = await axios.put('/api/note', {
        title: this.state.title,
        body: this.state.body,
      });
    } else {
      result = await axios.patch(`/api/notes/${this.props.note.id}`, {
        title: this.state.title,
        body: this.state.body,
      });
    }

    this.props.updateNote(result.data);

    this.setState({
      edit: false,
    });
  };

  startEdit = () => {
    this.setState({
      title: this.props.note.title,
      body: this.props.note.body,
      edit: true,
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <BindKeyboard keys='ctrl+s' callback={this.saveShortcut} >
        <Card>
          <CardHeader
            title={
              this.state.edit ? (
                <InputBase
                  value={this.state.title}
                  onChange={e => {
                    this.setState({ title: e.target.value });
                  }}
                  style={{ fontSize: 'inherit' }}
                />
              ) : (
                this.props.note.title
              )
            }
            action={
              <IconButton
                onClick={this.state.edit ? this.save : this.startEdit}
              >
                {this.state.edit ? <SaveIcon /> : <EditIcon />}
              </IconButton>
            }
          />
          <CardContent>
            {this.state.edit ? (
              <InputBase
                value={this.state.body}
                onChange={e => {
                  this.setState({ body: e.target.value });
                }}
                style={{ fontSize: 'inherit' }}
                classes={{
                  root: classes.bodyRoot,
                  multiline: classes.bodyEditor,
                }}
                multiline
                rows={15}
              />
            ) : (
              <ReactMarkdown>{this.props.note.body}</ReactMarkdown>
            )}
          </CardContent>
        </Card>
      </BindKeyboard>
    );
  }
}

export default withStyles(styles)(Note);
