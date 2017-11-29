// @flow

import { createFragmentContainer } from 'react-relay';
import { graphql } from 'react-relay';
import React from 'react';
import type { Card_card } from './__generated__/Card_card.graphql';

type Props = {
  card: Card_card,
};

class Card extends React.Component<Props> {
  render() {
    const { card } = this.props;

    return (
      <div>
        <h1>{ card.title }</h1>
        { card.contents }
      </div>
    );
  }
}

export default createFragmentContainer(
  Card,
  graphql`
    fragment Card_card on Card {
      title
      contents
    }
  `,
);
