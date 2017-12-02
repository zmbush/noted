// @flow

import React from 'react';
import Card from 'ui/components/Card';
import { graphql, createFragmentContainer } from 'react-relay';

// eslint-disable-next-line camelcase
import type { CardList_me } from './__generated__/CardList_me.graphql';
import styles from './style.scss';

type Props = {
  me: CardList_me, // eslint-disable-line camelcase
};

const CardList = ({ me: { cards } }: Props) => (
  <div className={styles.contents}>
    { cards.map((card: any) => <Card className={styles.card} key={card.id} card={card} />) }
  </div>
);

export default createFragmentContainer(
  CardList,
  graphql`
    fragment CardList_me on User {
      cards {
        id
        ...Card_card
      }
    }
  `,
);
