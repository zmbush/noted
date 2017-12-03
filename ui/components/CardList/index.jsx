// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

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
