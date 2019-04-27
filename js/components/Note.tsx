// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Suspense } from 'react';
import { connect } from 'react-redux';
import htmlParser from 'react-markdown/plugins/html-parser';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';

import axios from 'axios';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import EditIcon from '@material-ui/icons/Edit';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import ReactLoading from 'react-loading';
import {
  createStyles,
  withStyles,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';

import 'codemirror/lib/codemirror.css';
import 'tui-editor/dist/tui-editor.min.css';
import 'tui-color-picker/dist/tui-color-picker.css';

import { NoteData } from 'data/types';
import BindKeyboard from 'components/BindKeyboard';
import Tags from 'components/Tags';
import AutoLink from 'components/AutoLink';
import NoteList from 'components/NoteList';
import { AppState } from 'data/types';
import { getLinkIds, getSubnotes } from 'data/selectors';

const NoteEditor = React.lazy(() =>
  import(/* webpackChunkName: "editor" */ 'components/NoteEditor')
);

const styles = (theme: Theme) =>
  createStyles({
    bodyRoot: {
      width: '100%',
    },
    card: {
      '@media print': {
        border: 'none',
        boxShadow: 'none',
        //pageBreakInside: 'avoid',
      },
    },
    unlinked: {
      border: '5px solid red',
    },
    bodyEditor: {
      fontFamily: 'Roboto Mono',
    },
    markdown: {
      '& p': {
        '@media print': {
          //pageBreakInside: 'avoid',
          //display: 'inline-block',
          //margin: 0,
          textIndent: theme.spacing.unit,
        },
      },
      '& blockquote': {
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        borderLeftColor: theme.palette.secondary.dark,

        paddingLeft: theme.spacing.unit,
        '@media print': {
          margin: 0,
        },
      },
      '& a': {
        '@media print': {
          textDecoration: 'none',
          color: 'black',
        },
      },
      '& table': {
        borderCollapse: 'collapse',
        borderSpacing: 0,
        width: '100%',

        '& thead': {
          fontWeight: 800,
          display: 'table-row-group',

          '& th': {
            verticalAlign: 'bottom',
            paddingBottom: '.3em',
            paddingLeft: '.1em',
            paddingRight: '.1em',
          },
        },
        '& tbody': {
          '& tr:nth-child(2n+1)': {
            backgroundColor: '#E0E5C1',
          },
        },
      },
      '@media print': {
        '& h1, & h2, & h3, & h4, & h5': {
          color: '#58180D',
        },
        '& h1': {
          fontSize: '.705cm',
        },
        '& h2': {
          fontSize: '.529cm',
          borderBottom: '2px solid #c9ad6a',
        },
        '& h3': {
          fontSize: '.458cm',
          marginBottom: 0,
        },
        '& h4': {
          fontSize: '.423cm',
          marginBottom: '.2em',
        },
      },
    },
    noPrint: {
      '@media print': {
        display: 'none',
      },
    },
    cardHeader: {
      '@media print': {
        paddingBottom: 0,
        paddingTop: 0,
        '& span': {
          color: '#58180D',
          fontSize: '.987cm',
        },
      },
    },
    cardContent: {
      '@media print': {
        paddingTop: 0,
      },
    },
    loadingSpinner: {
      position: 'relative',
      left: '50%',
      top: '50%',
      marginTop: -32,
      marginLeft: -32,
    },
  });

interface Props extends WithStyles<typeof styles> {
  new?: boolean;
  note: NoteData;
  search: string;
  titles: Map<string, Set<number>>;
  subnotes: Map<number, NoteData>;
  updateNote: (note?: NoteData) => void;
  matches?: {
    indices: number[][];
    value: string;
    key: string;
    arrayIndex: number;
  }[];
}

const initialState = {
  edit: false,
  creating_subnote: false,
};

type State = Readonly<typeof initialState>;

class Note extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = initialState;
  }

  cancelEdit = () => {
    this.setState({ edit: false, creating_subnote: false });
    // this.props.updateNote(null);
  };

  save = async (note: {
    title: string;
    body: string;
    tags: string[];
    parent_note_id?: number;
  }) => {
    const { title, body, tags, parent_note_id } = note;
    let result;
    if (this.props.new || this.state.creating_subnote) {
      result = await axios.put('/api/secure/note', {
        title,
        body,
        parent_note_id,
      });
    } else {
      result = await axios.patch(`/api/secure/notes/${this.props.note.id}`, {
        title,
        body,
        parent_note_id,
      });
    }

    result = await axios.put(`/api/secure/notes/${result.data.id}/tags`, tags);

    this.setState({
      edit: false,
      creating_subnote: false,
    });

    this.props.updateNote(result.data);
  };

  startEdit = () => {
    this.setState({
      edit: true,
    });
  };

  startSubnoteCreate = () => {
    this.setState({
      creating_subnote: true,
    });
  };

  render() {
    const { classes } = this.props;
    const parseHtml = htmlParser({
      isValidNode: (node: { type: string }) => node.type !== 'script',
    });

    return (
      <Card
        className={classNames(classes.card, {
          [classes.unlinked]: this.props.note.user_id == 1,
        })}
      >
        <CardHeader
          className={classes.cardHeader}
          title={this.props.note.title}
          action={
            this.state.edit
              ? null
              : [
                  <IconButton
                    onClick={this.startSubnoteCreate}
                    className={classes.noPrint}
                    aria-label='Add Subnote'
                  >
                    <LibraryAddIcon />
                  </IconButton>,
                  <IconButton
                    onClick={this.startEdit}
                    className={classes.noPrint}
                    aria-label='Edit Note'
                  >
                    <EditIcon />
                  </IconButton>,
                ]
          }
        />
        <CardContent className={classes.cardContent}>
          <Dialog
            classes={{ root: classes.markdown }}
            open={this.state.edit || this.state.creating_subnote}
            fullWidth
            maxWidth='lg'
            onClose={this.cancelEdit}
          >
            <Suspense
              fallback={
                <ReactLoading
                  type='spin'
                  className={classes.loadingSpinner}
                  color='#000000'
                />
              }
            >
              <NoteEditor
                open={this.state.edit}
                onSave={this.save}
                note={
                  this.state.edit
                    ? this.props.note
                    : {
                        title: '',
                        body: '',
                        tags: [],
                        parent_note_id: this.props.note.id,
                      }
                }
              />
            </Suspense>
          </Dialog>
          <Tags tags={this.props.note.tags} />
          <ReactMarkdown
            className={classes.markdown}
            renderers={{
              text: props => <AutoLink titles={this.props.titles} {...props} />,
            }}
            escapeHtml={false}
            astPlugins={[parseHtml]}
          >
            {this.props.note.body}
          </ReactMarkdown>

          <Grid container spacing={8}>
            <NoteList
              notes={this.props.subnotes}
              search={this.props.search}
              updateNote={this.props.updateNote}
            />
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

export type InnerNote = Note;

const mapStateToProps = (state: AppState, props: { note: NoteData }) => ({
  titles: getLinkIds(state.notes),
  subnotes: getSubnotes(state.notes, props.note.id),
});

export default connect(mapStateToProps)(withStyles(styles)(Note));
