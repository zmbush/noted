// @flow

import { createFragmentContainer } from 'react-relay';
import React from 'react';
import Card from '~/ui/components/Card';
import { graphql } from 'react-relay';
import type { Cards_me } from './__generated__/Cards_me.graphql';
import type { Card_card } from './__generated__/Card_card.graphql';

type Props = {
  me: Cards_me & {
    cards: [Card_card]
  },
};

class Cards extends React.Component<Props> {
  render() {
    const { cards } = this.props.me;

    return cards.map(card => <Card key={ card.id } card={ card } />);
  }
}

export default createFragmentContainer(
  Cards,
  graphql`
    fragment Cards_me on User {
      cards {
        id
        ...Card_card
      }
    }
  `,
);
