// @flow

import React from 'react';
import Card from 'ui/components/Card';
import { graphql, createFragmentContainer } from 'react-relay';
// eslint-disable-next-line camelcase
import type { Cards_me } from './__generated__/Cards_me.graphql';

type Props = {
  me: Cards_me, // eslint-disable-line camelcase
};

class Cards extends React.Component<Props> {
  render() {
    const { cards } = this.props.me;

    return cards.map((card: any) => <Card key={card.id} card={card} />);
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
