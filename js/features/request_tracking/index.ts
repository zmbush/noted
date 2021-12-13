// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { createSelector } from 'reselect';

import { useSelector } from 'react-redux';

import { AppState } from 'features/redux/store';

import { prefix as slicePrefix, RequestTrackingState } from './slice';

const getRequestTracking = (state: AppState): RequestTrackingState => state[slicePrefix];
const prefixSelector = (_: any, { prefix }: { prefix: string }) => prefix;
export const getIsLoading = createSelector(
  getRequestTracking,
  prefixSelector,
  (tracking, prefix) => prefix in tracking.inProgress,
);

export const useIsLoading = (prefix: string) =>
  useSelector((state: AppState) => getIsLoading(state, { prefix }));
