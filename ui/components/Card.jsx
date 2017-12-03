// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

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
