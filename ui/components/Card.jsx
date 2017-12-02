// @flow

import { createFragmentContainer, graphql } from 'react-relay';
import React from 'react';
import { Card as UiCard, CardTitle, CardText } from 'material-ui/Card';

// eslint-disable-next-line camelcase
import type { Card_card } from './__generated__/Card_card.graphql';

type Props = {
  card: Card_card, // eslint-disable-line camelcase
  className: ?string,
};

const Card = ({ className, card: { title, contents } }: Props) => (
  <UiCard className={className}>
    <CardTitle title={title} />
    <CardText>
      { contents }
    </CardText>
  </UiCard>
);

export default createFragmentContainer(
  Card,
  graphql`
    fragment Card_card on Card {
      title
      contents
    }
  `,
);
