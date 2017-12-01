// @flow

import { createFragmentContainer, graphql } from 'react-relay';
import React from 'react';
// eslint-disable-next-line camelcase
import type { Card_card } from './__generated__/Card_card.graphql';

type Props = {
  card: Card_card, // eslint-disable-line camelcase
};

const Card = (props: Props) => {
  const { title, contents } = props.card;

  return (
    <div>
      <h1>{ title }</h1>
      { contents }
    </div>
  );
};

export default createFragmentContainer(
  Card,
  graphql`
    fragment Card_card on Card {
      title
      contents
    }
  `,
);
