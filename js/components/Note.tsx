// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as PropTypes from 'prop-types';
import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';

import axios from 'axios';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import DeleteIcon from '@material-ui/icons/Delete';
import ChipInput from 'material-ui-chip-input';
import InputBase from '@material-ui/core/InputBase';
import { withStyles, WithStyles } from '@material-ui/core/styles';

import BindKeyboard from 'components/BindKeyboard';
import Tags from 'components/Tags';

const Autolinker = (titles: Map<string, Set<number>>) => (props: any) => {
  let body: React.ElementType[] = [props.children];
  titles.forEach((value, key) => {
    let newBody: React.ElementType[] = [];
    for (let part of body) {
      if (typeof part == 'string' || part instanceof String) {
        let split = part.split(key);
        if (split.length > 1) {
          let elements = split
            .reduce((r: React.ElementType[], a: string) => {
              r.push(a as React.ElementType);
              r.push(((
                <span style={{ color: 'red' }}>{key}</span>
              ) as unknown) as React.ElementType);
              return r;
            }, [])
            .slice(0, -1);
          console.log(elements);
          newBody = newBody.concat(elements);
        } else {
          newBody.push(part);
        }
      } else {
        newBody.push(part);
      }
    }
    body = newBody;
  });
  console.log(body);
  return body;
};

const styles = {
  bodyRoot: {
    width: '100%',
  },
  bodyEditor: {
    fontFamily: 'Roboto Mono',
  },
};

interface Props extends WithStyles<typeof styles> {
  new?: boolean;
  note: {
    id?: number;
    title: string;
    body?: string;
    tags: string[];
  };
  titles: Map<string, Set<number>>;
  updateNote: (note?: { id: number }) => void;
  matches?: {
    indices: number[][];
    value: string;
    key: string;
    arrayIndex: number;
  }[];
}

const initialState = {
  edit: false,
  title: '',
  body: '',
  tags: new Array<String>(),
};

type State = Readonly<typeof initialState>;

class Note extends React.Component<Props, State> {
  mainInput: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);
    this.state = initialState;
    this.mainInput = React.createRef();
  }

  cancelEdit = (e: React.SyntheticEvent | Event) => {
    e.preventDefault();
    if (this.state.body == this.props.note.body) {
      this.setState({ edit: false });
      this.props.updateNote(null);
    }
  };

  saveShortcut = (e: React.SyntheticEvent | Event) => {
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

    result = await axios.put(
      `/api/notes/${result.data.id}/tags`,
      this.state.tags
    );

    this.setState({
      edit: false,
    });

    this.props.updateNote(result.data);
  };

  startEdit = () => {
    this.setState(
      {
        title: this.props.note.title,
        body: this.props.note.body,
        tags: this.props.note.tags,
        edit: true,
      },
      () => {
        let e = this.mainInput.current;
        e.focus();
        e.setSelectionRange(e.value.length, e.value.length);
      }
    );
  };

  addTag = (tag: string) => {
    this.setState({
      tags: [...this.state.tags, tag],
    });
  };

  deleteTag = (tag: string, index: number) => {
    this.state.tags.splice(index, 1);
    this.setState({
      tags: this.state.tags,
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <BindKeyboard keys='ctrl+s' callback={this.saveShortcut}>
        <BindKeyboard keys='esc' callback={this.cancelEdit}>
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
                this.state.edit ? (
                  <IconButton onClick={this.save}>
                    <SaveIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={this.startEdit}>
                    <EditIcon />
                  </IconButton>
                )
              }
            />
            <CardContent>
              {this.state.edit ? (
                <>
                  <ChipInput
                    classes={{}}
                    placeholder='Tags'
                    fullWidth
                    dataSource={[
                      'arc:Delmirev',
                      'type:Location',
                      'type:Character',
                    ]}
                    value={this.state.tags}
                    onAdd={this.addTag}
                    onDelete={this.deleteTag}
                  />
                  <InputBase
                    inputRef={this.mainInput}
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
                </>
              ) : (
                <>
                  <Tags tags={this.props.note.tags} />
                  <ReactMarkdown
                    renderers={{
                      text: (Autolinker(
                        this.props.titles
                      ) as unknown) as React.ElementType,
                    }}
                  >
                    {this.props.note.body}
                  </ReactMarkdown>
                </>
              )}
            </CardContent>
          </Card>
        </BindKeyboard>
      </BindKeyboard>
    );
  }
}

export type InnerNote = Note;

export default withStyles(styles)(Note);
