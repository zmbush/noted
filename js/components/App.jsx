// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Fuse from 'fuse.js';
import classNames from 'classnames';

import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import InputBase from '@material-ui/core/InputBase';
import { fade } from '@material-ui/core/styles/colorManipulator';
import Button from '@material-ui/core/Button';

import Note from 'components/Note';
import BindKeyboard from 'components/BindKeyboard';

const styles = theme => ({
  root: {
    width: '100%',
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  contentRoot: {
    marginTop: 75,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit,
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': {
        width: 200,
      },
    },
  },
  newButton: {
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  iconSmall: {
    fontSize: 20,
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notes: [],
      search: '',
    };

    this.searchInput = React.createRef();
  }

  componentDidMount() {
    document.title = `noted`;

    const fetchData = async () => {
      const result = await axios('/api/notes');
      let notes = {};
      for (let note of result.data) {
        notes[note.id] = note;
      }
      this.setState({ notes });
    };

    fetchData();
  }

  updateNote = note => {
    this.state.notes[note.id] = note;
    this.setState({ notes: this.state.notes });
  };

  renderNotes(classes) {
    if (this.state.search != '') {
      let fuse = new Fuse(Object.values(this.state.notes), {
        shouldSort: true,
        includeMatches: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['title', 'body'],
      });

      let elements = [];
      let results = fuse.search(this.state.search);
      if (results.length == 0 || results[0].item.title != this.state.search) {
        elements.push(
          <Grid item key='new' xs={12}>
            <Button
              variant='contained'
              color='primary'
              className={classes.newButton}
            >
              <AddIcon
                className={classNames(classes.leftIcon, classes.iconSmall)}
              />
              Add {this.state.search}
            </Button>
          </Grid>
        );
      }

      for (let n of results) {
        elements.push(
          <Grid item key={n.item.id} xs={12}>
            <Note
              note={n.item}
              matches={n.matches}
              updateNote={this.updateNote}
            />
          </Grid>
        );
      }
      return elements;
    } else {
      let notes = Object.values(this.state.notes).sort((a, b) => {
        var x = a.title;
        var y = b.title;
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
        return 0;
      });
      return notes.map(n => (
        <Grid item key={n.id} xs={12}>
          <Note note={n} updateNote={this.updateNote} />
        </Grid>
      ));
    }
  }

  startSearch = e => {
    e.preventDefault();
    this.searchInput.current.focus();
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar>
          <Toolbar>
            <IconButton
              className={classes.menuButton}
              aria-label='Menu'
              color='inherit'
            >
              <MenuIcon />
            </IconButton>
            <Typography
              className={classes.title}
              variant='h6'
              color='inherit'
              noWrap
            >
              Noted
            </Typography>
            <div className={classes.grow} />
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                inputProps={{
                  ref: this.searchInput,
                }}
                placeholder='Search...'
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                value={this.state.search}
                onChange={e => this.setState({ search: e.target.value })}
              />
            </div>
          </Toolbar>
        </AppBar>
        <Grid container spacing={16} className={classes.contentRoot}>
          {this.renderNotes(classes)}
        </Grid>

        <BindKeyboard keys='/' callback={this.startSearch} />
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
